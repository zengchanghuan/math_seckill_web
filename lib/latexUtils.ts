/**
 * LaTeX 渲染辅助工具
 */

/**
 * 确保文本中的 LaTeX 公式被美元符号包裹，并修复 limits
 */
export function formatLatexForMarkdown(text: string): string {
  if (!text) return '';

  // 1. 自动补全 \limits (确保下标在下方)
  let processed = text
    .replace(/\\lim(?![\\a-zA-Z]*\\limits)/g, '\\lim\\limits')
    .replace(/\\max(?![\\a-zA-Z]*\\limits)/g, '\\max\\limits')
    .replace(/\\min(?![\\a-zA-Z]*\\limits)/g, '\\min\\limits')
    .replace(/\\sum(?![\\a-zA-Z]*\\limits)/g, '\\sum\\limits');

  // 2. 识别常见的 LaTeX 命令并确保它们被 $ 包裹 (如果尚未被包裹)
  // 匹配常见的数学符号和结构，如 \lim, \frac, \sqrt, \sin, \int 等
  const mathRegex = /(\\([a-zA-Z]+)(\{[^}]*\}|\[[^\]]*\]|[_^]\{[^}]*\}|[_^][a-zA-Z0-9]|\s|(?=[^a-zA-Z]))+)/g;
  
  // 这是一个简单的启发式算法：如果一段文本包含反斜杠开头的数学命令，且不在 $ 中，则包裹它
  // 注意：为了简单起见，这里假设 OCR 结果中没有复杂的混合文本
  // 如果 stem 已经是 $ 包裹的，则不做处理
  if (!processed.includes('$')) {
    // 寻找连续的 LaTeX 符号并包裹
    processed = processed.replace(mathRegex, (match) => `$${match.trim()}$`);
  }

  return processed;
}

/**
 * 修复 LaTeX 中的 limits，确保下标显示在符号下方
 */
export function fixLatexLimits(latex: string): string {
  if (!latex) return '';
  
  // 只添加 \limits，不做其他处理
  return latex
    .replace(/\\lim(?![a-zA-Z])/g, '\\lim\\limits')
    .replace(/\\max(?![a-zA-Z])/g, '\\max\\limits')
    .replace(/\\min(?![a-zA-Z])/g, '\\min\\limits')
    .replace(/\\sum(?![a-zA-Z])/g, '\\sum\\limits')
    .replace(/\\prod(?![a-zA-Z])/g, '\\prod\\limits')
    .replace(/\\int(?![a-zA-Z])/g, '\\int\\limits');
}

