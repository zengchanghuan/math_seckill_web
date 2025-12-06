'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import MathText from '@/components/MathText';
import { apiClient } from '@/lib/api/client';
import { useAppStore } from '@/lib/store/appStore';
import type { RecommendationResponse, Question } from '@/types';
import { Loader2, Target, BookOpen, Zap } from 'lucide-react';
import Link from 'next/link';

export default function RecommendationPage() {
  const { config } = useAppStore();
  const [mode, setMode] = useState<'weak_points' | 'comprehensive' | 'exam_prep'>('weak_points');
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const modes = [
    { value: 'weak_points' as const, label: '薄弱知识点', icon: Target, desc: '针对性突破薄弱环节' },
    { value: 'comprehensive' as const, label: '综合训练', icon: BookOpen, desc: '全面训练，适应考试节奏' },
    { value: 'exam_prep' as const, label: '考前冲刺', icon: Zap, desc: '查漏补缺，考前强化' },
  ];

  useEffect(() => {
    loadRecommendations();
  }, [mode, config.studentId]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getRecommendations({
        studentId: config.studentId,
        mode,
        count: 20,
      });
      setRecommendation(response);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">智能推荐</h1>

        {/* 推荐模式选择 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.value;
            return (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`p-4 rounded-lg border-2 transition-all ${isActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`} />
                  <h3 className={`font-semibold ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {m.label}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-left">{m.desc}</p>
              </button>
            );
          })}
        </div>

        {/* 推荐结果 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : recommendation ? (
          <div className="space-y-6">
            {/* 推荐理由 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-300">
                <strong>推荐理由：</strong>
                {recommendation.reason}
              </p>
            </div>

            {/* 题目列表 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                推荐题目 ({recommendation.questions.length} 道)
              </h2>
              {recommendation.questions.map((question, index) => (
                <QuestionCard key={question.questionId} question={question} index={index} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              暂无推荐题目，请先完成一些题目以生成学习画像
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

function QuestionCard({ question, index }: { question: Question; index: number }) {
  return (
    <Link
      href={`/drill?questionId=${question.questionId}`}
      className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-sm">
            {question.difficulty}
          </span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
            {question.topic}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">#{index + 1}</span>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <MathText content={question.question} />
      </div>
    </Link>
  );
}
