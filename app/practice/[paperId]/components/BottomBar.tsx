'use client';

import { useState } from 'react';

interface BottomBarProps {
  currentIndex: number;
  totalQuestions: number;
  questionStatus: 'unanswered' | 'answered' | 'wrong';
  isMarked: boolean;
  canSkip: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  onMark: () => void;
  onSkip: () => void;
  onSubmit: () => void;
  hasAnswer: boolean;
}

export default function BottomBar({
  currentIndex,
  totalQuestions,
  questionStatus,
  isMarked,
  canSkip,
  onPrevious,
  onNext,
  onFinish,
  onMark,
  onSkip,
  onSubmit,
  hasAnswer,
}: BottomBarProps) {
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const getStatusText = () => {
    switch (questionStatus) {
      case 'answered':
        return '';
      case 'wrong':
        return '';
      default:
        return '请选择一个答案';
    }
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <>
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* 左侧：提示文字 */}
          <div className="text-sm text-gray-400 dark:text-gray-500">
            {getStatusText()}
          </div>

          {/* 右侧：操作按钮组 */}
          <div className="flex items-center gap-2">
            {/* 上一题 */}
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>上一题</span>
            </button>

            {/* 标记 */}
            <button
              onClick={onMark}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isMarked
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                  : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill={isMarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>标记</span>
            </button>

            {/* 暂时不会 */}
            {canSkip && (
              <button
                onClick={onSkip}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>暂时不会</span>
              </button>
            )}

            {/* 提交并下一题 / 结束练习 */}
            {isLastQuestion ? (
              <button
                onClick={() => setShowFinishConfirm(true)}
                disabled={!hasAnswer && questionStatus === 'unanswered'}
                className="px-6 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                结束练习
              </button>
            ) : (
              <button
                onClick={() => {
                  if (questionStatus === 'unanswered' && hasAnswer) {
                    onSubmit();
                  }
                  onNext();
                }}
                disabled={!hasAnswer && questionStatus === 'unanswered'}
                className="px-6 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {questionStatus === 'unanswered' ? '提交并下一题' : '下一题'}
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
