/**
 * 测评与计划存储管理
 * 使用localStorage保存session/report/plan
 */

import type { AssessmentAnswer } from '@/types';
import type { AssessmentResult } from '@/engine/assessmentEngine';
import type { Plan7Days, DayPlanTask } from '@/engine/planTemplates';

const STORAGE_KEYS = {
  SESSION: 'assessment_session',
  ANSWERS: 'assessment_answers',
  RESULT: 'assessment_result',
  PLAN: 'assessment_plan',
  PLAN_PREFIX: 'assessment_plan_',
} as const;

// Session数据结构
export interface AssessmentSession {
  id: string;
  setId: string;
  startedAt: number;
  finishedAt?: number;
  answers: AssessmentAnswer[];
}

/**
 * 保存session
 */
export function saveSession(session: AssessmentSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(session.answers));
  } catch (e) {
    console.error('保存session失败:', e);
  }
}

/**
 * 获取session
 */
export function getSession(): AssessmentSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('读取session失败:', e);
    return null;
  }
}

/**
 * 保存测评结果
 */
export function saveResult(result: AssessmentResult): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RESULT, JSON.stringify(result));
  } catch (e) {
    console.error('保存result失败:', e);
  }
}

/**
 * 获取测评结果
 */
export function getResult(): AssessmentResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RESULT);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('读取result失败:', e);
    return null;
  }
}

/**
 * 保存7天计划
 */
export function savePlan(plan: Plan7Days): void {
  if (typeof window === 'undefined') return;
  try {
    // 保存当前计划
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
    
    // 保存到历史（用planId索引）
    localStorage.setItem(
      `${STORAGE_KEYS.PLAN_PREFIX}${plan.planId}`,
      JSON.stringify(plan)
    );
  } catch (e) {
    console.error('保存plan失败:', e);
  }
}

/**
 * 获取当前计划
 */
export function getPlan(): Plan7Days | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAN);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('读取plan失败:', e);
    return null;
  }
}

/**
 * 根据planId获取计划
 */
export function getPlanById(planId: string): Plan7Days | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`${STORAGE_KEYS.PLAN_PREFIX}${planId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('读取plan失败:', planId, e);
    return null;
  }
}

/**
 * 获取Day任务
 */
export function getDayTask(planId: string, day: number): DayPlanTask | null {
  const plan = getPlanById(planId);
  if (!plan) return null;
  
  return plan.days.find((d) => d.day === day) || null;
}

/**
 * 清空所有测评数据
 */
export function clearAllAssessmentData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.RESULT);
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    
    // 清除所有历史计划
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(STORAGE_KEYS.PLAN_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.error('清空数据失败:', e);
  }
}

