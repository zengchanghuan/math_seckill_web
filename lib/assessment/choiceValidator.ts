/**
 * 选择题验证工具
 */

import type { ConvertToChoiceResult } from '@/types';

/**
 * 验证选择题的数学等价性
 * 使用多种策略检测选项是否等价
 */
export function detectEquivalentOptions(
  result: ConvertToChoiceResult
): { hasEquivalent: boolean; pairs: string[] } {
  const pairs: string[] = [];
  const options = result.options;

  // 策略1: 字符串归一化比较
  const normalized = options.map((opt) => normalizeExpression(opt.text));
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      if (normalized[i] === normalized[j]) {
        pairs.push(
          `${options[i].key}(${options[i].text}) 与 ${options[j].key}(${options[j].text}) 可能等价`
        );
      }
    }
  }

  // 策略2: 数值近似比较（如果是数值）
  const numericValues = options.map((opt) => tryEvaluateNumeric(opt.text));
  for (let i = 0; i < options.length; i++) {
    if (numericValues[i] === null) continue;
    for (let j = i + 1; j < options.length; j++) {
      if (numericValues[j] === null) continue;
      if (Math.abs(numericValues[i]! - numericValues[j]!) < 1e-10) {
        pairs.push(
          `${options[i].key}(${options[i].text}) 与 ${options[j].key}(${options[j].text}) 数值相等`
        );
      }
    }
  }

  // 策略3: 常见等价形式检测
  const equivalencePatterns = [
    { patterns: ['pi/6', '30°', 'π/6'], name: '30度' },
    { patterns: ['pi/4', '45°', 'π/4'], name: '45度' },
    { patterns: ['pi/3', '60°', 'π/3'], name: '60度' },
    { patterns: ['pi/2', '90°', 'π/2'], name: '90度' },
    { patterns: ['sqrt(2)/2', '√2/2', '1/sqrt(2)'], name: '√2/2' },
    { patterns: ['sqrt(3)/2', '√3/2'], name: '√3/2' },
    { patterns: ['1/2', '0.5'], name: '1/2' },
    { patterns: ['1/3', '0.333'], name: '1/3' },
    { patterns: ['2/3', '0.667'], name: '2/3' },
  ];

  for (const { patterns, name } of equivalencePatterns) {
    const matchedOptions = options.filter((opt) =>
      patterns.some((pattern) =>
        normalized[options.indexOf(opt)].includes(pattern.toLowerCase())
      )
    );
    if (matchedOptions.length > 1) {
      pairs.push(
        `${matchedOptions.map((o) => `${o.key}(${o.text})`).join(' 与 ')} 可能都表示 ${name}`
      );
    }
  }

  return {
    hasEquivalent: pairs.length > 0,
    pairs,
  };
}

/**
 * 表达式归一化
 * 将不同写法转换为统一形式
 */
function normalizeExpression(text: string): string {
  let normalized = text.toLowerCase().trim();

  // 移除所有空格
  normalized = normalized.replace(/\s+/g, '');

  // 统一符号
  normalized = normalized.replace(/π/g, 'pi');
  normalized = normalized.replace(/√/g, 'sqrt');
  normalized = normalized.replace(/×/g, '*');
  normalized = normalized.replace(/÷/g, '/');

  // 统一分数格式
  normalized = normalized.replace(/(\d+)\/(\d+)/g, (match, a, b) => {
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    const g = gcd(parseInt(a), parseInt(b));
    return `${parseInt(a) / g}/${parseInt(b) / g}`;
  });

  return normalized;
}

/**
 * 尝试计算表达式的数值
 * 返回null表示无法计算
 */
function tryEvaluateNumeric(text: string): number | null {
  try {
    const normalized = normalizeExpression(text);

    // 替换常量
    let expr = normalized
      .replace(/pi/g, String(Math.PI))
      .replace(/e\^/g, 'Math.exp')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(');

    // 简单安全检查
    if (/[a-z]/i.test(expr.replace(/math\./gi, ''))) {
      return null; // 包含字母变量，无法计算
    }

    // eslint-disable-next-line no-eval
    const result = eval(expr);
    return typeof result === 'number' && !isNaN(result) ? result : null;
  } catch {
    return null;
  }
}

/**
 * 生成验证报告
 */
export function generateValidationReport(
  result: ConvertToChoiceResult
): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // 检查1: 选项等价性
  const equivalenceCheck = detectEquivalentOptions(result);
  if (equivalenceCheck.hasEquivalent) {
    errors.push(...equivalenceCheck.pairs);
  }

  // 检查2: 正确答案是否明显
  const correctOption = result.options.find(
    (opt) => opt.key === result.correct_key
  );
  if (correctOption && correctOption.text.length < 3) {
    warnings.push('正确答案过于简单，可能太明显');
  }

  // 检查3: 干扰项是否合理
  const distractors = result.options.filter(
    (opt) => opt.key !== result.correct_key
  );
  for (const distractor of distractors) {
    if (!distractor.error_type) {
      warnings.push(`干扰项 ${distractor.key} 缺少错误类型说明`);
    }
  }

  // 检查4: 唯一性检查是否通过
  if (!result.uniqueness_check.passed) {
    errors.push('DeepSeek 自检报告唯一性检查未通过');
  }

  // 检查5: 等价风险提示
  if (result.uniqueness_check.equivalence_risks.length > 0) {
    warnings.push(
      `等价风险提示: ${result.uniqueness_check.equivalence_risks.join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}



