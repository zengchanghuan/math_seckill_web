'use client';

import { useState } from 'react';
import type { Question } from '@/types';

interface QuestionNavProps {
  questions: Question[];
  currentIndex: number;
  questionStatus: Record<string, 'unanswered' | 'answered' | 'wrong' | 'skipped'>;
  onQuestionClick: (index: number) => void;
  filter: 'all' | 'unanswered' | 'wrong';
  onFilterChange: (filter: 'all' | 'unanswered' | 'wrong') => void;
  answeredCount: number;
  correctCount: number;
  totalQuestions: number;
  isMobile?: boolean;
}

export default function QuestionNav({
  questions,
  currentIndex,
  questionStatus,
  onQuestionClick,
  filter,
  onFilterChange,
  answeredCount,
  correctCount,
  totalQuestions,
  isMobile = false,
}: QuestionNavProps) {
  const [showMobileNav, setShowMobileNav] = useState(false);

  const getQuestionStatus = (index: number): 'unanswered' | 'answered' | 'wrong' | 'skipped' => {
    const question = questions[index];
    if (!question) return 'unanswered';
    return questionStatus[question.questionId] || 'unanswered';
  };

  const getStatusColor = (status: 'unanswered' | 'answered' | 'wrong' | 'skipped', isCurrent: boolean) => {
    if (isCurrent) {
      return 'bg-primary-600 dark:bg-primary-400 text-white border-2 border-primary-700 dark:border-primary-300';
    }
    switch (status) {
      case 'answered':
        return 'bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300';
      case 'wrong':
        return 'bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300';
      case 'skipped':
        return 'bg-orange-50 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600';
    }
  };

  const filteredQuestions = questions.filter((q, idx) => {
    const status = getQuestionStatus(idx);
    if (filter === 'unanswered') return status === 'unanswered' || status === 'skipped';
    if (filter === 'wrong') return status === 'wrong';
    return true;
  });

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const navContent = (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* 筛选按钮 */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1 text-xs font-medium rounded ${filter === 'all'
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
        >
          全部题目
        </button>
        <button
          onClick={() => onFilterChange('unanswered')}
          className={`px-3 py-1 text-xs font-medium rounded ${filter === 'unanswered'
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
        >
          未作答
        </button>
        {answeredCount > 0 && (
          <button
            onClick={() => onFilterChange('wrong')}
            className={`px-3 py-1 text-xs font-medium rounded ${filter === 'wrong'
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
          >
            答错题
          </button>
        )}
      </div>

      {/* 题号矩阵 */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {filteredQuestions.map((q, idx) => {
          const originalIndex = questions.indexOf(q);
          const status = getQuestionStatus(originalIndex);
          const isCurrent = originalIndex === currentIndex;

          return (
            <button
              key={q.questionId}
              onClick={() => {
                onQuestionClick(originalIndex);
                if (isMobile) setShowMobileNav(false);
              }}
              className={`w-10 h-10 rounded text-sm font-medium transition-all relative ${getStatusColor(status, isCurrent)}`}
              title={status === 'skipped' ? '已跳过' : ''}
            >
              {originalIndex + 1}
              {status === 'skipped' && !isCurrent && (
                <span className="absolute -top-1 -right-1 text-[10px] text-orange-600 dark:text-orange-400">跳</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 统计信息 - 整合成一行 */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="text-xs text-gray-700 dark:text-gray-300 text-center">
          已作答：{answeredCount} / {totalQuestions}　｜　正确：{correctCount} 题　｜　正确率：{accuracy}%
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setShowMobileNav(true)}
          className="fixed bottom-20 left-4 z-40 bg-primary-600 text-white p-3 rounded-full shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
        </button>

        {showMobileNav && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white dark:bg-gray-800 w-full max-h-[80vh] overflow-y-auto rounded-t-lg">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">题号导航</h3>
                <button
                  onClick={() => setShowMobileNav(false)}
                  className="text-gray-600 dark:text-gray-400"
                >
                  ✕
                </button>
              </div>
              {navContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return navContent;
}
