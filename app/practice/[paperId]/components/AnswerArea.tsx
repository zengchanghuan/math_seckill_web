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
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-3">
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
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                  !submitted
                    ? isSelected
                      ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-700/50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    : isCorrectOption
                    ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                    : isUserWrong
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                {/* 选项字母标识 */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 ${
                  !submitted
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : isCorrectOption
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                    : isUserWrong
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500'
                }`}>
                  <span className="font-medium text-base">{optionValue}</span>
                </div>

                {/* 选项内容 */}
                <div className="flex-1 pt-0.5">
                  <MathText content={optionContent} />
                </div>

                {/* 正确/错误标识 */}
                {submitted && (isCorrectOption || isUserWrong) && (
                  <div className="flex-shrink-0 text-xl">
                    {isCorrectOption ? '✅' : '❌'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 填空题
  if (question.type === 'fill') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            填写答案：
          </label>
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={submitted && !onModifyAnswer}
            placeholder="例如：1/2、e、ln2 等"
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white focus:outline-none disabled:opacity-60 transition-colors"
          />
        </div>
        {!submitted && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            请输入数字或简单的式子，系统会自动判断等价形式
          </p>
        )}
      </div>
    );
  }

  // 解答题
  if (question.type === 'solution') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          建议先在纸上完整写出解题过程，再对照参考解析。
        </p>
        <textarea
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={submitted && !onModifyAnswer}
          placeholder="请输入解答过程（可选）"
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white focus:outline-none min-h-[150px] disabled:opacity-60 transition-colors"
        />
      </div>
    );
  }

  return null;
}
