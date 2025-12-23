/**
 * AI额度管理 - 类型定义
 */

export type PlanType = 'free' | '7d' | '30d' | '60d';

export interface FreeDailyQuota {
  date: string; // YYYY-MM-DD
  used: number;
  limit: number;
}

export interface ProUnlock {
  unlocked: boolean;
  plan: PlanType;
  expiresAt: number; // timestamp
  unlockedAt: number; // timestamp
}

export interface AIQuota {
  total: number;
  used: number;
  dailyLimit: number;
  dailyUsed: number;
  dailyDate: string; // YYYY-MM-DD
  expiresAt: number; // timestamp
}

export interface QuotaStatus {
  hasFreeTries: boolean;
  freeRemaining: number;
  hasPro: boolean;
  proRemaining: number;
  proExpired: boolean;
  canConvert: boolean;
  needsPayment: boolean;
  dailyLimitReached: boolean;
  isFirstTime: boolean;
}

export const PLAN_CONFIG = {
  free: {
    name: '免费用户',
    dailyLimit: 3,
    totalQuota: 0,
    dailyQuota: 3,
    price: 0,
    duration: 0,
  },
  '7d': {
    name: '7天游标冲刺卡',
    dailyLimit: 30,
    totalQuota: 200,
    dailyQuota: 30,
    price: 19,
    duration: 7,
  },
  '30d': {
    name: '30天游标',
    dailyLimit: 50,
    totalQuota: 800,
    dailyQuota: 50,
    price: 39,
    duration: 30,
  },
  '60d': {
    name: '考前冲刺',
    dailyLimit: 80,
    totalQuota: 2000,
    dailyQuota: 80,
    price: 49,
    duration: 60,
  },
} as const;

