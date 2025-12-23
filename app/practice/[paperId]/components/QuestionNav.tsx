'use client';

import { useState } from 'react';
import type { Question } from '@/types';

interface QuestionNavProps {
  questions: Question[];
  currentIndex: number;
  questionStatus: Record<string, 'unanswered' | 'answered' | 'wrong'>;
  markedQuestions: Set<string>;
  onQuestionClick: (index: number) => void;
  filter: 'all' | 'unanswered' | 'marked';
  onFilterChange: (filter: 'all' | 'unanswered' | 'marked') => void;
  answeredCount: number;
  correctCount: number;
  totalQuestions: number;
  isMobile?: boolean;
}

export default function QuestionNav({
  questions,
  currentIndex,
  questionStatus,
  markedQuestions,
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

  const isMarked = (index: number): boolean => {
    const question = questions[index];
    return question ? markedQuestions.has(question.questionId) : false;
  };

  const getStatusColor = (status: 'unanswered' | 'answered' | 'wrong', isCurrent: boolean, marked: boolean) => {
    if (isCurrent) {
      return 'bg-blue-500 dark:bg-blue-600 text-white shadow-[0_0_0_2px_white,0_0_0_4px_rgb(59,130,246)]';
    }
    
    // 未答题的灰色背景
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
  };

  const filteredQuestions = questions.filter((q, idx) => {
    const status = getQuestionStatus(idx);
    const marked = isMarked(idx);
    
    if (filter === 'unanswered') return status === 'unanswered';
    if (filter === 'marked') return marked;
    return true;
  });

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const navContent = (
    <div className="space-y-4">
      {/* 题号导航卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        {/* 筛选标签 */}
        <div className="flex gap-2 pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 dark:bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => onFilterChange('unanswered')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              filter === 'unanswered'
                ? 'bg-blue-500 dark:bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            未作答
          </button>
          <button
            onClick={() => onFilterChange('marked')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
              filter === 'marked'
                ? 'bg-blue-500 dark:bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            标记
          </button>
        </div>

        {/* 题号网格 */}
        <div className="grid grid-cols-5 gap-3">
          {filteredQuestions.map((q, idx) => {
            const originalIndex = questions.indexOf(q);
            const status = getQuestionStatus(originalIndex);
            const isCurrent = originalIndex === currentIndex;
            const marked = isMarked(originalIndex);

            return (
              <button
                key={q.questionId}
                onClick={() => {
                  onQuestionClick(originalIndex);
                  if (isMobile) setShowMobileNav(false);
                }}
                className={`relative h-10 rounded-xl text-sm font-medium transition-all ${getStatusColor(status, isCurrent, marked)}`}
              >
                {originalIndex + 1}
                {/* 标记角标 */}
                {marked && !isCurrent && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 dark:bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 答题统计卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          答题统计
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">已答题</span>
            <span className="text-base text-gray-900 dark:text-white">
              {answeredCount} / {totalQuestions}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">正确</span>
            <span className="text-base text-green-600 dark:text-green-400">
              {correctCount} 题
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">正确率</span>
            <span className="text-base text-blue-600 dark:text-blue-400">
              {accuracy}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setShowMobileNav(true)}
          className="fixed bottom-20 right-4 z-40 bg-primary-600 text-white p-3 rounded-full shadow-lg"
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
            <div className="bg-gray-50 dark:bg-gray-900 w-full max-h-[80vh] overflow-y-auto rounded-t-2xl p-4">
              <div className="flex justify-between items-center mb-4">
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
