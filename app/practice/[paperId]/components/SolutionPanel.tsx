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
    <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {/* 结果提示 - 浅色反馈卡 */}
      <div
        className={`p-3 rounded-lg ${
          isCorrect
            ? 'bg-green-50/80 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/50'
            : 'bg-red-50/80 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50'
        }`}
      >
        <p className={`text-sm font-semibold mb-1 ${
          isCorrect
            ? 'text-green-700 dark:text-green-300'
            : 'text-red-700 dark:text-red-300'
        }`}>
          {isCorrect ? '✅ 回答正确' : '❌ 回答错误'}
        </p>
        {!isCorrect && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            正确答案：<MathText content={correctAnswer} />
          </p>
        )}
      </div>

      {/* 简短解析（免费） */}
      {shortSolution && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            关键思路：
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <MathText content={shortSolution} />
          </div>
        </div>
      )}

      {/* 详细解析（Pro功能） */}
      {detailedSolution && detailedSolution !== shortSolution && (
        <div>
          <button
            onClick={() => setShowDetailed(!showDetailed)}
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline text-sm"
          >
            {showDetailed ? '收起' : '展开'}完整解析
          </button>
          {showDetailed && (
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              <MathText content={detailedSolution} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
