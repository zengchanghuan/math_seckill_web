'use client';

import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'inline_math'; text: string }
  | { kind: 'block_math'; text: string };

function splitLatex(input: string): Segment[] {
  // 规则：
  // - $$...$$ 作为块级
  // - $...$ 作为内联
  const s = input ?? '';
  const out: Segment[] = [];

  let i = 0;
  while (i < s.length) {
    const idxBlock = s.indexOf('$$', i);
    const idxInline = s.indexOf('$', i);

    const next =
      idxBlock === -1
        ? idxInline
        : idxInline === -1
          ? idxBlock
          : Math.min(idxBlock, idxInline);

    if (next === -1) {
      out.push({ kind: 'text', text: s.slice(i) });
      break;
    }

    if (next > i) out.push({ kind: 'text', text: s.slice(i, next) });

    // 块级 $$...$$
    if (s.startsWith('$$', next)) {
      const end = s.indexOf('$$', next + 2);
      if (end === -1) {
        out.push({ kind: 'text', text: s.slice(next) });
        break;
      }
      const tex = s.slice(next + 2, end).trim();
      out.push({ kind: 'block_math', text: tex });
      i = end + 2;
      continue;
    }

    // 内联 $...$
    const end = s.indexOf('$', next + 1);
    if (end === -1) {
      out.push({ kind: 'text', text: s.slice(next) });
      break;
    }
    const tex = s.slice(next + 1, end).trim();
    out.push({ kind: 'inline_math', text: tex });
    i = end + 1;
  }

  return out;
}

function TextWithNewlines({ text }: { text: string }) {
  const parts = text.split('\n');
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((p, idx) => (
        <span key={idx}>
          {p}
          {idx < parts.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

function LatexRender({ kind, tex }: { kind: 'inline' | 'block'; tex: string }) {
  try {
    return kind === 'block' ? (
      <BlockMath math={tex} errorColor="#ef4444" />
    ) : (
      <InlineMath math={tex} errorColor="#ef4444" />
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'katex render error';
    return (
      <span className="rounded bg-rose-50 px-2 py-1 text-[12px] text-rose-700">
        LaTeX 渲染失败：{msg}（已降级显示：<span className="font-mono">{tex}</span>）
      </span>
    );
  }
}

export function LatexText({ text, className }: { text: string; className?: string }) {
  const segs = splitLatex(text ?? '');
  return (
    <div className={className}>
      {segs.map((seg, idx) => {
        if (seg.kind === 'text') return <TextWithNewlines key={idx} text={seg.text} />;
        if (seg.kind === 'inline_math') return <LatexRender key={idx} kind="inline" tex={seg.text} />;
        return (
          <div key={idx} className="my-2 overflow-x-auto">
            <LatexRender kind="block" tex={seg.text} />
          </div>
        );
      })}
    </div>
  );
}



