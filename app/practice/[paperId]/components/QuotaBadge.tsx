/**
 * AI额度展示入口
 */

'use client';

import { useState, useEffect } from 'react';
import { getQuotaStatus, formatExpiryDate, getAIQuota } from '@/lib/quota/manager';
import type { QuotaStatus } from '@/lib/quota/types';

export default function QuotaBadge() {
  const [status, setStatus] = useState<QuotaStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 初始加载
    setStatus(getQuotaStatus());

    // 监听额度变化
    const handleStorageChange = () => {
      setStatus(getQuotaStatus());
    };

    window.addEventListener('storage', handleStorageChange);
    // 自定义事件用于同页面更新
    window.addEventListener('quotaUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('quotaUpdate', handleStorageChange);
    };
  }, []);

  if (!status) return null;

  const aiQuota = getAIQuota();
  const expiryDate = aiQuota ? formatExpiryDate(aiQuota.expiresAt) : '';

  return (
    <>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors text-sm"
      >
        <span className="font-medium">AI 额度</span>
        {status.hasPro ? (
          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
            {status.proRemaining}
          </span>
        ) : (
          <span className="text-xs">
            {status.freeRemaining}/3
          </span>
        )}
      </button>

      {/* 详情弹窗 */}
      {showDetails && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              AI 额度详情
            </h3>

            <div className="space-y-3 mb-6">
              {/* 免费额度 */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    今日免费转换
                  </span>
                  <span className={`text-sm font-semibold ${
                    status.hasFreeTries 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    已用 {3 - status.freeRemaining}/3
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(status.freeRemaining / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Pro额度 */}
              {status.hasPro && aiQuota && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                      AI 额度（Pro）
                    </span>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      剩余 {status.proRemaining} 次
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-900/40 rounded-full h-2 mb-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(status.proRemaining / aiQuota.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400">
                    <span>有效期至 {expiryDate}</span>
                    <span>今日已用 {aiQuota.dailyUsed}/{aiQuota.dailyLimit}</span>
                  </div>
                </div>
              )}

              {/* 未解锁提示 */}
              {!status.hasPro && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    🎁 解锁 Pro 可获得更多 AI 转换额度
                  </p>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      // 触发打开升级弹窗（可通过自定义事件）
                      window.dispatchEvent(new CustomEvent('openUpgradeModal'));
                    }}
                    className="w-full px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    升级套餐
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}



