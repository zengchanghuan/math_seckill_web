'use client';

import { LatexText } from './LatexText';

/**
 * 轻量预览：主目标是 “Markdown 可读 + LaTeX 可渲染 + 不白屏”
 * - 不引入新依赖（react-markdown/remark-math 等）
 * - 支持：换行、段落、简单列表（- / 1.）
 */

function isListLine(line: string) {
  const t = line.trim();
  return /^-\s+/.test(t) || /^\d+\.\s+/.test(t);
}

export function MarkdownLatexPreview({ value, className }: { value: string; className?: string }) {
  const lines = (value ?? '').replace(/\r\n/g, '\n').split('\n');

  const blocks: Array<
    | { kind: 'p'; lines: string[] }
    | { kind: 'ul'; items: string[] }
    | { kind: 'ol'; items: string[] }
  > = [];

  let buf: string[] = [];
  let listKind: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (buf.length) blocks.push({ kind: 'p', lines: buf });
    buf = [];
  };
  const flushList = () => {
    if (listKind && listItems.length) blocks.push({ kind: listKind, items: listItems });
    listKind = null;
    listItems = [];
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushList();
      flushParagraph();
      continue;
    }

    if (isListLine(line)) {
      flushParagraph();
      const isOl = /^\d+\.\s+/.test(t);
      const kind: 'ul' | 'ol' = isOl ? 'ol' : 'ul';
      if (listKind && listKind !== kind) flushList();
      listKind = kind;
      const item = t.replace(/^-\s+/, '').replace(/^\d+\.\s+/, '');
      listItems.push(item);
      continue;
    }

    flushList();
    buf.push(line);
  }

  flushList();
  flushParagraph();

  return (
    <div className={className}>
      {blocks.map((b, idx) => {
        if (b.kind === 'p') {
          const paragraph = b.lines.join('\n');
          return (
            <div key={idx} className="mb-3 last:mb-0">
              <LatexText text={paragraph} className="text-[14px] leading-[22px] text-[#0F172B]" />
            </div>
          );
        }
        if (b.kind === 'ul') {
          return (
            <ul key={idx} className="mb-3 list-disc pl-5 text-[14px] leading-[22px] text-[#0F172B]">
              {b.items.map((it, j) => (
                <li key={j}>
                  <LatexText text={it} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <ol key={idx} className="mb-3 list-decimal pl-5 text-[14px] leading-[22px] text-[#0F172B]">
            {b.items.map((it, j) => (
              <li key={j}>
                <LatexText text={it} />
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}





