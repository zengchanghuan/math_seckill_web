import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = 'sk-78c5eab3420c4135bc14691c936d6bad';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { question, answer, errorType } = await request.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 构建 prompt
    const prompt = `
题目：${question}

正确答案：${answer}

原解析存在以下问题：${errorType || 'LaTeX 语法错误'}

请提供详细的解题步骤和解析。要求：
1. 使用规范的数学表达式，所有数学公式用 $ 符号包裹
2. 步骤清晰完整
3. LaTeX 公式使用正确的语法：
   - 定积分求值使用 \\big| 或 \\bigg| 或 \\left. ... \\right|
   - 不要使用 \\left|\\limits 这种错误语法
4. 格式为：【精析】解析内容（一段话，不要分行）
5. 解析要简洁明了，突出关键步骤

只返回解析内容，不要包含其他说明。
`;

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的高等数学教师，擅长解答积分、微分、极限等数学问题。请用规范的数学语言和LaTeX格式提供详细解析。',
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
      console.error('DeepSeek API Error:', errorText);
      return NextResponse.json(
        { error: 'DeepSeek API 调用失败', details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    const fixedSolution = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      solution: fixedSolution,
      originalError: errorType,
    });
  } catch (error) {
    console.error('Fix solution error:', error);
    return NextResponse.json(
      { error: '服务器错误', details: String(error) },
      { status: 500 }
    );
  }
}

