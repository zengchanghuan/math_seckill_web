/**
 * LaTeX 验证和错误检测工具
 */

/**
 * 检测 LaTeX 代码中的常见错误
 */
export function detectLatexErrors(content: string): {
  hasError: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检测错误1: \left|\limits 语法错误
  if (/\\left\|\\limits/.test(content)) {
    errors.push('\\left|\\limits - 应使用 \\big| 或 \\bigg| 代替');
  }

  // 检测错误2: \right|\limits 语法错误
  if (/\\right\|\\limits/.test(content)) {
    errors.push('\\right|\\limits - 应使用 \\big| 或 \\bigg| 代替');
  }

  // 检测错误3: 不匹配的括号
  const leftCount = (content.match(/\\left[(\[{|]/g) || []).length;
  const rightCount = (content.match(/\\right[)\]}|]/g) || []).length;
  if (leftCount !== rightCount) {
    errors.push(`不匹配的 \\left 和 \\right (left: ${leftCount}, right: ${rightCount})`);
  }

  // 检测错误4: 多余的 \limits（已经有 \limits 的命令不应再添加）
  if (/\\lim\\limits\\limits/.test(content) || /\\int\\limits\\limits/.test(content)) {
    errors.push('重复的 \\limits');
  }

  return {
    hasError: errors.length > 0,
    errors,
  };
}

/**
 * 判断是否需要自动修复
 */
export function needsAutoFix(content: string): boolean {
  const { hasError } = detectLatexErrors(content);
  return hasError;
}




