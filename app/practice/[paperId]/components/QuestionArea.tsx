'use client';

import MathText from '@/components/MathText';
import type { Question } from '@/types';

interface QuestionAreaProps {
  question: Question;
  questionNumber: number;
  showSkip?: boolean;
  onSkip?: () => void;
}

export default function QuestionArea({ question, questionNumber, showSkip = false, onSkip }: QuestionAreaProps) {
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
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center flex-wrap gap-2">
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
        {/* 方案一：跳过按钮在标题行右侧 */}
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors border border-primary-200 dark:border-primary-800"
          >
            不会 · 先跳过
          </button>
        )}
      </div>

      {/* 题干区域 */}
      <div className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mt-4" style={{ display: 'flow-root' }}>
        <MathText content={question.question} />
      </div>

      {/* 题目图片 */}
      {question.images && question.images.length > 0 && (
        <div className="mt-4 space-y-3">
          {question.images.map((image, idx) => (
            <div key={idx} className="flex justify-center">
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-md">
                <img
                  src={image.url}
                  alt={image.alt_text || `题目配图${idx + 1}`}
                  className="w-full h-auto max-h-80 object-contain"
                  loading="lazy"
                />
                {image.caption && (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400 text-center">
                    {image.caption}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
