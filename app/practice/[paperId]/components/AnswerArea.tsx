'use client';

import { useRef, useEffect } from 'react';
import MathText from '@/components/MathText';
import type { Question } from '@/types';

interface AnswerAreaProps {
  question: Question;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  submitted: boolean;
  isCorrect: boolean | null;
  onSubmit: () => void;
  onModifyAnswer?: () => void;
}

export default function AnswerArea({
  question,
  userAnswer,
  onAnswerChange,
  submitted,
  isCorrect,
  onSubmit,
  onModifyAnswer,
}: AnswerAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 键盘支持：Enter 提交
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !submitted && userAnswer.trim() && question.type === 'fill') {
        e.preventDefault();
        onSubmit();
      }
    };

    if (question.type === 'fill' && inputRef.current) {
      inputRef.current.addEventListener('keydown', handleKeyDown);
      return () => {
        inputRef.current?.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [submitted, userAnswer, question.type, onSubmit]);

  const handleOptionClick = (optionValue: string) => {
    if (submitted && onModifyAnswer) {
      // 如果已提交，点击选项时先取消提交状态
      onModifyAnswer();
      // 然后选择新选项
      onAnswerChange(optionValue);
    } else {
      const newValue = userAnswer === optionValue ? '' : optionValue;
      onAnswerChange(newValue);
    }
  };

  // 选择题
  if (question.type === 'choice' && question.options) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3 mb-4">
          {question.options.map((option, idx) => {
            // 从选项中提取字母和内容 (格式: "A. xxx")
            const optionMatch = option.match(/^([A-D])[\.、]\s*(.+)$/);
            const optionValue = optionMatch ? optionMatch[1] : String.fromCharCode(65 + idx); // A, B, C, D
            const optionContent = optionMatch ? optionMatch[2] : option;
            
            const isSelected = userAnswer === optionValue;
            const isCorrectOption = question.answer.startsWith(optionValue);
            const isUserWrong = submitted && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(optionValue)}
                disabled={submitted && !onModifyAnswer}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all relative ${
                  !submitted
                    ? isSelected
                      ? 'border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    : isCorrectOption
                    ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                    : isUserWrong
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start">
                  {submitted && (isCorrectOption || isUserWrong) && (
                    <span className="mr-2 text-lg">
                      {isCorrectOption ? '✅' : '✗'}
                    </span>
                  )}
                  <span className="font-semibold text-gray-700 dark:text-gray-300 mr-3 min-w-[24px]">
                    {optionValue}.
                  </span>
                  <span className="flex-1 text-gray-800 dark:text-gray-200">
                    <MathText content={optionContent} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {!submitted && !userAnswer && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            请选择一个选项，然后点击「提交本题」
          </p>
        )}

        {!submitted && userAnswer && (
          <div className="flex justify-end">
            <button
              onClick={onSubmit}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
            >
              提交本题
            </button>
          </div>
        )}

        {submitted && onModifyAnswer && (
          <div className="flex justify-end">
            <button
              onClick={onModifyAnswer}
              className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              修改后重新提交
            </button>
          </div>
        )}
      </div>
    );
  }

  // 填空题
  if (question.type === 'fill') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            (1) 填写答案：
          </label>
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={submitted && !onModifyAnswer}
            placeholder="例如：1/2、e、ln2 等"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white disabled:opacity-60"
          />
        </div>
        {!submitted && (
          <div className="flex items-start justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">
              请输入数字或简单的式子，系统会自动判断等价形式
            </p>
            <button
              onClick={onSubmit}
              disabled={!userAnswer.trim()}
              className="ml-4 px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title={!userAnswer.trim() ? '请先作答再提交' : ''}
            >
              提交本题
            </button>
          </div>
        )}
        {submitted && onModifyAnswer && (
          <div className="flex justify-end">
            <button
              onClick={onModifyAnswer}
              className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              修改后重新提交
            </button>
          </div>
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
          disabled={submitted && !onModifyAnswer}
          placeholder="请输入解答过程（可选）"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-[150px] disabled:opacity-60"
        />
        {!submitted && (
          <div className="flex justify-end mt-3">
            <button
              onClick={onSubmit}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
            >
              查看参考解答
            </button>
          </div>
        )}
        {submitted && onModifyAnswer && (
          <div className="flex justify-end mt-3">
            <button
              onClick={onModifyAnswer}
              className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              修改后重新提交
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
