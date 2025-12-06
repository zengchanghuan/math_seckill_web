'use client';

import { useState } from 'react';

interface BottomBarProps {
  currentIndex: number;
  totalQuestions: number;
  questionStatus: 'unanswered' | 'answered' | 'wrong';
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function BottomBar({
  currentIndex,
  totalQuestions,
  questionStatus,
  onPrevious,
  onNext,
  onFinish,
}: BottomBarProps) {
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const getStatusText = () => {
    switch (questionStatus) {
      case 'answered':
        return '已作答';
      case 'wrong':
        return '回答错误';
      default:
        return '未作答';
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 z-20 md:relative md:border-t-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一题
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            当前题：{getStatusText()}
          </div>

          <div className="flex space-x-2">
            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={onNext}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                下一题
              </button>
            ) : (
              <button
                onClick={() => setShowFinishConfirm(true)}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                结束本套练习
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 结束确认弹窗 */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              确认结束本套练习？
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              结束后会生成本套的成绩统计。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                继续作答
              </button>
              <button
                onClick={() => {
                  setShowFinishConfirm(false);
                  onFinish();
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
