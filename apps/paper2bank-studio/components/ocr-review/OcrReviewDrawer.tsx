'use client';

import { useEffect, useMemo, useState } from 'react';
import type { OcrReviewState, QuestionVM, SavePatch } from '@/lib/ocrReview/types';
import { adaptParseResultToState } from '@/lib/ocrReview/adapters';
import { getParseResult, getOcrMeta, saveCorrections } from '@/lib/ocrReview/api';
import { QuestionList } from './QuestionList';
import { QuestionEditor } from './QuestionEditor';
import { EvidencePanel } from './EvidencePanel';

function includesIgnoreCase(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function filterQuestions(all: QuestionVM[], search: string): QuestionVM[] {
  const s = search.trim();
  if (!s) return all;

  // 支持：Q1 / 1 / 题干关键词
  const m = s.match(/^q?\s*(\d+)$/i);
  if (m) {
    const no = Number(m[1]);
    return all.filter((q) => q.no === no);
  }

  return all.filter((q) => includesIgnoreCase(q.stem, s));
}

export function OcrReviewDrawer({
  open,
  importId,
  onClose,
}: {
  open: boolean;
  importId: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<OcrReviewState | null>(null);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  // 本地编辑：{id -> patch}
  const [patches, setPatches] = useState<Record<string, SavePatch | undefined>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  const activeQuestion = useMemo(() => {
    if (!state || !activeId) return null;
    return state.questions.find((q) => q.id === activeId) ?? null;
  }, [state, activeId]);

  const filteredQuestions = useMemo(() => {
    if (!state) return [];
    return filterQuestions(state.questions, search);
  }, [state, search]);

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      // 预留：未来可以把 meta / parseResult 分开请求
      const [meta, parse] = await Promise.all([getOcrMeta(importId), getParseResult(importId)]);
      const st = adaptParseResultToState({ ...parse, meta });
      setState(st);
      setActiveId((prev) => prev ?? st.questions[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function doSave(saveIds: string[]) {
    if (!state) return;
    const ps = saveIds
      .map((id) => patches[id])
      .filter(Boolean)
      .map((p) => ({ ...p })) as SavePatch[];
    if (!ps.length) return;

    setSaving(true);
    setError(null);
    try {
      await saveCorrections({ importId, patches: ps });
      // mock：保存后把 patch 合并回 questions（真实实现时应刷新）
      setState((prev) => {
        if (!prev) return prev;
        const nextQs = prev.questions.map((q) => {
          const p = patches[q.id];
          if (!p) return q;
          return {
            ...q,
            answer: p.answer ?? q.answer,
            analysis: p.analysis ?? q.analysis,
            // hasDiffWithFinal：在适配层里算，这里简化为刷新一次全量
          };
        });
        return { ...prev, questions: nextQs };
      });
      // 清掉已保存 patch
      setPatches((prev) => {
        const next = { ...prev };
        for (const id of saveIds) delete next[id];
        return next;
      });
      // 重新拉取一次，让 hasDiffWithFinal 重算（mock 数据不变也没关系）
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'save failed');
    } finally {
      setSaving(false);
    }
  }

  function setPatch(id: string, patch: Partial<SavePatch>) {
    setPatches((prev) => {
      const cur = prev[id] ?? { id };
      return { ...prev, [id]: { ...cur, ...patch, id } };
    });
  }

  function toggleFlag(id: string) {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function useModel(id: string, which: 'final' | 'deepseek' | 'sympy') {
    if (!state) return;
    const q = state.questions.find((x) => x.id === id);
    if (!q) return;
    const sol = q.solution ?? {};
    const src =
      which === 'final' ? sol.final : which === 'deepseek' ? sol.deepseek : sol.sympy;
    setPatch(id, {
      answer: src?.answer ?? '',
      analysis: src?.analysis ?? '',
    });
    // 同步到 UI
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((qq) =>
          qq.id === id
            ? { ...qq, answer: src?.answer ?? '', analysis: src?.analysis ?? '' }
            : qq,
        ),
      };
    });
  }

  useEffect(() => {
    if (!open) return;
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, importId]);

  const unsavedCount = useMemo(() => Object.keys(patches).length, [patches]);
  const drawerWidth = 'w-[55vw] min-w-[520px] max-w-[60vw]';

  if (!open) return null;

  return (
    <aside className={`h-full ${drawerWidth} border-l border-black/10 bg-white`}>
      {/* 顶部信息栏 */}
      <div className="flex items-start justify-between gap-3 border-b border-black/10 bg-white px-4 py-3">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-[#0F172B]">OCR 校对</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[#62748E]">
            <span className="rounded bg-[#F1F5F9] px-2 py-[1px] font-medium">
              importId: {importId}
            </span>
            <span className="rounded bg-[#F1F5F9] px-2 py-[1px] font-medium">
              status: {state?.meta.status ?? '-'}
            </span>
            {state?.meta.projectId ? (
              <span className="rounded bg-[#F1F5F9] px-2 py-[1px] font-medium">
                project: {state.meta.projectId}
              </span>
            ) : null}
            <span className="rounded bg-[#F1F5F9] px-2 py-[1px] font-medium">
              未保存: {unsavedCount}
            </span>
          </div>
          {error ? (
            <div className="mt-2 rounded bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="h-9 rounded-[10px] border border-black/10 bg-white px-3 text-[12px] font-semibold text-[#0F172B] hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            刷新 OCR 数据
          </button>
          <button
            type="button"
            onClick={() => void doSave(Object.keys(patches))}
            disabled={saving || unsavedCount === 0}
            className="h-9 rounded-[10px] bg-[#4F39F6] px-3 text-[12px] font-semibold text-white hover:brightness-95 disabled:opacity-50"
          >
            保存全部改动
          </button>
          <button
            type="button"
            onClick={() => (activeId ? void doSave([activeId]) : undefined)}
            disabled={saving || !activeId || !patches[activeId]}
            className="h-9 rounded-[10px] border border-[#C6D2FF] bg-white px-3 text-[12px] font-semibold text-[#4F39F6] hover:bg-indigo-50 disabled:opacity-50"
          >
            仅保存当前题
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-[10px] border border-black/10 bg-white px-3 text-[12px] font-semibold text-[#0F172B] hover:bg-[#F8FAFC]"
          >
            关闭
          </button>
        </div>
      </div>

      {/* 主体：三列 */}
      <div className="flex h-[calc(100%-56px)]">
        <div className="w-[28%] min-w-[220px]">
          <QuestionList
            questions={filteredQuestions}
            activeId={activeId}
            search={search}
            onSearchChange={setSearch}
            onSelect={(id) => setActiveId(id)}
            flaggedIds={flaggedIds}
          />
        </div>

        <div className="flex min-w-0 flex-1">
          {state && activeQuestion ? (
            <QuestionEditor
              question={activeQuestion}
              onChange={(p) => {
                setPatch(activeQuestion.id, p);
                setState((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    questions: prev.questions.map((q) =>
                      q.id === activeQuestion.id ? { ...q, ...p } : q,
                    ),
                  };
                });
              }}
              onUseFinal={() => useModel(activeQuestion.id, 'final')}
              onUseDeepseek={() => useModel(activeQuestion.id, 'deepseek')}
              onUseSympy={() => useModel(activeQuestion.id, 'sympy')}
              needsReview={flaggedIds.has(activeQuestion.id)}
              onToggleNeedsReview={() => toggleFlag(activeQuestion.id)}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-[13px] text-[#90A1B9]">
              {loading ? '加载中…' : '请选择题目'}
            </div>
          )}
        </div>

        <div className="w-[32%] min-w-[260px]">
          <EvidencePanel
            ocrText={(state?.ocrTextById?.[activeId ?? ''] ?? '') as string}
            imageUrl={state?.imageUrlById?.[activeId ?? ''] ?? undefined}
          />
        </div>
      </div>
    </aside>
  );
}




