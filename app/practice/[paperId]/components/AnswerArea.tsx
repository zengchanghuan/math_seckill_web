'use client';

import { useState, useRef, useEffect } from 'react';
import MathText from '@/components/MathText';
import QuotaModal from './QuotaModal';
import { getQuotaStatus, consumeQuota } from '@/lib/quota/manager';
import { getMCQCache, saveMCQCache } from '@/lib/quota/cacheManager';
import { getOrCreateRequest, hasInFlightRequest } from '@/lib/quota/inFlightManager';
import { validateMCQResult, tryFixMCQResult } from '@/lib/quota/validator';
import { trackEvent } from '@/lib/quota/analytics';
import type { Question, ConvertToChoiceResult } from '@/types';
import type { QuotaStatus } from '@/lib/quota/types';

interface AnswerAreaProps {
  question: Question;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
  submitted: boolean;
  isCorrect: boolean | null;
  onSubmit: () => void;
  onModifyAnswer?: () => void;
  disableConvert?: boolean; // 禁用转换功能（用于测评/模考场景）
}

export default function AnswerArea({
  question,
  userAnswer,
  onAnswerChange,
  submitted,
  isCorrect,
  onSubmit,
  onModifyAnswer,
  disableConvert = false,
}: AnswerAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [convertedChoice, setConvertedChoice] = useState<ConvertToChoiceResult | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false); // 控制是否显示答案
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 初始化：检查缓存
  useEffect(() => {
    const cached = getMCQCache(question.id, question.answer);
    if (cached) {
      setConvertedChoice(cached);
      trackEvent('mcq_cache_hit', { questionId: question.id });
    }
  }, [question.id, question.answer]);

  // 检查额度状态
  const checkQuota = () => {
    const status = getQuotaStatus();
    setQuotaStatus(status);
    return status;
  };

  // 调用API生成选择题（带重试）
  const callGenerateAPI = async (attemptNum: number = 1): Promise<ConvertToChoiceResult> => {
    console.log(`[MCQ Generate] 尝试 ${attemptNum}/2`);
    
    const response = await fetch('/api/convert-to-choice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stem: question.question,
        answer: question.answer,
        solution: question.solution,
        knowledge: question.knowledgePoints,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data.result;

    // 校验结果
    const validation = validateMCQResult(result);
    if (!validation.valid) {
      console.error('[MCQ Validate] 校验失败:', validation.errors);
      
      // 尝试修复
      const fixed = tryFixMCQResult(result);
      if (fixed) {
        console.log('[MCQ Validate] 自动修复成功');
        return fixed;
      }
      
      // 第一次失败，重试一次
      if (attemptNum < 2) {
        console.log('[MCQ Generate] 校验失败，重试...');
        return callGenerateAPI(attemptNum + 1);
      }
      
      throw new Error(`校验失败: ${validation.errors.join(', ')}`);
    }

    return result;
  };

  // 点击转换按钮
  const handleConvertClick = () => {
    trackEvent('mcq_click', { questionId: question.id });

    // 1. 如果已展示，直接显示（不扣额度）
    if (convertedChoice) {
      setShowAnswer(false);
      return;
    }

    // 2. 检查in-flight
    if (hasInFlightRequest(question.id)) {
      console.log('[MCQ] 已有请求进行中，等待...');
      setConverting(true);
      return;
    }

    // 3. 检查缓存
    const cached = getMCQCache(question.id, question.answer);
    if (cached) {
      setConvertedChoice(cached);
      setShowAnswer(false);
      trackEvent('mcq_cache_hit', { questionId: question.id });
      return;
    }

    // 4. Cache miss
    trackEvent('mcq_cache_miss', { questionId: question.id });
    
    // 检查额度并打开弹窗
    checkQuota();
    setShowQuotaModal(true);
  };

  // 确认转换（从弹窗）
  const handleConfirmConvert = async () => {
    setShowQuotaModal(false);
    setConverting(true);
    setConvertError(null);
    setRetryCount(0);

    try {
      // 使用in-flight管理器（防止并发重复请求）
      const result = await getOrCreateRequest(question.id, async () => {
        return await callGenerateAPI(1);
      });

      // 5. 写缓存（必须成功）
      const cacheSaved = saveMCQCache(question.id, question.answer, result);
      if (!cacheSaved) {
        throw new Error('缓存保存失败，可能存储空间不足');
      }

      // 6. 扣额度（只在缓存成功后）
      const consumeResult = consumeQuota();
      if (!consumeResult.success) {
        // 理论上不应该走到这里
        console.warn('[MCQ] 额度扣除失败（但已生成）:', consumeResult.message);
        trackEvent('mcq_generate_success', { 
          questionId: question.id,
          quotaDeductFailed: true,
        });
      } else {
        // 成功扣费
        trackEvent('mcq_quota_deduct_success', { 
          questionId: question.id,
          quotaRemaining: getQuotaStatus().proRemaining || getQuotaStatus().freeRemaining,
        });

        // 显示成功提示
        setSuccessMessage(consumeResult.message);
        setTimeout(() => setSuccessMessage(null), 5000);

        // 触发额度更新事件
        window.dispatchEvent(new Event('quotaUpdate'));
      }

      // 7. 展示结果
      setConvertedChoice(result);
      setShowAnswer(false);
      
      trackEvent('mcq_generate_success', { questionId: question.id });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '转换失败';
      setConvertError(errorMessage);

      // 埋点记录失败原因
      let reason = 'unknown';
      if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
        reason = 'timeout';
      } else if (errorMessage.includes('JSON') || errorMessage.includes('json')) {
        reason = 'json_invalid';
      } else if (errorMessage.includes('校验')) {
        reason = 'judge_fail';
      } else if (errorMessage.includes('网络') || errorMessage.includes('network')) {
        reason = 'network_error';
      }

      trackEvent('mcq_generate_fail', { 
        questionId: question.id,
        reason,
        message: errorMessage,
      });

      // 失败不扣费（已在逻辑中保证）
      console.error('[MCQ] 生成失败（未扣费）:', errorMessage);

    } finally {
      setConverting(false);
    }
  };

  // 关闭选择题预览
  const handleCloseConversion = () => {
    setConvertedChoice(null);
    setConvertError(null);
    setShowAnswer(false);
  };

  // 切回输入模式
  const handleSwitchBackToInput = () => {
    setConvertedChoice(null);
    setSuccessMessage(null);
  };

  // 获取额度状态文案
  const getQuotaText = () => {
    if (convertedChoice) return '已转换';
    
    // 实时获取最新状态
    const status = getQuotaStatus();
    
    if (status.hasFreeTries) {
      return `今日免费：剩余 ${status.freeRemaining} 次`;
    }
    if (status.hasPro && status.proRemaining > 0) {
      return `AI 额度：剩余 ${status.proRemaining} 次`;
    }
    return '需要 AI 额度';
  };

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
        {/* 成功提示条 */}
        {successMessage && (
          <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                ✓ 已切换为选择模式（免输入）
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {successMessage}
              </p>
            </div>
            <button
              onClick={handleSwitchBackToInput}
              className="ml-4 text-xs text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline"
            >
              切回输入模式
            </button>
          </div>
        )}

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              (1) 填写答案：
            </label>
            {!disableConvert && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getQuotaText()}
                </span>
                <button
                  onClick={handleConvertClick}
                  disabled={converting}
                  className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
                  title="使用AI将此填空题转换为选择题"
                >
                  {converting ? '转换中...' : convertedChoice ? '✓ 已转换' : '🔄 一键转选择题'}
                </button>
              </div>
            )}
          </div>
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

        {/* 转换错误提示 */}
        {convertError && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">
              ⚠️ {convertError}
            </p>
          </div>
        )}

        {/* 额度弹窗 */}
        {quotaStatus && (
          <QuotaModal
            isOpen={showQuotaModal}
            onClose={() => setShowQuotaModal(false)}
            onConfirm={handleConfirmConvert}
            status={quotaStatus}
          />
        )}

        {/* 选择题预览 */}
        {convertedChoice && (
          <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                ✨ AI转换的选择题
              </h4>
              <button
                onClick={handleCloseConversion}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="关闭"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2">
              {convertedChoice.options.map((option) => {
                const isCorrect = option.key === convertedChoice.correct_key;
                const shouldShowFeedback = showAnswer;
                
                return (
                  <div
                    key={option.key}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      shouldShowFeedback && isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : shouldShowFeedback && !isCorrect
                        ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 mr-3 min-w-[24px]">
                        {option.key}.
                      </span>
                      <div className="flex-1 text-gray-800 dark:text-gray-200">
                        <MathText content={option.text} />
                        
                        {/* 只有在显示答案时才展示错误类型 */}
                        {shouldShowFeedback && !isCorrect && option.error_type && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            错误原因：{option.error_type}
                          </p>
                        )}
                      </div>
                      
                      {/* 只有在显示答案时才展示正确标记 */}
                      {shouldShowFeedback && isCorrect && (
                        <span className="ml-2 text-green-600 dark:text-green-400 font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                💡 AI生成的选择题仅供参考
              </p>
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                {showAnswer ? '隐藏答案' : '查看答案'}
              </button>
            </div>
          </div>
        )}

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
