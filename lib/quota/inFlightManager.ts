/**
 * In-Flight 请求管理器 - 防止并发重复请求
 */

import type { ConvertToChoiceResult } from '@/types';

// In-flight Promise Map
const inFlightMap = new Map<string, Promise<ConvertToChoiceResult>>();

// 生成in-flight key
function getInFlightKey(questionId: string): string {
  return `mcq_${questionId}`;
}

/**
 * 获取或创建请求
 * 如果已有in-flight请求，返回同一个Promise
 * 否则执行requestFn并缓存Promise
 */
export async function getOrCreateRequest(
  questionId: string,
  requestFn: () => Promise<ConvertToChoiceResult>
): Promise<ConvertToChoiceResult> {
  const key = getInFlightKey(questionId);

  // 检查是否已有in-flight请求
  const existing = inFlightMap.get(key);
  if (existing) {
    console.log(`[InFlight] 复用已有请求: ${questionId}`);
    return existing;
  }

  // 创建新请求
  const promise = requestFn()
    .finally(() => {
      // 请求完成（成功或失败）后清理
      inFlightMap.delete(key);
    });

  // 缓存Promise
  inFlightMap.set(key, promise);
  console.log(`[InFlight] 创建新请求: ${questionId}`);

  return promise;
}

/**
 * 检查是否有in-flight请求
 */
export function hasInFlightRequest(questionId: string): boolean {
  const key = getInFlightKey(questionId);
  return inFlightMap.has(key);
}

/**
 * 清理指定请求
 */
export function clearInFlightRequest(questionId: string): void {
  const key = getInFlightKey(questionId);
  inFlightMap.delete(key);
}

/**
 * 清理所有in-flight请求
 */
export function clearAllInFlightRequests(): void {
  inFlightMap.clear();
}

/**
 * 获取in-flight统计
 */
export function getInFlightStats(): {
  count: number;
  keys: string[];
} {
  return {
    count: inFlightMap.size,
    keys: Array.from(inFlightMap.keys()),
  };
}

