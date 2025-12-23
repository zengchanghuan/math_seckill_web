'use client';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { fixLatexLimits } from '@/lib/latexUtils';

interface MathTextProps {
  content: string;
  displayMode?: boolean;
  className?: string;
  enhanced?: boolean; // 启用增强模式：智能判断公式是否应该块级显示
}

export default function MathText({
  content,
  displayMode = false,
  className = '',
  enhanced = false,
}: MathTextProps) {
  if (!content) return null;

  // 修复：如果内容包含 LaTeX 命令但没有 $ 符号，自动添加包裹
  let processedContent = content;
  if (!content.includes('$') && /\\[a-z]+/.test(content)) {
    // 将整段内容包裹在 $ $ 中
    processedContent = `$${content}$`;
  }

  /**
   * 智能判断公式是否应该块级显示（enhanced 模式）
   * 判断规则：
   * 1. 包含多个等号（= 出现2次以上）
   * 2. 包含积分符号 \int
   * 3. 包含求和/乘积符号 \sum \prod
   * 4. 包含分式且较复杂 \frac{...}{...} 
   * 5. 公式长度超过60个字符
   * 6. 包含对齐环境的关键词
   */
  const shouldBeDisplayMode = (latex: string): boolean => {
    if (!enhanced) return false;
    
    // 规则1: 多个等号
    const equalsCount = (latex.match(/=/g) || []).length;
    if (equalsCount >= 2) return true;
    
    // 规则2-3: 积分/求和/乘积
    if (/\\int|\\sum|\\prod/.test(latex)) return true;
    
    // 规则4: 复杂分式（嵌套或长分式）
    const fracMatch = latex.match(/\\frac/g);
    if (fracMatch && fracMatch.length >= 2) return true;
    if (/\\frac\{[^}]{15,}\}/.test(latex)) return true;
    
    // 规则5: 长公式
    if (latex.length > 60) return true;
    
    // 规则6: 对齐环境
    if (/\\begin\{(align|aligned|gather)\}/.test(latex)) return true;
    
    return false;
  };

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
    ...inlineMatches.map((m) => ({ 
      ...m, 
      // 在 enhanced 模式下，智能判断是否应该块级显示
      display: enhanced ? shouldBeDisplayMode(m.content) : false 
    })),
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
          // 将换行符转换为<br/>标签
          const lines = part.split('\n');
          return (
            <span key={index}>
              {lines.map((line, lineIndex) => (
                <span key={lineIndex}>
                  {line}
                  {lineIndex < lines.length - 1 && <br />}
                </span>
              ))}
            </span>
          );
        } else {
          try {
            // 根据是否为块级公式决定是否添加 \limits
            // 行内公式：积分不添加 \limits（上下标在右侧，紧凑）
            // 块级公式：积分添加 \limits（上下标在上下）
            const processedContent = fixLatexLimits(part.content, !part.display);
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
