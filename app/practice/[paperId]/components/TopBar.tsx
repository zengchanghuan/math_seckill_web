'use client';

import { useState } from 'react';
import type { ExamPaper } from '@/types';

interface TopBarProps {
  paper: ExamPaper;
  currentIndex: number;
  totalQuestions: number;
  elapsedTime: number;
  answeredCount: number;
  onExit: () => void;
}

export default function TopBar({
  paper,
  currentIndex,
  totalQuestions,
  elapsedTime,
  answeredCount,
  onExit,
}: TopBarProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          {/* 左侧：标题和进度 */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white truncate">
              {paper.name}
            </h1>
            <span className="text-base text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {currentIndex + 1}/{totalQuestions}
            </span>
          </div>

          {/* 中间：进度条 */}
          <div className="hidden md:block flex-1 max-w-md">
            <div className="h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 dark:bg-white transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* 右侧：计时器和退出按钮 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-base">{formatTime(elapsedTime)}</span>
            </div>
            <button
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>退出练习</span>
            </button>
          </div>
        </div>

        {/* 移动端进度条 */}
        <div className="md:hidden mt-3">
          <div className="h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 dark:bg-white transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              确认结束本套练习？
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              还有 {totalQuestions - answeredCount} 道题未作答，结束后会生成本套的成绩统计。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                继续作答
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                确认结束
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
