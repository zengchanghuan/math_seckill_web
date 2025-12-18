import { NextResponse } from 'next/server';
import { deepseekTaskSolveOnce } from '@/lib/deepseek';
import { qwenSolveOnce } from '@/lib/qwen';
import { cacheGet, cacheKey, cacheSet } from '@/lib/server/cache';
import { normalizeAnswerText } from '@/lib/llmParse';
import type { Question, SolveResult } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json()) as { question: Question };
  const q = body?.question;
  if (!q?.id || !q?.stem) return NextResponse.json({ error: 'question required' }, { status: 400 });

  const key = cacheKey('solve', { id: q.id, stem: q.stem, options: q.options ?? [] });
  const hit = cacheGet<SolveResult>(key);
  if (hit) return NextResponse.json(hit);

  const result: SolveResult = {};
  const debug: Record<string, unknown> = {};

  // 1) DeepSeek（一次调用，结构化 plan + candidate）
  const ds = await deepseekTaskSolveOnce({ stem: q.stem, options: q.options ?? [] });
  result.deepseek = {
    answer: ds.plan.candidate_answer ?? '',
    analysis: ds.plan.candidate_analysis ?? '',
    raw: { plan: ds.plan, rawText: ds.rawText },
  };

  // 2) Qwen（备选模型，一次调用）
  try {
    const qw = await qwenSolveOnce({ stem: q.stem, options: q.options ?? [] });
    result.qwen = { answer: qw.answer, analysis: qw.analysis, raw: { rawText: qw.rawText } };
  } catch (e) {
    result.qwen = { answer: '', analysis: '', error: e instanceof Error ? e.message : 'qwen error' };
  }

  const dAns = normalizeAnswerText(result.deepseek?.answer);
  const qAns = normalizeAnswerText(result.qwen?.answer);
  if (dAns && qAns) result.consistent = dAns === qAns;

  // 3) 决策（恢复“双模型对比”版本）：
  // - 默认 final 用 DeepSeek
  // - 若 DeepSeek 明确无法确定，则用 Qwen 兜底
  const dsRefuse = (result.deepseek?.answer ?? '').includes('【无法识别/无答案】');
  if (dsRefuse && (result.qwen?.answer ?? '').trim()) {
    result.final = { ...result.qwen, source: 'qwen' };
  } else {
    result.final = { ...result.deepseek, source: 'deepseek' };
  }

  result.debug = debug;
  cacheSet(key, result);
  return NextResponse.json(result);
}


