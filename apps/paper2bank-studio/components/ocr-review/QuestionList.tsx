'use client';

import type { QuestionVM } from '@/lib/ocrReview/types';

export function QuestionList({
  questions,
  activeId,
  search,
  onSearchChange,
  onSelect,
  flaggedIds,
}: {
  questions: QuestionVM[];
  activeId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
  flaggedIds: Set<string>;
}) {
  // 按 type 分组：{type -> list}
  const groups = new Map<string, QuestionVM[]>();
  for (const q of questions) {
    const k = q.type || 'unknown';
    const arr = groups.get(k) ?? [];
    arr.push(q);
    groups.set(k, arr);
  }

  const groupEntries = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="flex h-full flex-col border-r border-black/10 bg-white">
      <div className="border-b border-black/10 p-3">
        <div className="text-[12px] font-medium text-[#62748E]">搜索（题号 / 题干关键词）</div>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="例如：Q1 / 极限 / 集合"
          className="mt-2 h-9 w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[13px] text-[#0F172B] outline-none focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="flex-1 overflow-auto py-2">
        {groupEntries.map(([type, list]) => (
          <div key={type} className="mb-2">
            <div className="sticky top-0 z-10 bg-white px-3 py-2 text-[12px] font-semibold text-[#0F172B]">
              {type}{' '}
              <span className="ml-1 rounded bg-[#F1F5F9] px-2 py-[1px] text-[10px] font-medium text-[#62748E]">
                {list.length}
              </span>
            </div>

            {list.map((q) => {
              const active = q.id === activeId;
              const hasDiff = q.hasDiffWithFinal;
              const flagged = flaggedIds.has(q.id);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onSelect(q.id)}
                  className={`flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-[#F8FAFC] ${
                    active ? 'bg-[#F8FAFC]' : ''
                  }`}
                >
                  <div className="mt-1 flex w-10 shrink-0 items-center gap-1">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        hasDiff ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      title={hasDiff ? '与 final 不一致' : '与 final 一致（或无 final）'}
                    />
                    {flagged ? (
                      <span
                        className="inline-flex h-4 items-center rounded bg-amber-50 px-1 text-[10px] font-semibold text-amber-700"
                        title="需要复核"
                      >
                        复
                      </span>
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12px] font-semibold text-[#0F172B]">Q{q.no}</div>
                      {hasDiff ? (
                        <span className="rounded bg-rose-50 px-2 py-[1px] text-[10px] font-medium text-rose-700">
                          有差异
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 line-clamp-2 text-[12px] leading-[16px] text-[#62748E]">
                      {q.stem}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}





