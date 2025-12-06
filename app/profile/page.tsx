'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api/client';
import { useAppStore } from '@/lib/store/appStore';
import type { StudentProfile } from '@/types';
import { Loader2, TrendingUp, Target, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { config } = useAppStore();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [config.studentId]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getStudentProfile(config.studentId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            暂无学习数据，请先完成一些题目
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">学习画像</h1>

        {/* 预测分数 */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 rounded-lg shadow-md text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 mb-2">预测考试分数</p>
              <p className="text-4xl font-bold">{profile.predictedScore.toFixed(1)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-primary-200" />
          </div>
        </div>

        {/* 整体统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="总答题数"
            value={profile.totalAnswered}
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            title="正确数"
            value={profile.totalCorrect}
            icon={<Target className="w-5 h-5" />}
          />
          <StatCard
            title="正确率"
            value={`${(profile.overallAccuracy * 100).toFixed(1)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* 难度正确率 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            各难度掌握情况
          </h2>
          <div className="space-y-4">
            {(['L1', 'L2', 'L3'] as const).map((difficulty) => {
              const rate = profile.difficultyAccuracy[difficulty];
              return (
                <div key={difficulty}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{difficulty}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {(rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${rate * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 知识点掌握度 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            知识点掌握度
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(profile.knowledgeMastery).map(([kp, rate]) => (
              <div key={kp} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{kp}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${rate >= 0.75
                          ? 'bg-green-500'
                          : rate >= 0.6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      style={{ width: `${rate * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {(rate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 薄弱知识点 */}
        {profile.weakPoints.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-300">
                薄弱知识点
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.weakPoints.map((kp) => (
                <span
                  key={kp}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded-full text-sm"
                >
                  {kp}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-red-700 dark:text-red-400">
              建议：在「智能推荐」中选择「薄弱知识点」模式进行针对性练习
            </p>
          </div>
        )}

        {/* 题型正确率 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            题型正确率
          </h2>
          <div className="space-y-4">
            {Object.entries(profile.questionTypeAccuracy).map(([type, rate]) => (
              <div key={type}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {type === 'choice' ? '选择题' : type === 'fill' ? '填空题' : '解答题'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {(rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${rate * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="text-primary-600 dark:text-primary-400">{icon}</div>
      </div>
    </div>
  );
}
