/**
 * API路由：填空题转选择题
 * POST /api/convert-to-choice
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ConvertToChoiceRequest, ConvertToChoiceResult } from '@/types';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-78c5eab3420c4135bc14691c936d6bad';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 系统prompt
const SYSTEM_PROMPT = `你是"高等数学填空题转选择题"的命题与校验引擎。
目标：把 1 道填空题改写为单选题（4 选 1），降低输入成本，但保持区分度与真题风格。

【关键约束】
1) 必须只有 1 个正确选项；其余 3 个必须错误且"看起来合理"。
2) 干扰项必须来自"典型错误"：漏系数、符号错、代换错、基本公式误用、三角恒等变形错、分母漏掉 x 等。
3) 严禁出现与正确答案等价的干扰项（例如 π/6 与 30°，1 与 1.0 若等价需避免）。
4) 选项文本必须使用LaTeX格式，因为前端会用KaTeX渲染。例如：
   - 分数用 \\frac{a}{b}
   - 根号用 \\sqrt{x}
   - π用 \\pi
   - 积分用 \\int
   - 三角函数用 \\sin, \\cos, \\tan
   - 指数用 e^{x} 或 a^{b}
   - 对数用 \\ln(x) 或 \\log(x)
   **重要：** 不要用 $ 符号包裹，前端会自动处理。直接输出LaTeX表达式即可。
5) 若答案存在多种等价写法，你必须选择一种"规范表达"作为正确项，并避免其它等价写法作为干扰项。
6) 输出中必须包含自检信息：说明你如何确保"唯一正确"，以及每个干扰项对应的典型错因类型。

【输出 JSON Schema】
{
  "type": "single_choice",
  "stem": string,
  "options": [
    {"key":"A","text":string,"error_type":string},
    {"key":"B","text":string,"error_type":string},
    {"key":"C","text":string,"error_type":string},
    {"key":"D","text":string,"error_type":string}
  ],
  "correct_key": "A"|"B"|"C"|"D",
  "correct_text": string,
  "normalize_answer": string,
  "distractor_rationales": [
    {"key":"A","why_wrong_or_right":string},
    {"key":"B","why_wrong_or_right":string},
    {"key":"C","why_wrong_or_right":string},
    {"key":"D","why_wrong_or_right":string}
  ],
  "uniqueness_check": {
    "strategy": string,
    "equivalence_risks": string[],
    "passed": true
  }
}

你必须输出严格 JSON，禁止输出任何非 JSON 文本。`;

export async function POST(request: NextRequest) {
  try {
    const body: ConvertToChoiceRequest = await request.json();
    const { stem, answer, solution, knowledge } = body;

    if (!stem || !answer) {
      return NextResponse.json(
        { error: '缺少必要参数：stem 和 answer' },
        { status: 400 }
      );
    }

    // 构造用户prompt
    const knowledgeStr = knowledge && knowledge.length > 0 
      ? knowledge.join(', ') 
      : '未提供';

    const userPrompt = `
【输入】
stem: <<<${stem}>>>
answer: <<<${answer}>>>
solution: <<<${solution || '未提供'}>>>
knowledge: <<<${knowledgeStr}>>>
`;

    console.log('正在调用 DeepSeek API 转换题目...');
    console.log('题干:', stem);
    console.log('答案:', answer);

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }, // 强制JSON输出
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API 错误:', errorText);
      return NextResponse.json(
        { error: 'DeepSeek API 调用失败', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'API 返回内容为空' },
        { status: 500 }
      );
    }

    console.log('DeepSeek 返回内容:', content);

    // 解析JSON
    let result: ConvertToChoiceResult;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON 解析失败:', parseError);
      return NextResponse.json(
        { error: 'API 返回内容不是有效 JSON', content },
        { status: 500 }
      );
    }

    // 验证结果
    if (!validateConversionResult(result)) {
      return NextResponse.json(
        { error: '转换结果验证失败', result },
        { status: 500 }
      );
    }

    console.log('转换成功！正确答案:', result.correct_key);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('转换失败:', error);
    return NextResponse.json(
      { 
        error: '服务器内部错误', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * 验证转换结果的有效性
 */
function validateConversionResult(result: any): result is ConvertToChoiceResult {
  if (!result || typeof result !== 'object') return false;

  // 检查必要字段
  if (result.type !== 'single_choice') return false;
  if (!result.stem || typeof result.stem !== 'string') return false;
  if (!Array.isArray(result.options) || result.options.length !== 4) return false;
  if (!['A', 'B', 'C', 'D'].includes(result.correct_key)) return false;
  if (!result.correct_text || typeof result.correct_text !== 'string') return false;

  // 检查选项格式
  const keys = new Set<string>();
  for (const option of result.options) {
    if (!option.key || !['A', 'B', 'C', 'D'].includes(option.key)) return false;
    if (!option.text || typeof option.text !== 'string') return false;
    if (keys.has(option.key)) return false; // 重复key
    keys.add(option.key);
  }

  // 检查正确选项是否存在
  const correctOption = result.options.find(
    (opt: any) => opt.key === result.correct_key
  );
  if (!correctOption) return false;

  // 检查唯一性检查结果
  if (!result.uniqueness_check || typeof result.uniqueness_check !== 'object') return false;
  if (!result.uniqueness_check.strategy) return false;
  if (!Array.isArray(result.uniqueness_check.equivalence_risks)) return false;

  return true;
}

