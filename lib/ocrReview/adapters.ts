import type { OcrReviewState, OcrTaskMeta, ParseResult, QuestionVM, SolutionEntry } from './types';

function normalizeForDiff(v: string | undefined | null): string {
  if (!v) return '';
  // 1) 统一换行/空白
  let s = v.replace(/\r\n/g, '\n').trim();
  // 2) Unicode 归一（让 ∪ / 全角空格等更稳定）
  try {
    s = s.normalize('NFKC');
  } catch {
    // ignore
  }
  // 3) 去掉最外层 $...$（仅一层）
  if (s.startsWith('$') && s.endsWith('$') && s.length >= 2) {
    s = s.slice(1, -1).trim();
  }
  // 4) 常见 LaTeX 包装简化
  s = s
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

export function computeDiffWithFinal(questionAnswer: string, questionAnalysis: string, sol?: SolutionEntry): boolean {
  const finalAnswer = sol?.final?.answer ?? '';
  const finalAnalysis = sol?.final?.analysis ?? '';
  const a1 = normalizeForDiff(questionAnswer);
  const a2 = normalizeForDiff(finalAnswer);
  const b1 = normalizeForDiff(questionAnalysis);
  const b2 = normalizeForDiff(finalAnalysis);
  return Boolean((a1 && a2 && a1 !== a2) || (b1 && b2 && b1 !== b2));
}

export function adaptParseResultToState(raw: ParseResult): OcrReviewState {
  const meta: OcrTaskMeta = raw.meta ?? { importId: '' };
  const questions: QuestionVM[] = (raw.questions ?? []).map((q, idx) => {
    const solution = raw.solutions?.[q.id] ?? ({} as SolutionEntry);
    const answer = q.answer ?? '';
    const analysis = q.analysis ?? '';
    const vm: QuestionVM = {
      id: q.id,
      no: idx + 1,
      type: `${q.type ?? 'unknown'}`,
      stem: q.stem ?? '',
      options: q.options ?? [],
      answer,
      analysis,
      solution,
      hasDiffWithFinal: computeDiffWithFinal(answer, analysis, solution),
    };
    return vm;
  });

  return {
    meta,
    questions,
    ocrTextById: raw.ocrTextById ?? {},
    imageUrlById: raw.imageUrlById ?? {},
  };
}




