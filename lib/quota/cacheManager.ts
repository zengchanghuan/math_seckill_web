/**
 * 选择题缓存管理器 - 支持版本化、LRU清理
 */

import type { ConvertToChoiceResult } from '@/types';

// 配置常量
const PROMPT_VERSION = 1; // Prompt版本，修改prompt时递增
const CACHE_PREFIX = 'mcq_cache_v1';
const CACHE_MAX_SIZE = 100; // 最多缓存100题
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7天过期

interface CachedMCQ {
  createdAt: number;
  expiresAt: number;
  accessedAt: number; // 用于LRU
  payload: ConvertToChoiceResult;
  meta: {
    promptVersion: number;
    answerHash: string;
  };
}

interface CacheIndex {
  keys: string[];
  lastCleanup: number;
}

// 生成答案hash（简单版）
function hashAnswer(answer: string): string {
  let hash = 0;
  for (let i = 0; i < answer.length; i++) {
    const char = answer.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// 生成缓存key
export function getCacheKey(questionId: string, answer: string): string {
  const answerHash = hashAnswer(answer);
  return `${CACHE_PREFIX}:${questionId}:v${PROMPT_VERSION}:a${answerHash}`;
}

// 获取缓存索引
function getCacheIndex(): CacheIndex {
  if (typeof window === 'undefined') {
    return { keys: [], lastCleanup: Date.now() };
  }

  try {
    const stored = localStorage.getItem(`${CACHE_PREFIX}_index`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('读取缓存索引失败:', e);
  }

  return { keys: [], lastCleanup: Date.now() };
}

// 保存缓存索引
function saveCacheIndex(index: CacheIndex): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}_index`, JSON.stringify(index));
  } catch (e) {
    console.error('保存缓存索引失败:', e);
  }
}

// LRU清理：删除最旧的访问记录
function cleanupLRU(): void {
  const index = getCacheIndex();
  
  if (index.keys.length <= CACHE_MAX_SIZE) {
    return; // 未超限，不需要清理
  }

  // 读取所有缓存项的访问时间
  const items: { key: string; accessedAt: number }[] = [];
  
  for (const key of index.keys) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const cached: CachedMCQ = JSON.parse(stored);
        items.push({ key, accessedAt: cached.accessedAt });
      } else {
        // 缓存项不存在，从索引中移除
        index.keys = index.keys.filter(k => k !== key);
      }
    } catch (e) {
      console.error('读取缓存项失败:', key, e);
    }
  }

  // 按访问时间排序，删除最旧的
  items.sort((a, b) => a.accessedAt - b.accessedAt);
  const toDelete = items.slice(0, items.length - CACHE_MAX_SIZE);

  for (const item of toDelete) {
    try {
      localStorage.removeItem(item.key);
      index.keys = index.keys.filter(k => k !== item.key);
    } catch (e) {
      console.error('删除缓存失败:', item.key, e);
    }
  }

  index.lastCleanup = Date.now();
  saveCacheIndex(index);
  
  console.log(`LRU清理完成，删除 ${toDelete.length} 个旧缓存`);
}

// 清理过期缓存
function cleanupExpired(): void {
  const index = getCacheIndex();
  const now = Date.now();
  const validKeys: string[] = [];

  for (const key of index.keys) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const cached: CachedMCQ = JSON.parse(stored);
        if (cached.expiresAt > now) {
          validKeys.push(key);
        } else {
          // 过期，删除
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.error('清理过期缓存失败:', key, e);
    }
  }

  if (validKeys.length !== index.keys.length) {
    index.keys = validKeys;
    index.lastCleanup = now;
    saveCacheIndex(index);
    console.log(`清理过期缓存，删除 ${index.keys.length - validKeys.length} 个`);
  }
}

// 获取缓存
export function getMCQCache(questionId: string, answer: string): ConvertToChoiceResult | null {
  if (typeof window === 'undefined') return null;

  const key = getCacheKey(questionId, answer);

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const cached: CachedMCQ = JSON.parse(stored);

    // 检查过期
    if (cached.expiresAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }

    // 检查版本
    if (cached.meta.promptVersion !== PROMPT_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    // 更新访问时间（用于LRU）
    cached.accessedAt = Date.now();
    localStorage.setItem(key, JSON.stringify(cached));

    return cached.payload;
  } catch (e) {
    console.error('读取MCQ缓存失败:', e);
    return null;
  }
}

// 保存缓存
export function saveMCQCache(
  questionId: string,
  answer: string,
  result: ConvertToChoiceResult
): boolean {
  if (typeof window === 'undefined') return false;

  const key = getCacheKey(questionId, answer);
  const now = Date.now();

  const cached: CachedMCQ = {
    createdAt: now,
    expiresAt: now + CACHE_TTL,
    accessedAt: now,
    payload: result,
    meta: {
      promptVersion: PROMPT_VERSION,
      answerHash: hashAnswer(answer),
    },
  };

  try {
    // 先清理过期和LRU
    cleanupExpired();
    cleanupLRU();

    // 保存缓存
    localStorage.setItem(key, JSON.stringify(cached));

    // 更新索引
    const index = getCacheIndex();
    if (!index.keys.includes(key)) {
      index.keys.push(key);
      saveCacheIndex(index);
    }

    return true;
  } catch (e) {
    console.error('保存MCQ缓存失败:', e);
    
    // 可能是存储空间不足，尝试强制清理
    try {
      cleanupLRU();
      localStorage.setItem(key, JSON.stringify(cached));
      return true;
    } catch (e2) {
      console.error('强制清理后仍保存失败:', e2);
      return false;
    }
  }
}

// 删除缓存
export function deleteMCQCache(questionId: string, answer: string): void {
  if (typeof window === 'undefined') return;

  const key = getCacheKey(questionId, answer);
  
  try {
    localStorage.removeItem(key);

    const index = getCacheIndex();
    index.keys = index.keys.filter(k => k !== key);
    saveCacheIndex(index);
  } catch (e) {
    console.error('删除MCQ缓存失败:', e);
  }
}

// 清空所有缓存
export function clearAllMCQCache(): void {
  if (typeof window === 'undefined') return;

  const index = getCacheIndex();
  
  for (const key of index.keys) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('删除缓存失败:', key, e);
    }
  }

  localStorage.removeItem(`${CACHE_PREFIX}_index`);
  console.log('已清空所有MCQ缓存');
}

// 获取缓存统计
export function getMCQCacheStats(): {
  count: number;
  maxSize: number;
  version: number;
} {
  const index = getCacheIndex();
  return {
    count: index.keys.length,
    maxSize: CACHE_MAX_SIZE,
    version: PROMPT_VERSION,
  };
}



