'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import type { AssessmentConfig } from '@/types';

export default function AssessmentStartPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AssessmentConfig>({
    timeBudget: '30-60天',
    selfEval: undefined,
  });

  const handleStart = () => {
    // 保存配置到 localStorage
    localStorage.setItem('assessment_config', JSON.stringify(config));
    // 跳转到答题页
    router.push('/assessment/run');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              5分钟测评
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              测出薄弱点，并生成最短提分路线（基于历年真题）
            </p>
          </div>

          {/* 你将获得 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              你将获得
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">1</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    薄弱点排名（按最容易提分排序）
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    精准定位你的知识盲区，优先攻克高频易得分点
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">2</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    7 天游标训练路线（每天做什么、做多少、达标线）
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    科学分配训练任务，让你的进步看得见
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">3</span>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    高中衔接缺口（导致你高数掉分的基础点）
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    找到高中知识断层，从根源解决问题
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 设置项 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              测评设置（可选）
            </h2>

            {/* 距离考试 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                距离考试
              </label>
              <div className="space-y-2">
                {['<30天', '30-60天', '60天+'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="timeBudget"
                      value={option}
                      checked={config.timeBudget === option}
                      onChange={(e) =>
                        setConfig({ ...config, timeBudget: e.target.value as AssessmentConfig['timeBudget'] })
                      }
                      className="mr-3 w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 基础自评 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                基础自评（可跳过）
              </label>
              <div className="space-y-2">
                {['偏弱', '一般', '较好'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="selfEval"
                      value={option}
                      checked={config.selfEval === option}
                      onChange={(e) =>
                        setConfig({ ...config, selfEval: e.target.value as AssessmentConfig['selfEval'] })
                      }
                      className="mr-3 w-4 h-4 text-primary-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-lg"
            >
              开始测评（约5分钟）
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
            >
              我想直接刷真题
            </button>
          </div>

          {/* 说明 */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>共10道题，涵盖高数核心知识点</p>
            <p className="mt-1">不会也没关系，可随时跳过</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

