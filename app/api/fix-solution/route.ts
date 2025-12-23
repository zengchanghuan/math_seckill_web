import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

const DEEPSEEK_API_KEY = 'sk-78c5eab3420c4135bc14691c936d6bad';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MAX_RETRIES = 2; // 最多重试2次

export async function POST(request: NextRequest) {
  try {
    const { question, answer, errorType } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    let attempts = 0;
    let fixedSolution = '';
    let verificationResult: any = null;

    while (attempts < MAX_RETRIES) {
      attempts++;

      // 调用 DeepSeek API
      fixedSolution = await callDeepSeekAPI(question, answer, errorType);

      // 验证答案
      verificationResult = await verifyAnswer(question, fixedSolution, answer);

      if (verificationResult.verified === true) {
        // 验证通过，返回结果
        return NextResponse.json({
          success: true,
          solution: fixedSolution,
          originalError: errorType,
          verification: verificationResult,
          attempts,
        });
      } else if (verificationResult.verified === null) {
        // 无法验证（题目类型不支持），直接返回
        return NextResponse.json({
          success: true,
          solution: fixedSolution,
          originalError: errorType,
          verification: {
            ...verificationResult,
            note: '题目类型不支持自动验证，已跳过验证步骤',
          },
          attempts,
        });
      }

      // 验证失败，记录并重试
      console.warn(`第${attempts}次验证失败:`, verificationResult);
    }

    // 所有尝试都失败
    return NextResponse.json({
      success: false,
      solution: fixedSolution,
      error: '验证失败',
      verification: verificationResult,
      attempts,
      message: `经过${attempts}次尝试，DeepSeek返回的答案仍无法通过验证`,
    });
  } catch (error) {
    console.error('Fix solution error:', error);
    return NextResponse.json(
      { error: '服务器错误', details: String(error) },
      { status: 500 }
    );
  }
}

async function callDeepSeekAPI(
  question: string,
  answer: string,
  errorType?: string
): Promise<string> {
  const prompt = `
题目：${question}

正确答案：${answer}

${errorType ? `原解析存在以下问题：${errorType}` : ''}

请提供详细的解题步骤和解析。要求：
1. 使用规范的数学表达式，所有数学公式用 $ 符号包裹
2. 步骤清晰完整
3. LaTeX 公式使用正确的语法：
   - 定积分求值使用 \\big| 或 \\bigg| 或 \\left. ... \\right|
   - 不要使用 \\left|\\limits 这种错误语法
4. 格式为：【精析】解析内容（一段话，不要分行）
5. 解析要简洁明了，突出关键步骤
6. **最后一定要明确指出答案是什么**（例如："故正确答案为 A" 或 "因此原积分 = π - 1"）

只返回解析内容，不要包含其他说明。
`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            '你是一位专业的高等数学教师，擅长解答积分、微分、极限等数学问题。请用规范的数学语言和LaTeX格式提供详细解析。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API Error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function verifyAnswer(
  question: string,
  solution: string,
  correctAnswer: string
): Promise<any> {
  try {
    // 调用 Python 验证脚本
    const scriptPath = path.join(process.cwd(), 'scripts', 'math_verifier.py');
    
    // 创建临时验证脚本
    const verifyScript = `
import sys
sys.path.append('${path.join(process.cwd(), 'scripts')}')
from math_verifier import MathVerifier
import json

verifier = MathVerifier()
question = ${JSON.stringify(question)}
solution = ${JSON.stringify(solution)}
answer = ${JSON.stringify(correctAnswer)}

result = verifier.verify(question, solution, answer)
print(json.dumps(result, ensure_ascii=False))
`;

    const { stdout, stderr } = await execAsync(
      `python3 -c ${JSON.stringify(verifyScript)}`,
      { timeout: 10000 }
    );

    if (stderr && !stderr.includes('Warning')) {
      console.error('Python stderr:', stderr);
    }

    return JSON.parse(stdout);
  } catch (error) {
    console.error('Verification error:', error);
    return {
      verified: null,
      reason: `验证过程出错: ${String(error)}`,
    };
  }
}

