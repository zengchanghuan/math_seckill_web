'use client';

import { useState, useEffect, useRef } from 'react';
import MathText from '@/components/MathText';
import { detectLatexErrors } from '@/lib/latexValidator';
import type { Question } from '@/types';

interface SolutionPanelProps {
  question: Question;
  isCorrect: boolean | null;
  correctAnswer: string;
  userAnswer: string;
}

export default function SolutionPanel({ question, isCorrect, correctAnswer, userAnswer }: SolutionPanelProps) {
  const [showDetailed, setShowDetailed] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixedSolution, setFixedSolution] = useState<string | null>(null);
  const [errorDetected, setErrorDetected] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 提交后自动滚动到解析区
  useEffect(() => {
    if (isCorrect !== null && panelRef.current) {
      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [isCorrect]);

  // 检测解析内容是否有错误
  useEffect(() => {
    if (question.solution) {
      const { hasError, errors } = detectLatexErrors(question.solution);
      if (hasError) {
        setErrorDetected(true);
        console.warn('检测到答案解析有误:', errors);
        // 自动触发修复
        handleAutoFix();
      }
    }
  }, [question.questionId]);

  // 自动修复解析
  const handleAutoFix = async () => {
    if (isFixing) return;
    
    setIsFixing(true);
    try {
      const response = await fetch('/api/fix-solution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question || question.content,
          answer: correctAnswer,
          errorType: 'LaTeX语法错误',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFixedSolution(data.solution);
        setErrorDetected(false);
        console.log('✅ 解析已自动修复');
      } else {
        console.error('自动修复失败:', await response.text());
      }
    } catch (error) {
      console.error('自动修复出错:', error);
    } finally {
      setIsFixing(false);
    }
  };

  // 获取简短解析（去除"关键思路："前缀）
  const getShortSolution = () => {
    // 优先使用修复后的解析
    if (fixedSolution) {
      return fixedSolution.replace(/^【精析】/, '');
    }
    
    if (question.shortSolution) {
      // 如果包含"关键思路："，去掉它
      return question.shortSolution.replace(/^关键思路[：:]\s*/, '');
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
    // 优先使用修复后的解析
    if (fixedSolution) {
      return fixedSolution.replace(/^【精析】/, '');
    }
    
    if (question.detailedSolution) {
      return question.detailedSolution;
    }
    return question.solution || '';
  };

  const shortSolution = getShortSolution();
  const detailedSolution = getDetailedSolution();

  if (isCorrect === null) {
    return null;
  }

  // 获取评价文案
  const getEvaluation = () => {
    if (question.type === 'solution') {
      return '参考解答如下';
    }
    if (isCorrect) {
      return '基础计算掌握得不错';
    } else {
      // 根据知识点生成评价
      if (question.knowledgePoints && question.knowledgePoints.length > 0) {
        return `这题主要卡在「${question.knowledgePoints[0]}」`;
      }
      return '需要再仔细检查一下';
    }
  };

  return (
    <div ref={panelRef} className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* 自动修复提示 */}
      {isFixing && (
        <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm text-blue-700 dark:text-blue-300">正在使用 AI 修正答案解析...</span>
        </div>
      )}
      
      {fixedSolution && !isFixing && (
        <div className="mb-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <span className="text-sm text-green-700 dark:text-green-300">✓ 答案解析已自动修正</span>
        </div>
      )}
      
      {/* 结果提示 - 白底 + 左侧色条 */}
      <div className={`flex border-l-4 ${
        question.type === 'solution' 
          ? 'border-l-blue-500 dark:border-l-blue-400'
          : isCorrect
          ? 'border-l-green-500 dark:border-l-green-400'
          : 'border-l-red-500 dark:border-l-red-400'
      } pl-4 py-2 mb-3`}>
        <div className="flex-1">
          <p className={`text-sm font-semibold mb-1 ${
            question.type === 'solution'
              ? 'text-blue-700 dark:text-blue-300'
              : isCorrect
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {question.type === 'solution' 
              ? '📖 参考解答' 
              : isCorrect ? '✅ 回答正确' : '✗ 回答错误'
            } · {getEvaluation()}
          </p>
          {!isCorrect && question.type !== 'solution' && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              正确答案：<MathText content={correctAnswer} />
            </p>
          )}
          {isCorrect && question.type !== 'solution' && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              这类基础计算已经掌握得不错，可以稍微加快刷题速度。
            </p>
          )}
        </div>
      </div>

      {/* 关键思路（免费） */}
      {shortSolution && (
        <div className="pl-4 mb-3">
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <MathText content={shortSolution} />
          </div>
        </div>
      )}

      {/* 详细解析（Pro功能） */}
      {detailedSolution && detailedSolution !== shortSolution && (
        <div className="pl-4">
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
