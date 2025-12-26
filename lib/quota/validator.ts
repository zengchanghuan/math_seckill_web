/**
 * 选择题结果校验器
 */

import type { ConvertToChoiceResult } from '@/types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 校验生成的选择题结果
 */
export function validateMCQResult(result: any): ValidationResult {
  const errors: string[] = [];

  // 检查基本结构
  if (!result || typeof result !== 'object') {
    errors.push('结果不是有效对象');
    return { valid: false, errors };
  }

  // 检查类型
  if (result.type !== 'single_choice') {
    errors.push(`类型错误: ${result.type}, 期望 single_choice`);
  }

  // 检查题干
  if (!result.stem || typeof result.stem !== 'string' || result.stem.trim().length === 0) {
    errors.push('题干为空或无效');
  }

  // 检查选项
  if (!Array.isArray(result.options)) {
    errors.push('选项不是数组');
  } else {
    if (result.options.length !== 4) {
      errors.push(`选项数量错误: ${result.options.length}, 期望 4`);
    }

    const keys = new Set<string>();
    const expectedKeys = ['A', 'B', 'C', 'D'];

    for (let i = 0; i < result.options.length; i++) {
      const option = result.options[i];

      if (!option || typeof option !== 'object') {
        errors.push(`选项 ${i} 不是有效对象`);
        continue;
      }

      // 检查key
      if (!option.key || typeof option.key !== 'string') {
        errors.push(`选项 ${i} 缺少key`);
      } else if (!expectedKeys.includes(option.key)) {
        errors.push(`选项 ${i} key无效: ${option.key}`);
      } else if (keys.has(option.key)) {
        errors.push(`选项 ${i} key重复: ${option.key}`);
      } else {
        keys.add(option.key);
      }

      // 检查text
      if (!option.text || typeof option.text !== 'string' || option.text.trim().length === 0) {
        errors.push(`选项 ${i} (${option.key}) 文本为空`);
      }

      // 检查error_type（干扰项应该有）
      if (option.key !== result.correct_key) {
        if (!option.error_type || typeof option.error_type !== 'string') {
          errors.push(`干扰项 ${option.key} 缺少error_type`);
        }
      }
    }

    // 检查是否有所有key
    for (const expectedKey of expectedKeys) {
      if (!keys.has(expectedKey)) {
        errors.push(`缺少选项 ${expectedKey}`);
      }
    }
  }

  // 检查正确答案
  if (!result.correct_key || !['A', 'B', 'C', 'D'].includes(result.correct_key)) {
    errors.push(`正确答案无效: ${result.correct_key}`);
  } else {
    // 检查正确答案是否在选项中
    const correctOption = result.options?.find((opt: any) => opt.key === result.correct_key);
    if (!correctOption) {
      errors.push(`正确答案 ${result.correct_key} 不在选项列表中`);
    }
  }

  // 检查correct_text
  if (!result.correct_text || typeof result.correct_text !== 'string') {
    errors.push('缺少correct_text');
  }

  // 检查normalize_answer
  if (!result.normalize_answer || typeof result.normalize_answer !== 'string') {
    errors.push('缺少normalize_answer');
  }

  // 检查uniqueness_check
  if (!result.uniqueness_check || typeof result.uniqueness_check !== 'object') {
    errors.push('缺少uniqueness_check');
  } else {
    if (!result.uniqueness_check.strategy) {
      errors.push('uniqueness_check缺少strategy');
    }
    if (!Array.isArray(result.uniqueness_check.equivalence_risks)) {
      errors.push('uniqueness_check.equivalence_risks不是数组');
    }
    if (result.uniqueness_check.passed !== true) {
      errors.push('唯一性检查未通过');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 尝试修复常见问题
 */
export function tryFixMCQResult(result: any): ConvertToChoiceResult | null {
  if (!result || typeof result !== 'object') return null;

  // 尝试修复基本字段
  if (!result.type) result.type = 'single_choice';
  
  // 如果选项缺少error_type，尝试补充
  if (Array.isArray(result.options)) {
    for (const option of result.options) {
      if (option.key !== result.correct_key && !option.error_type) {
        option.error_type = '未知错误类型';
      }
    }
  }

  // 重新校验
  const validation = validateMCQResult(result);
  return validation.valid ? result as ConvertToChoiceResult : null;
}



