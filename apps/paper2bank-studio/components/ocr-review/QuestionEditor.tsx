'use client';

import { useMemo, useState } from 'react';
import type { QuestionVM } from '@/lib/ocrReview/types';
import { LatexText } from './LatexText';
import { MarkdownLatexPreview } from './MarkdownLatexPreview';

type Tab = 'edit' | 'preview';

function ModelCard({
  title,
  answer,
  analysis,
  tone,
  onUse,
}: {
  title: string;
  answer?: string;
  analysis?: string;
  tone?: 'final' | 'deepseek' | 'sympy';
  onUse: () => void;
}) {
  const badge =
    tone === 'final'
      ? 'bg-indigo-50 text-indigo-700'
      : tone === 'deepseek'
        ? 'bg-sky-50 text-sky-700'
        : 'bg-emerald-50 text-emerald-700';

  return (
    <div className="rounded-[12px] border border-black/10 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="text-[12px] font-semibold text-[#0F172B]">{title}</div>
          <span className={`rounded px-2 py-[1px] text-[10px] font-medium ${badge}`}>建议</span>
        </div>
        <button
          type="button"
          onClick={onUse}
          className="h-8 rounded-[10px] border border-[#C6D2FF] bg-white px-3 text-[12px] font-semibold text-[#4F39F6] hover:bg-indigo-50"
        >
          覆盖到答案/解析
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-[10px] bg-[#F8FAFC] p-2">
          <div className="text-[11px] font-medium text-[#62748E]">answer</div>
          <div className="mt-1 text-[12px] text-[#0F172B]">
            <LatexText text={answer || '（空）'} />
          </div>
        </div>
        <div className="rounded-[10px] bg-[#F8FAFC] p-2">
          <div className="text-[11px] font-medium text-[#62748E]">analysis</div>
          <div className="mt-1 text-[12px] text-[#0F172B]">
            <LatexText text={analysis || '（空）'} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuestionEditor({
  question,
  onChange,
  onUseFinal,
  onUseDeepseek,
  onUseSympy,
  needsReview,
  onToggleNeedsReview,
}: {
  question: QuestionVM;
  onChange: (patch: { answer?: string; analysis?: string }) => void;
  onUseFinal: () => void;
  onUseDeepseek: () => void;
  onUseSympy: () => void;
  needsReview: boolean;
  onToggleNeedsReview: () => void;
}) {
  const [answerTab, setAnswerTab] = useState<Tab>('edit');
  const [analysisTab, setAnalysisTab] = useState<Tab>('edit');

  const sol = question.solution ?? {};
  const final = sol.final ?? {};
  const deepseek = sol.deepseek ?? {};
  const sympy = sol.sympy ?? {};

  const consistentText = useMemo(() => {
    if (sol.consistent === true) return '一致';
    if (sol.consistent === false) return '不一致';
    return '未知';
  }, [sol.consistent]);

  const equivText = useMemo(() => {
    if (sol.equiv === true) return '等价';
    if (sol.equiv === false) return '不等价';
    return '未知';
  }, [sol.equiv]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-start justify-between border-b border-black/10 px-4 py-3">
        <div>
          <div className="text-[14px] font-semibold text-[#0F172B]">
            Q{question.no}{' '}
            <span className="ml-2 rounded bg-[#F1F5F9] px-2 py-[1px] text-[11px] font-medium text-[#62748E]">
              {question.type}
            </span>
          </div>
          <div className="mt-1 text-[12px] text-[#62748E]">
            模型对照：consistent={consistentText} / equiv={equivText}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleNeedsReview}
          className={`h-9 rounded-[10px] px-3 text-[12px] font-semibold ${
            needsReview
              ? 'border border-amber-200 bg-amber-50 text-amber-800'
              : 'border border-black/10 bg-white text-[#0F172B]'
          }`}
          title="本地标记（不写回后端）"
        >
          {needsReview ? '已标记复核' : '标记需要复核'}
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="rounded-[12px] border border-black/10 bg-white p-3">
          <div className="text-[12px] font-semibold text-[#0F172B]">题干（渲染 LaTeX）</div>
          <div className="mt-2 rounded-[10px] bg-[#F8FAFC] p-3 text-[13px] leading-[20px] text-[#0F172B]">
            <LatexText text={question.stem} />
          </div>

          {question.options.length ? (
            <div className="mt-3">
              <div className="text-[12px] font-semibold text-[#0F172B]">选项</div>
              <div className="mt-2 space-y-2">
                {question.options.map((op, idx) => (
                  <div key={idx} className="flex items-start gap-2 rounded-[10px] bg-[#F8FAFC] p-2">
                    <div className="mt-[2px] h-5 w-6 shrink-0 rounded bg-white text-center text-[12px] font-semibold text-[#45556C]">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="text-[13px] text-[#0F172B]">
                      <LatexText text={op} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <ModelCard
            title="final"
            tone="final"
            answer={final.answer}
            analysis={final.analysis}
            onUse={onUseFinal}
          />
          <div className="grid grid-cols-2 gap-3">
            <ModelCard
              title="deepseek"
              tone="deepseek"
              answer={deepseek.answer}
              analysis={deepseek.analysis}
              onUse={onUseDeepseek}
            />
            <ModelCard
              title="sympy"
              tone="sympy"
              answer={sympy.answer}
              analysis={sympy.analysis}
              onUse={onUseSympy}
            />
          </div>
        </div>

        <div className="mt-4 rounded-[12px] border border-black/10 bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold text-[#0F172B]">answer（可编辑）</div>
            <div className="flex h-8 items-center rounded-[10px] bg-[#ECECF0] p-1 text-[12px] font-medium">
              <button
                type="button"
                onClick={() => setAnswerTab('edit')}
                className={`h-6 rounded-[10px] px-3 ${answerTab === 'edit' ? 'bg-white' : 'hover:bg-white/60'}`}
              >
                编辑
              </button>
              <button
                type="button"
                onClick={() => setAnswerTab('preview')}
                className={`h-6 rounded-[10px] px-3 ${
                  answerTab === 'preview' ? 'bg-white' : 'hover:bg-white/60'
                }`}
              >
                预览
              </button>
            </div>
          </div>

          {answerTab === 'edit' ? (
            <textarea
              value={question.answer}
              onChange={(e) => onChange({ answer: e.target.value })}
              placeholder="支持 Markdown + $...$ LaTeX"
              className="mt-2 min-h-[72px] w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[13px] text-[#0F172B] outline-none focus:ring-4 focus:ring-indigo-100"
            />
          ) : (
            <div className="mt-2 rounded-[10px] border border-[#E2E8F0] bg-white p-3">
              <MarkdownLatexPreview value={question.answer || '（空）'} />
            </div>
          )}
        </div>

        <div className="mt-3 rounded-[12px] border border-black/10 bg-white p-3">
          <div className="flex items-center justify-between">
            <div className="text-[12px] font-semibold text-[#0F172B]">analysis（可编辑）</div>
            <div className="flex h-8 items-center rounded-[10px] bg-[#ECECF0] p-1 text-[12px] font-medium">
              <button
                type="button"
                onClick={() => setAnalysisTab('edit')}
                className={`h-6 rounded-[10px] px-3 ${
                  analysisTab === 'edit' ? 'bg-white' : 'hover:bg-white/60'
                }`}
              >
                编辑
              </button>
              <button
                type="button"
                onClick={() => setAnalysisTab('preview')}
                className={`h-6 rounded-[10px] px-3 ${
                  analysisTab === 'preview' ? 'bg-white' : 'hover:bg-white/60'
                }`}
              >
                预览
              </button>
            </div>
          </div>

          {analysisTab === 'edit' ? (
            <textarea
              value={question.analysis}
              onChange={(e) => onChange({ analysis: e.target.value })}
              placeholder="支持 Markdown + $...$ LaTeX"
              className="mt-2 min-h-[120px] w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[13px] text-[#0F172B] outline-none focus:ring-4 focus:ring-indigo-100"
            />
          ) : (
            <div className="mt-2 rounded-[10px] border border-[#E2E8F0] bg-white p-3">
              <MarkdownLatexPreview value={question.analysis || '（空）'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




