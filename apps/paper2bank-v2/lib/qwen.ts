import { tryParseJsonFromText } from './llmParse';
import type { ParseResult, Question } from './types';

type QwenResponse = {
  output?: {
    choices?: Array<{
      message?: {
        content?: Array<{ text?: string }> | string;
      };
    }>;
  };
};

function getTextFromQwen(resp: QwenResponse): string {
  const content = resp.output?.choices?.[0]?.message?.content;
  if (!content) return '';
  if (typeof content === 'string') return content;
  const t = content.map((c) => c.text ?? '').join('\n').trim();
  return t;
}

export async function qwenOcrQuestionsFromImages(args: {
  imagesBase64: string[];
}): Promise<ParseResult> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error('Missing env DASHSCOPE_API_KEY');

  const system = `你是“中文数学试卷 OCR 结构化器”。请将图片中的题目识别成 JSON。\n要求：\n- 输出必须是严格 JSON（不要 Markdown，不要解释）\n- 只输出一个对象：{ questions: [ { id, type, stem, options } ] }\n- stem/option 内的公式尽量用 LaTeX（允许 $...$），中文保持原样\n- id 从 1 开始递增（字符串或数字都可，但建议字符串）\n- 如果无法识别某题，仍输出该题，但 stem 写“【无法识别】...”`;

  const user = [
    { type: 'text', text: '请对以下图片进行 OCR 并抽取题目结构。' },
    ...args.imagesBase64.map((b64) => ({
      type: 'image',
      image: b64,
    })),
  ];

  const body = {
    model: 'qwen-vl-max-latest',
    input: {
      messages: [
        { role: 'system', content: [{ text: system }] },
        { role: 'user', content: user },
      ],
    },
    parameters: {
      temperature: 0.1,
    },
  };

  const res = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Qwen OCR failed: ${res.status} ${t}`);
  }
  const json = (await res.json()) as QwenResponse;
  const text = getTextFromQwen(json);
  const parsed = tryParseJsonFromText<{ questions?: Array<Partial<Question> & { id?: string | number }> }>(text);
  const qs = (parsed?.questions ?? []).map((q, idx) => ({
    id: `${q.id ?? idx + 1}`,
    type: q.type ?? 'unknown',
    stem: q.stem ?? '',
    options: q.options ?? [],
  }));
  return { questions: qs };
}

type QwenTextResponse = {
  output?: {
    text?: string;
    choices?: Array<{ message?: { content?: string } }>;
  };
};

function getTextFromQwenText(resp: QwenTextResponse): string {
  return (
    resp.output?.text ??
    resp.output?.choices?.[0]?.message?.content ??
    ''
  );
}

export async function qwenSolveOnce(args: {
  stem: string;
  options?: string[];
}): Promise<{ answer: string; analysis: string; rawText: string }> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error('Missing env DASHSCOPE_API_KEY');

  const system = `你是“高数题库解题助手（备选模型）”。请直接解题并输出严格 JSON（不要 Markdown，不要解释）。\n\nSchema：\n{\n  \"answer\": \"...\",\n  \"analysis\": \"...（3~8 行，给学生看）\"\n}\n\n规则：\n- 不确定就 answer 写 \"【备选方案-无法确定】\"，analysis 说明不确定原因。\n- 不定积分答案必须包含 +C。\n- 只输出 JSON。`;

  const user = `题目：\n${args.stem}\n\n选项：\n${(args.options ?? []).map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}\n`;

  // DashScope 文本生成（qwen-plus / qwen-max）
  const body = {
    model: 'qwen-plus',
    input: {
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    },
    parameters: { temperature: 0.2 },
  };

  const res = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Qwen solve failed: ${res.status} ${t}`);
  }
  const json = (await res.json()) as QwenTextResponse;
  const rawText = getTextFromQwenText(json).trim();

  const parsed = tryParseJsonFromText<{ answer?: string; analysis?: string }>(rawText);
  return {
    answer: parsed?.answer ?? '',
    analysis: parsed?.analysis ?? '',
    rawText,
  };
}


