'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import MathText from '@/components/MathText';
import type { Question, AssessmentAnswer } from '@/types';
import { loadAllAssessmentQuestions } from '@/lib/assessment/questionLoader';
import { guessErrorReason, getSpeedRating } from '@/lib/assessment/ruleEngine';

export default function AssessmentRunPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    status: '正确' | '错误';
    time: number;
    speed: string;
    reason?: string;
  } | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(300); // 5分钟 = 300秒

  // 加载题目
  useEffect(() => {
    async function fetchQuestions() {
      try {
        console.log('开始加载测评题目...');
        const qs = await loadAllAssessmentQuestions();
        console.log('成功加载题目:', qs.length, '道');
        console.log('第一道题:', qs[0]);
        setQuestions(qs);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load questions:', error);
        alert('加载题目失败，请刷新重试');
      }
    }
    fetchQuestions();
  }, []);

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  const handleSubmit = () => {
    if (!userAnswer && !currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = userAnswer.trim() === currentQuestion.answer.trim();

    const answer: AssessmentAnswer = {
      questionId: currentQuestion.questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      skipped: false,
    };

    // 显示反馈
    setFeedback({
      status: isCorrect ? '正确' : '错误',
      time: timeSpent,
      speed: getSpeedRating(timeSpent),
      reason: !isCorrect
        ? guessErrorReason(
            currentQuestion.options ? '单项选择题' : '填空题'
          )
        : undefined,
    });

    // 保存答案
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // 1.5秒后自动进入下一题或完成
    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserAnswer('');
        setQuestionStartTime(Date.now());
      } else {
        // 完成测评
        localStorage.setItem('assessment_answers', JSON.stringify(newAnswers));
        router.push('/assessment/report');
      }
    }, 1500);
  };

  const handleSkip = () => {
    const answer: AssessmentAnswer = {
      questionId: currentQuestion.questionId,
      userAnswer: '',
      isCorrect: false,
      timeSpent: 0,
      skipped: true,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setQuestionStartTime(Date.now());
    } else {
      // 完成测评
      localStorage.setItem('assessment_answers', JSON.stringify(newAnswers));
      router.push('/assessment/report');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载测评题目中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 dark:text-gray-400">未找到测评题目</p>
        </div>
      </Layout>
    );
  }

  if (!currentQuestion) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 dark:text-gray-400">题目加载中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
        {/* 顶部信息条 */}
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  测评进度：{currentIndex + 1}/10
                </span>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  剩余约：{formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              💡 不会也没关系，可跳过（不影响路线生成）
            </p>
          </div>
        </div>

        {/* 题目区域 */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-4">
                <span className="text-primary-600 dark:text-primary-400 font-bold">
                  {currentIndex + 1}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-lg text-gray-900 dark:text-white mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                  <MathText content={currentQuestion.question || ''} />
                </div>

                {/* 选项（如果是选择题） */}
                {currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, idx) => {
                      const optionLetter = option.match(/^([A-D])\./)?.[1] || '';
                      return (
                        <button
                          key={idx}
                          onClick={() => setUserAnswer(optionLetter)}
                          disabled={feedback !== null}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            userAnswer === optionLetter
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                          } ${feedback !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <MathText content={option} />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 填空题输入框 */}
                {!currentQuestion.options && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={feedback !== null}
                      placeholder="请输入答案"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 反馈区域 */}
            {feedback && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  feedback.status === '正确'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className={`font-semibold ${
                        feedback.status === '正确'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {feedback.status === '正确' ? '✓ 正确' : '✗ 错误'}
                    </span>
                    <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                      耗时：{feedback.time}s（{feedback.speed}）
                    </span>
                  </div>
                </div>
                {feedback.reason && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {feedback.reason}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          {!feedback && (
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                暂时不会，跳过 →
              </button>
              <button
                onClick={handleSubmit}
                disabled={!userAnswer}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                提交本题
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

