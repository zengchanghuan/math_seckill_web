'use client';

import MathText from '@/components/MathText';
import type { Question } from '@/types';

interface AnswerAreaProps {
  question: Question;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  submitted: boolean;
  isCorrect: boolean | null;
}

export default function AnswerArea({
  question,
  userAnswer,
  onAnswerChange,
  submitted,
  isCorrect,
}: AnswerAreaProps) {
  const handleOptionClick = (optionValue: string) => {
    if (submitted) return;
    const newValue = userAnswer === optionValue ? '' : optionValue;
    onAnswerChange(newValue);
  };

  // 选择题
  if (question.type === 'choice' && question.options) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3 mb-4">
          {question.options.map((option, idx) => {
            const optionValue = option[0];
            const isSelected = userAnswer === optionValue;
            const isCorrectOption = question.answer === optionValue;
            const showResult = submitted && isCorrectOption;

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(optionValue)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${
                  showResult
                    ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                    : ''
                } ${
                  submitted && !isSelected && !showResult ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 mr-3 min-w-[24px]">
                    {optionValue}.
                  </span>
                  <span className="flex-1 text-gray-800 dark:text-gray-200">
                    <MathText content={option.substring(2)} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {!submitted && !userAnswer && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            请选择一个选项，然后点击「提交本题」
          </p>
        )}

        {submitted && userAnswer && (
          <div className={`p-3 rounded-lg ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className={`text-sm font-medium ${
              isCorrect
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }`}>
              你的选择：{userAnswer} {isCorrect ? '（正确）' : '（错误）'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // 填空题
  if (question.type === 'fill') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            (1) 填写答案：
          </label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={submitted}
            placeholder="请输入数字或简单的式子，如 1/2, e, ln2 等"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:opacity-60"
          />
        </div>
        {!submitted && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            请输入数字或简单的式子，如 1/2, e, ln2 等
          </p>
        )}
      </div>
    );
  }

  // 解答题
  if (question.type === 'solution') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          建议先在纸上完整写出解题过程，再对照参考解析。
        </p>
        <textarea
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={submitted}
          placeholder="请输入解答过程（可选）"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[150px] disabled:opacity-60"
        />
      </div>
    );
  }

  return null;
}
