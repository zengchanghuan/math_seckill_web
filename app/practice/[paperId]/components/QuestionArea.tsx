'use client';

import MathText from '@/components/MathText';
import type { Question } from '@/types';

interface QuestionAreaProps {
  question: Question;
  questionNumber: number;
}

export default function QuestionArea({ question, questionNumber }: QuestionAreaProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'L1':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'L2':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'L3':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'L1':
        return '基础';
      case 'L2':
        return '提升';
      case 'L3':
        return '挑战';
      default:
        return '';
    }
  };

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* 题目头部信息 - 标签样式 */}
      <div className="flex items-center flex-wrap gap-2 mb-4">
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          第 {questionNumber} 题
        </span>
        <span className="text-gray-400 dark:text-gray-500">｜</span>
        <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
          {getTypeText(question.type)}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
          {getDifficultyText(question.difficulty)} {question.difficulty}
        </span>
        {question.knowledgePoints && question.knowledgePoints.length > 0 && (
          <>
            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
              考点：{question.knowledgePoints.join('·')}
            </span>
          </>
        )}
      </div>

      {/* 题干区域 */}
      <div className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mt-4">
        <MathText content={question.question} />
      </div>
    </div>
  );
}
