'use client';

import { useState } from 'react';
import type { Question } from '@/types';

interface QuestionNavProps {
  questions: Question[];
  currentIndex: number;
  questionStatus: Record<string, 'unanswered' | 'answered' | 'wrong'>;
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

  const getQuestionStatus = (index: number): 'unanswered' | 'answered' | 'wrong' => {
    const question = questions[index];
    if (!question) return 'unanswered';
    return questionStatus[question.questionId] || 'unanswered';
  };

  const getStatusColor = (status: 'unanswered' | 'answered' | 'wrong', isCurrent: boolean) => {
    if (isCurrent) {
      return 'bg-primary-600 dark:bg-primary-400 text-white border-2 border-primary-700 dark:border-primary-300';
    }
    switch (status) {
      case 'answered':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'wrong':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const filteredQuestions = questions.filter((q, idx) => {
    const status = getQuestionStatus(idx);
    if (filter === 'unanswered') return status === 'unanswered';
    if (filter === 'wrong') return status === 'wrong';
    return true;
  });

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const unansweredCount = totalQuestions - answeredCount;

  const navContent = (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* 筛选按钮 */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            filter === 'all'
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          全部题目
        </button>
        <button
          onClick={() => onFilterChange('unanswered')}
          className={`px-3 py-1 text-xs font-medium rounded ${
            filter === 'unanswered'
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          未作答
        </button>
        {answeredCount > 0 && (
          <button
            onClick={() => onFilterChange('wrong')}
            className={`px-3 py-1 text-xs font-medium rounded ${
              filter === 'wrong'
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
              className={`w-10 h-10 rounded text-sm font-medium transition-all ${getStatusColor(status, isCurrent)}`}
            >
              {originalIndex + 1}
            </button>
          );
        })}
      </div>

      {/* 统计信息 */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2 text-sm">
        <div className="text-gray-700 dark:text-gray-300">
          已作答：{answeredCount} / {totalQuestions}
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          正确：{correctCount} 题 · 正确率：{accuracy}%
        </div>
        <div className="text-gray-700 dark:text-gray-300">
          剩余未作答：{unansweredCount} 题
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
