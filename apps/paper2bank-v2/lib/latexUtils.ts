/**
 * LaTeX 渲染辅助工具 (Paper2Bank-v2 本地版)
 */

export function formatLatexForMarkdown(text: string): string {
  if (!text) return '';

  let processed = text;

  // 1. 识别常见的 LaTeX 命令并确保它们被 $ 包裹
  // 匹配 \ 开头的命令直到遇到空格、标点或特殊括号
  const mathRegex = /(\\([a-zA-Z]+)(\{[^}]*\}|\[[^\]]*\]|[_^]\{[^}]*\}|[_^][a-zA-Z0-9]|\s|(?=[^a-zA-Z]))+)/g;
  
  if (!processed.includes('$')) {
    processed = processed.replace(mathRegex, (match) => {
      let formula = match.trim();
      
      // 2. 自动在公式开头添加 \displaystyle 确保公式像图2一样大
      // 3. 自动补全 \limits 确保下标在正下方
      if (formula.includes('\\lim') && !formula.includes('\\limits')) {
        formula = formula.replace('\\lim', '\\lim\\limits');
      }
      if (formula.includes('\\sum') && !formula.includes('\\limits')) {
        formula = formula.replace('\\sum', '\\sum\\limits');
      }
      
      return `$\\displaystyle ${formula}$`;
    });
  } else {
    // 如果已经有 $，则尝试在 $ 内部插入 \displaystyle 并修复 limits
    processed = processed.replace(/\$([^\$]+)\$/g, (match, formula) => {
      let f = formula.trim();
      if (!f.includes('\\displaystyle')) f = `\\displaystyle ${f}`;
      if (f.includes('\\lim') && !f.includes('\\limits')) f = f.replace('\\lim', '\\lim\\limits');
      return `$${f}$`;
    });
  }

  return processed;
}
