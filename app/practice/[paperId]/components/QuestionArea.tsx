'use client';

import MathText from '@/components/MathText';
import type { Question } from '@/types';

interface QuestionAreaProps {
  question: Question;
  questionNumber: number;
}

export default function QuestionArea({ question, questionNumber }: QuestionAreaProps) {
  const getTypeText = (type: string) => {
    switch (type) {
      case 'choice':
        return '单选题';
      case 'fill':
        return '填空题';
      case 'solution':
        return '解答题';
      default:
        return '';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'L1':
        return '基础 L1';
      case 'L2':
        return '提升 L2';
      case 'L3':
        return '挑战 L3';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      {/* 题目头部信息 */}
      <div className="flex items-center flex-wrap gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
          第 {questionNumber} 题
        </h3>
        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium border border-blue-100 dark:border-blue-800">
          {getTypeText(question.type)}
        </span>
        <span className="px-2.5 py-1 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg text-xs font-medium">
          {getDifficultyText(question.difficulty)}
        </span>
        {question.knowledgePoints && question.knowledgePoints.length > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            考点：{question.knowledgePoints.join('、')}
          </span>
        )}
      </div>

      {/* 题干区域 */}
      <div className="text-gray-900 dark:text-gray-100 text-base leading-relaxed mt-5">
        <MathText content={question.question} />
      </div>
    </div>
  );
}
