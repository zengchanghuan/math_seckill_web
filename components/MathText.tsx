'use client';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  content: string;
  displayMode?: boolean;
  className?: string;
}

export default function MathText({ content, displayMode = false, className = '' }: MathTextProps) {
  // 提取 LaTeX 表达式（支持 $...$ 和 $$...$$）
  const parts: (string | { type: 'math'; content: string; display: boolean })[] = [];
  let lastIndex = 0;
  let inMath = false;
  let mathStart = -1;
  let isDisplay = false;

  for (let i = 0; i < content.length; i++) {
    if (content[i] === '$') {
      if (i + 1 < content.length && content[i + 1] === '$') {
        // 块级数学 $$...$$
        if (inMath && isDisplay) {
          // 结束块级数学
          const mathContent = content.substring(mathStart + 2, i);
          parts.push({ type: 'math', content: mathContent, display: true });
          lastIndex = i + 2;
          inMath = false;
          i++; // 跳过第二个 $
        } else {
          // 开始块级数学
          if (i > lastIndex) {
            parts.push(content.substring(lastIndex, i));
          }
          mathStart = i;
          inMath = true;
          isDisplay = true;
          i++; // 跳过第二个 $
        }
      } else {
        // 行内数学 $...$
        if (inMath && !isDisplay) {
          // 结束行内数学
          const mathContent = content.substring(mathStart + 1, i);
          parts.push({ type: 'math', content: mathContent, display: false });
          lastIndex = i + 1;
          inMath = false;
        } else {
          // 开始行内数学
          if (i > lastIndex) {
            parts.push(content.substring(lastIndex, i));
          }
          mathStart = i;
          inMath = true;
          isDisplay = false;
        }
      }
    }
  }

  // 添加剩余文本
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        } else {
          return part.display ? (
            <BlockMath key={index} math={part.content} />
          ) : (
            <InlineMath key={index} math={part.content} />
          );
        }
      })}
    </span>
  );
}
