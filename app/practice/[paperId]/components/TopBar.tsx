'use client';

import { useState } from 'react';
import ModeSwitch from './ModeSwitch';
import type { ExamPaper } from '@/types';

interface TopBarProps {
  paper: ExamPaper;
  currentIndex: number;
  totalQuestions: number;
  currentMode: 'objective' | 'solution';
  onModeChange: (mode: 'objective' | 'solution') => void;
  elapsedTime: number;
  unansweredCount: number;
  onExit: () => void;
}

export default function TopBar({
  paper,
  currentIndex,
  totalQuestions,
  currentMode,
  onModeChange,
  elapsedTime,
  unansweredCount,
  onExit,
}: TopBarProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {paper.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              共 {totalQuestions} 题 · 当前第 {currentIndex + 1} 题
            </p>
          </div>

          <div className="hidden md:flex items-center mx-4">
            <ModeSwitch currentMode={currentMode} onModeChange={onModeChange} />
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              已用时 {formatTime(elapsedTime)}
            </div>
            <button
              onClick={() => setShowExitConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              退出练习
            </button>
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
              还有 {unansweredCount} 道题未作答，结束后会生成本套的成绩统计。
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
