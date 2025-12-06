'use client';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  content: string;
  displayMode?: boolean;
  className?: string;
}

// 清理和修复 LaTeX 代码中的常见问题
function cleanLatex(latex: string): string {
  let cleaned = latex;
  
  // 移除题目文本中的 ** 标记（Markdown 加粗标记）
  cleaned = cleaned.replace(/\*\*/g, '');
  
  // 修复 LaTeX 代码中的占位符下划线
  // 保留 LaTeX 命令中的下划线（如 \int_0, x_1），但移除占位符下划线
  // 匹配不在 LaTeX 命令中的连续下划线（如 \______）
  cleaned = cleaned.replace(/\\_+/g, ''); // 移除 \______ 这种占位符
  
  // 修复其他常见问题
  // 移除多余的空白
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

export default function MathText({
  content,
  displayMode = false,
  className = '',
}: MathTextProps) {
  // 提取 LaTeX 表达式（支持 $...$ 和 $$...$$）
  const parts: (
    | string
    | { type: 'math'; content: string; display: boolean }
  )[] = [];
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
          const mathContent = cleanLatex(content.substring(mathStart + 2, i));
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
          const mathContent = cleanLatex(content.substring(mathStart + 1, i));
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
          // 使用 ErrorBoundary 或 try-catch 包装，但 react-katex 内部会处理错误
          // 如果 LaTeX 语法错误，react-katex 会显示错误信息，我们可以捕获并显示更友好的提示
          try {
            return part.display ? (
              <BlockMath key={index} math={part.content} errorColor="#cc0000" />
            ) : (
              <InlineMath key={index} math={part.content} errorColor="#cc0000" />
            );
          } catch (error) {
            // 如果 LaTeX 渲染失败，显示原始文本
            console.warn('LaTeX rendering error:', error, 'Content:', part.content);
            return (
              <span key={index} className="text-red-500" title="公式渲染错误">
                ${part.content}$
              </span>
            );
          }
        }
      })}
    </span>
  );
}
