/**
 * AI转换额度弹窗
 */

'use client';

import { useState } from 'react';
import type { QuotaStatus, PlanType } from '@/lib/quota/types';
import { PLAN_CONFIG } from '@/lib/quota/types';
import { unlockPro } from '@/lib/quota/manager';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  status: QuotaStatus;
}

export default function QuotaModal({
  isOpen,
  onClose,
  onConfirm,
  status,
}: QuotaModalProps) {
  const [unlocking, setUnlocking] = useState(false);

  if (!isOpen) return null;

  // 状态A：免费次数充足
  if (status.hasFreeTries) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            免输入练习
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            将本题转换为 4 选 1 选择题（更快做完）。
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            本次将消耗：<span className="font-semibold">1 次今日免费额度</span>
            {status.isFirstTime && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                （首次体验免费）
              </span>
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              立即转换
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 状态B：免费用完，但Pro额度充足
  if (status.hasPro && status.proRemaining > 0 && !status.dailyLimitReached) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            使用 AI 额度转换
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            将本题转换为 4 选 1 选择题，并提供"易错干扰项"。
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            本次将消耗：<span className="font-semibold">1 次 AI 额度</span>
            （剩余 <span className="font-semibold text-purple-600 dark:text-purple-400">{status.proRemaining}</span> 次）
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              消耗 1 次额度并转换
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 状态C：需要付费
  const handleUnlock = (plan: PlanType) => {
    setUnlocking(true);
    const result = unlockPro(plan);
    if (result.success) {
      // 解锁成功后自动转换
      setTimeout(() => {
        setUnlocking(false);
        onConfirm();
      }, 500);
    } else {
      alert(result.message);
      setUnlocking(false);
    }
  };

  const dailyLimitMessage = status.dailyLimitReached 
    ? '今日转换次数已达上限' 
    : '今日免费次数已用完';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {dailyLimitMessage}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-1">
          想继续使用"一键转选择题"（免输入）？
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          解锁 Pro 可获得更多 AI 额度 + 完整 7 天游标路线。
        </p>

        <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-3">
            解锁后你将获得：
          </h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>一键转选择题：200 次（7 天）</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>AI 错因诊断：看懂为什么错</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>解锁 Day2–Day7：完整提分路线 + 复测卷 + 提分报告</span>
            </li>
          </ul>
        </div>

        {/* 套餐卡 - 主推7天 */}
        <div className="mb-4 border-2 border-purple-500 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {PLAN_CONFIG['7d'].name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                免输入更快刷题 + 完整提分路线
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ¥{PLAN_CONFIG['7d'].price}
              </p>
              <p className="text-xs text-gray-500">/ 7 天</p>
            </div>
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
            <li>• 一键转选择题：{PLAN_CONFIG['7d'].totalQuota} 次</li>
            <li>• 解锁 Day2–Day7 路线</li>
            <li>• 复测卷 + 提分报告</li>
          </ul>
          <button
            onClick={() => handleUnlock('7d')}
            disabled={unlocking}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {unlocking ? '解锁中...' : '¥19 解锁并继续'}
          </button>
        </div>

        {/* 其他套餐（可选） */}
        <details className="mb-4">
          <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
            查看其他套餐
          </summary>
          <div className="mt-3 space-y-2">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900 dark:text-white">
                  {PLAN_CONFIG['30d'].name}
                </h5>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ¥{PLAN_CONFIG['30d'].price}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                AI转换：{PLAN_CONFIG['30d'].totalQuota}次 · 30天有效
              </p>
              <button
                onClick={() => handleUnlock('30d')}
                disabled={unlocking}
                className="w-full px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                解锁
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900 dark:text-white">
                  {PLAN_CONFIG['60d'].name}
                </h5>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ¥{PLAN_CONFIG['60d'].price}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                AI转换：{PLAN_CONFIG['60d'].totalQuota}次 · 60天有效
              </p>
              <button
                onClick={() => handleUnlock('60d')}
                disabled={unlocking}
                className="w-full px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                解锁
              </button>
            </div>
          </div>
        </details>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          先不用了
        </button>
      </div>
    </div>
  );
}

