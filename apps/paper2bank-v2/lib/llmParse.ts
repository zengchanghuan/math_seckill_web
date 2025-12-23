export function tryParseJsonFromText<T>(text: string): T | null {
  if (!text) return null;
  const s = text.trim();
  // 1) 直接 JSON
  try {
    return JSON.parse(s) as T;
  } catch {
    // ignore
  }
  // 2) 提取 ```json ... ```
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence?.[1]) {
    try {
      return JSON.parse(fence[1].trim()) as T;
    } catch {
      // ignore
    }
  }
  // 3) 提取最外层 { ... }
  const first = s.indexOf('{');
  const last = s.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const body = s.slice(first, last + 1);
    try {
      return JSON.parse(body) as T;
    } catch {
      // ignore
    }
  }
  return null;
}

export function normalizeAnswerText(v: string | undefined | null): string {
  if (!v) return '';
  let s = `${v}`.trim();
  try {
    s = s.normalize('NFKC');
  } catch {
    // ignore
  }
  // 去掉最外层 $...$（仅一层）
  if (s.startsWith('$') && s.endsWith('$') && s.length >= 2) {
    s = s.slice(1, -1).trim();
  }
  // 统一并集符号
  s = s.replace(/\\cup/g, '∪').replace(/U/g, '∪');
  // 去掉常见 LaTeX 包裹
  s = s.replace(/\\left/g, '').replace(/\\right/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}
