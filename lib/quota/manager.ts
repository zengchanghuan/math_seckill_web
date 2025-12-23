/**
 * AI额度管理器
 */

import type { FreeDailyQuota, ProUnlock, AIQuota, QuotaStatus, PlanType } from './types';
import { PLAN_CONFIG } from './types';

const STORAGE_KEYS = {
  FREE_DAILY: 'ai_free_daily',
  PRO_UNLOCK: 'pro_unlock',
  AI_QUOTA: 'ai_quota',
  FIRST_TIME: 'ai_convert_first_time',
} as const;

// 获取今天的日期字符串 YYYY-MM-DD
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 获取免费每日额度
export function getFreeDailyQuota(): FreeDailyQuota {
  if (typeof window === 'undefined') {
    return { date: getTodayString(), used: 0, limit: 3 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FREE_DAILY);
    if (!stored) {
      return { date: getTodayString(), used: 0, limit: 3 };
    }

    const data: FreeDailyQuota = JSON.parse(stored);
    
    // 检查日期，如果不是今天则重置
    if (data.date !== getTodayString()) {
      const reset = { date: getTodayString(), used: 0, limit: 3 };
      localStorage.setItem(STORAGE_KEYS.FREE_DAILY, JSON.stringify(reset));
      return reset;
    }

    return data;
  } catch (e) {
    console.error('读取免费额度失败:', e);
    return { date: getTodayString(), used: 0, limit: 3 };
  }
}

// 获取Pro解锁状态
export function getProUnlock(): ProUnlock | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRO_UNLOCK);
    if (!stored) return null;

    const data: ProUnlock = JSON.parse(stored);
    
    // 检查是否过期
    if (data.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEYS.PRO_UNLOCK);
      localStorage.removeItem(STORAGE_KEYS.AI_QUOTA);
      return null;
    }

    return data;
  } catch (e) {
    console.error('读取Pro状态失败:', e);
    return null;
  }
}

// 获取AI额度
export function getAIQuota(): AIQuota | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AI_QUOTA);
    if (!stored) return null;

    const data: AIQuota = JSON.parse(stored);
    
    // 检查是否过期
    if (data.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEYS.AI_QUOTA);
      return null;
    }

    // 检查日期，如果不是今天则重置每日使用量
    if (data.dailyDate !== getTodayString()) {
      data.dailyUsed = 0;
      data.dailyDate = getTodayString();
      localStorage.setItem(STORAGE_KEYS.AI_QUOTA, JSON.stringify(data));
    }

    return data;
  } catch (e) {
    console.error('读取AI额度失败:', e);
    return null;
  }
}

// 检查是否首次使用
export function isFirstTimeUser(): boolean {
  if (typeof window === 'undefined') return true;
  return !localStorage.getItem(STORAGE_KEYS.FIRST_TIME);
}

// 标记已使用过
export function markFirstTimeUsed(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.FIRST_TIME, 'true');
}

// 获取当前额度状态
export function getQuotaStatus(): QuotaStatus {
  const freeQuota = getFreeDailyQuota();
  const proUnlock = getProUnlock();
  const aiQuota = getAIQuota();
  const isFirst = isFirstTimeUser();

  const hasFreeTries = freeQuota.used < freeQuota.limit;
  const freeRemaining = Math.max(0, freeQuota.limit - freeQuota.used);
  
  const hasPro = !!proUnlock?.unlocked;
  const proExpired = hasPro && proUnlock!.expiresAt < Date.now();
  const proRemaining = aiQuota ? Math.max(0, aiQuota.total - aiQuota.used) : 0;
  const dailyLimitReached = aiQuota 
    ? aiQuota.dailyUsed >= aiQuota.dailyLimit 
    : false;

  // 首次使用保护：直接可转换
  if (isFirst) {
    return {
      hasFreeTries: true,
      freeRemaining: 3,
      hasPro,
      proRemaining,
      proExpired: false,
      canConvert: true,
      needsPayment: false,
      dailyLimitReached: false,
      isFirstTime: true,
    };
  }

  const canConvert = hasFreeTries || (hasPro && proRemaining > 0 && !dailyLimitReached);
  const needsPayment = !hasFreeTries && (!hasPro || proRemaining === 0 || dailyLimitReached);

  return {
    hasFreeTries,
    freeRemaining,
    hasPro,
    proRemaining,
    proExpired,
    canConvert,
    needsPayment,
    dailyLimitReached,
    isFirstTime: false,
  };
}

// 消耗一次额度
export function consumeQuota(): { success: boolean; message: string } {
  const status = getQuotaStatus();

  if (!status.canConvert) {
    return { 
      success: false, 
      message: status.dailyLimitReached 
        ? '今日转换次数已达上限，明天再来吧' 
        : '额度不足，请解锁Pro或等待明日免费额度' 
    };
  }

  try {
    // 首次使用保护
    if (status.isFirstTime) {
      markFirstTimeUsed();
      const freeQuota = getFreeDailyQuota();
      freeQuota.used += 1;
      localStorage.setItem(STORAGE_KEYS.FREE_DAILY, JSON.stringify(freeQuota));
      return { success: true, message: '首次体验成功' };
    }

    // 优先使用免费额度
    if (status.hasFreeTries) {
      const freeQuota = getFreeDailyQuota();
      freeQuota.used += 1;
      localStorage.setItem(STORAGE_KEYS.FREE_DAILY, JSON.stringify(freeQuota));
      return { success: true, message: `消耗免费额度，剩余 ${freeQuota.limit - freeQuota.used} 次` };
    }

    // 使用Pro额度
    if (status.hasPro && status.proRemaining > 0) {
      const aiQuota = getAIQuota();
      if (!aiQuota) {
        return { success: false, message: 'AI额度数据异常' };
      }

      if (aiQuota.dailyUsed >= aiQuota.dailyLimit) {
        return { success: false, message: '今日转换次数已达上限' };
      }

      aiQuota.used += 1;
      aiQuota.dailyUsed += 1;
      localStorage.setItem(STORAGE_KEYS.AI_QUOTA, JSON.stringify(aiQuota));
      return { 
        success: true, 
        message: `消耗AI额度，剩余 ${aiQuota.total - aiQuota.used} 次` 
      };
    }

    return { success: false, message: '额度不足' };
  } catch (e) {
    console.error('消耗额度失败:', e);
    return { success: false, message: '操作失败' };
  }
}

// 解锁Pro（模拟购买）
export function unlockPro(plan: PlanType): { success: boolean; message: string } {
  if (plan === 'free') {
    return { success: false, message: '无效的套餐类型' };
  }

  try {
    const config = PLAN_CONFIG[plan];
    const now = Date.now();
    const expiresAt = now + config.duration * 24 * 60 * 60 * 1000;

    const proUnlock: ProUnlock = {
      unlocked: true,
      plan,
      expiresAt,
      unlockedAt: now,
    };

    const aiQuota: AIQuota = {
      total: config.totalQuota,
      used: 0,
      dailyLimit: config.dailyQuota,
      dailyUsed: 0,
      dailyDate: getTodayString(),
      expiresAt,
    };

    localStorage.setItem(STORAGE_KEYS.PRO_UNLOCK, JSON.stringify(proUnlock));
    localStorage.setItem(STORAGE_KEYS.AI_QUOTA, JSON.stringify(aiQuota));

    return { 
      success: true, 
      message: `成功解锁 ${config.name}，获得 ${config.totalQuota} 次AI转换额度` 
    };
  } catch (e) {
    console.error('解锁Pro失败:', e);
    return { success: false, message: '解锁失败' };
  }
}

// 格式化过期时间
export function formatExpiryDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

