'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import MathText from '@/components/MathText';
import { apiClient } from '@/lib/api/client';
import { useAppStore } from '@/lib/store/appStore';
import type { Question } from '@/types';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function DrillPage() {
  const { config } = useAppStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);

  const topics = ['导数', '极限', '积分', '三角函数', '代数与方程'];
  const difficulties = ['L1', 'L2', 'L3'];

  useEffect(() => {
    loadQuestions();
  }, [selectedTopic, selectedDifficulty]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      // 这里应该调用后端API获取题目列表
      // 暂时使用模拟数据
      const stats = await apiClient.getQuestionBankStats();
      if (stats) {
        // 实际应该根据筛选条件获取题目
        // 这里简化处理
        setQuestions([]);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !startTime) return;

    const timeSpent = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const currentQuestion = questions[currentIndex];

    const response = await apiClient.submitAnswer({
      studentId: config.studentId,
      questionId: currentQuestion.questionId,
      answer: userAnswer,
      timeSpent,
    });

    if (response) {
      setIsCorrect(response.isCorrect);
      setIsSubmitted(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setIsSubmitted(false);
      setShowSolution(false);
      setStartTime(new Date());
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserAnswer('');
      setIsSubmitted(false);
      setShowSolution(false);
      setStartTime(new Date());
    }
  };

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      setStartTime(new Date());
    }
  }, [currentIndex, questions.length]);

  const currentQuestion = questions[currentIndex];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 筛选器 */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                主题
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">全部</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                难度
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">全部</option>
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 题目卡片 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : currentQuestion ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-6">
            {/* 题目信息 */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-sm">
                  {currentQuestion.difficulty}
                </span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                  {currentQuestion.topic}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* 题目内容 */}
            <div className="prose dark:prose-invert max-w-none">
              <MathText content={currentQuestion.question} />
            </div>

            {/* 选项（选择题） */}
            {currentQuestion.type === 'choice' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = userAnswer === optionLabel;
                  return (
                    <button
                      key={index}
                      onClick={() => !isSubmitted && setUserAnswer(optionLabel)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="font-medium">{optionLabel}. </span>
                      <MathText content={option} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* 填空题输入 */}
            {currentQuestion.type === 'fill' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  请输入答案：
                </label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isSubmitted}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="输入答案..."
                />
              </div>
            )}

            {/* 提交按钮 */}
            {!isSubmitted && (
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                提交答案
              </button>
            )}

            {/* 结果反馈 */}
            {isSubmitted && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg flex items-center space-x-2 ${
                    isCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {isCorrect ? '回答正确！' : '回答错误'}
                  </span>
                </div>

                {!isCorrect && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      正确答案：
                    </p>
                    <MathText content={currentQuestion.answer} />
                  </div>
                )}

                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {showSolution ? '隐藏解析' : '查看解析'}
                </button>

                {showSolution && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg prose dark:prose-invert max-w-none">
                    <MathText content={currentQuestion.solution} displayMode />
                  </div>
                )}
              </div>
            )}

            {/* 导航按钮 */}
            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>上一题</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>下一题</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              暂无题目，请调整筛选条件或等待题目加载
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
