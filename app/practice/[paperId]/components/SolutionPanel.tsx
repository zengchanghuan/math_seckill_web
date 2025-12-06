'use client';

import { useState } from 'react';
import MathText from '@/components/MathText';
import type { Question } from '@/types';

interface SolutionPanelProps {
  question: Question;
  isCorrect: boolean | null;
  correctAnswer: string;
}

export default function SolutionPanel({ question, isCorrect, correctAnswer }: SolutionPanelProps) {
  const [showDetailed, setShowDetailed] = useState(false);

  // 获取简短解析
  const getShortSolution = () => {
    if (question.shortSolution) {
      return question.shortSolution;
    }
    // 如果没有 shortSolution，从 solution 截取前3行
    if (question.solution) {
      const lines = question.solution.split('\n').slice(0, 3);
      return lines.join('\n');
    }
    return '';
  };

  // 获取详细解析
  const getDetailedSolution = () => {
    if (question.detailedSolution) {
      return question.detailedSolution;
    }
    // 如果没有 detailedSolution，使用完整的 solution
    return question.solution || '';
  };

  const shortSolution = getShortSolution();
  const detailedSolution = getDetailedSolution();

  if (isCorrect === null) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      {/* 结果提示 */}
      <div
        className={`p-4 rounded-lg ${
          isCorrect
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}
      >
        <p className={`font-semibold ${
          isCorrect
            ? 'text-green-700 dark:text-green-300'
            : 'text-red-700 dark:text-red-300'
        }`}>
          {isCorrect ? '✓ 回答正确' : '✗ 回答错误'}
        </p>
        <p className="mt-2 text-gray-700 dark:text-gray-300">
          正确答案：<MathText content={correctAnswer} />
        </p>
      </div>

      {/* 简短解析（免费） */}
      {shortSolution && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            关键思路：
          </p>
          <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            <MathText content={shortSolution} />
          </div>
        </div>
      )}

      {/* 详细解析（Pro功能） */}
      {detailedSolution && detailedSolution !== shortSolution && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <button
            onClick={() => setShowDetailed(!showDetailed)}
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-sm"
          >
            {showDetailed ? '收起' : '展开'}完整解析
          </button>
          {showDetailed && (
            <div className="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              <MathText content={detailedSolution} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
