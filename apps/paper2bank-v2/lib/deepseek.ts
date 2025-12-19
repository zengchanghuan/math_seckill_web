import { tryParseJsonFromText } from './llmParse';
import type { DeepseekTaskPlan } from './types';

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
};

export async function deepseekTaskSolveOnce(args: {
  stem: string;
  options?: string[];
}): Promise<{ plan: DeepseekTaskPlan; rawText: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('Missing env DEEPSEEK_API_KEY');

  const system = `你是“高数题库解题规划器”。你必须只输出严格 JSON（不要 Markdown，不要多余文字）。\n\nSchema：\n{\n  \"task_type\": \"domain|limit|derivative|integral_definite|integral_indefinite|ode|series_radius|implicit_diff|partial|solve_equation|simplify|unknown\",\n  \"expr_latex\": \"...可选...\",\n  \"expr_sympy\": \"...可选（优先给 SymPy 可解析表达式）...\",\n  \"candidate_answer\": \"...可选...\",\n  \"candidate_analysis\": \"...可选...\",\n  \"notes\": \"...可选...\"\n}\n\n规则：\n- 不确定就 task_type=unknown，并把 candidate_answer 写成 \"【无法识别/无答案】\"。\n- 不要编造题目条件。\n- 若是不定积分，candidate_answer 必须带 +C。`;

  const user = `题目：\n${args.stem}\n\n选项：\n${(args.options ?? []).map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}\n`;

  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
  };

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`DeepSeek failed: ${res.status} ${t}`);
  }
  const json = (await res.json()) as DeepSeekChatResponse;
  const rawText = json.choices?.[0]?.message?.content ?? '';
  const plan = tryParseJsonFromText<DeepseekTaskPlan>(rawText) ?? {
    task_type: 'unknown',
    candidate_answer: '【无法识别/无答案】',
    candidate_analysis: '',
  };
  return { plan, rawText };
}




