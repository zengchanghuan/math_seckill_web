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
 * 
 * 行内公式 vs 块级公式的处理策略：
 * - 行内公式：积分(\int)不添加\limits，保持紧凑的右侧上下标
 * - 块级公式：积分添加\limits，上下标在积分号上下
 * - 极限、求和等始终添加\limits（这些符号在行内也应该上下标在下方）
 */
export function fixLatexLimits(latex: string, isInline: boolean = true): string {
  if (!latex) return '';
  
  let result = latex;
  
  // 极限、求和、求积等：无论行内还是块级都添加 \limits
  result = result
    .replace(/\\lim(?![a-zA-Z])/g, '\\lim\\limits')
    .replace(/\\max(?![a-zA-Z])/g, '\\max\\limits')
    .replace(/\\min(?![a-zA-Z])/g, '\\min\\limits')
    .replace(/\\sum(?![a-zA-Z])/g, '\\sum\\limits')
    .replace(/\\prod(?![a-zA-Z])/g, '\\prod\\limits');
  
  // 积分：只在块级公式中添加 \limits
  if (!isInline) {
    result = result.replace(/\\int(?![a-zA-Z])/g, '\\int\\limits');
  }
  // 行内积分：保持默认行为（上下标在右侧），不添加 \limits
  
  // 优化分数显示：行内公式使用紧凑分数 \tfrac
  if (isInline) {
    // 将 \frac 替换为 \tfrac (text-style fraction，更紧凑)
    // 但只替换简单的分数，避免影响复杂的嵌套分数
    result = result.replace(/\\frac(?=\{[^{}]{1,10}\}\{[^{}]{1,10}\})/g, '\\tfrac');
  }
  
  return result;
}

