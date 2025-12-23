'use client';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { fixLatexLimits } from '@/lib/latexUtils';

interface MathTextProps {
  content: string;
  displayMode?: boolean;
  className?: string;
}

export default function MathText({
  content,
  displayMode = false,
  className = '',
}: MathTextProps) {
  if (!content) return null;

  // 修复：如果内容包含 LaTeX 命令但没有 $ 符号，说明 $ 被意外移除了
  // 尝试自动修复
  let processedContent = content;
  if (!content.includes('$') && /\\[a-z]+/.test(content)) {
    console.warn('检测到 LaTeX 代码缺少 $ 符号，尝试自动修复');
    // 将整段内容包裹在 $ $ 中
    processedContent = `$${content}$`;
  }

  // 提取 LaTeX 表达式（支持 $...$ 和 $$...$$）
  const parts: (
    | string
    | { type: 'math'; content: string; display: boolean }
  )[] = [];
  
  // 使用正则表达式匹配数学公式
  // 先匹配 $$...$$ （块级），再匹配 $...$ （行内）
  const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
  const inlineMathRegex = /\$((?:[^\$]|\\\$)*?)\$/g;
  
  // 先处理块级数学公式
  const blockMatches: Array<{ start: number; end: number; content: string }> = [];
  let match;
  
  while ((match = blockMathRegex.exec(processedContent)) !== null) {
    blockMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1],
    });
  }
  
  // 再处理行内数学公式（跳过块级数学公式的位置）
  const inlineMatches: Array<{ start: number; end: number; content: string }> = [];
  blockMathRegex.lastIndex = 0;
  
  while ((match = inlineMathRegex.exec(processedContent)) !== null) {
    // 检查是否在块级数学公式内
    const isInBlock = blockMatches.some(
      (block) => match.index >= block.start && match.index < block.end
    );
    if (!isInBlock) {
      inlineMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
      });
    }
  }
  
  // 合并所有匹配并排序
  const allMatches = [
    ...blockMatches.map((m) => ({ ...m, display: true })),
    ...inlineMatches.map((m) => ({ ...m, display: false })),
  ].sort((a, b) => a.start - b.start);
  
  // 构建parts数组
  let lastIndex = 0;
  for (const match of allMatches) {
    // 添加数学公式前的文本
    if (match.start > lastIndex) {
      parts.push(processedContent.substring(lastIndex, match.start));
    }
    // 添加数学公式
    parts.push({
      type: 'math',
      content: match.content,
      display: match.display,
    });
    lastIndex = match.end;
  }
  
  // 添加剩余文本
  if (lastIndex < processedContent.length) {
    parts.push(processedContent.substring(lastIndex));
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        } else {
          try {
            // 添加 \limits 确保下标显示在符号下方
            const processedContent = fixLatexLimits(part.content);
            return part.display ? (
              <BlockMath key={index} math={processedContent} />
            ) : (
              <InlineMath key={index} math={processedContent} />
            );
          } catch (error) {
            console.error('LaTeX渲染错误:', part.content, error);
            // 渲染失败时显示原始内容
            return <span key={index} className="text-red-500">${part.content}$</span>;
          }
        }
      })}
    </span>
  );
}
