'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import type { AssessmentAnswer } from '@/types';
import { calculateAssessmentResult } from '@/engine/assessmentEngine';
import { generate7DaysPlan } from '@/engine/planTemplates';
import { getDay1Items } from '@/data/assessmentSets';
import { savePlan, getPlan } from '@/storage/planStorage';
import { getProUnlock, unlockPro } from '@/lib/quota/manager';
import { trackEvent } from '@/lib/quota/analytics';
import type { Plan7Days } from '@/engine/planTemplates';
import type { AssessmentResult } from '@/engine/assessmentEngine';

export default function AssessmentReportPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [plan, setPlan] = useState<Plan7Days | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        // 从 localStorage 加载答题记录
        const answersStr = localStorage.getItem('assessment_answers');
        if (!answersStr) {
          router.push('/assessment/start');
          return;
        }

        const answers: AssessmentAnswer[] = JSON.parse(answersStr);

        // 使用新引擎计算结果
        const calculatedResult = calculateAssessmentResult(answers);
        setResult(calculatedResult);

        // 检查是否已有计划
        let existingPlan = getPlan();
        
        if (!existingPlan) {
          // 生成7天计划
          const weakness1 = calculatedResult.weaknessTop3[0];
          const day1ItemIds = weakness1 
            ? getDay1Items(weakness1.knowledge)
            : getDay1Items('default');

          const newPlan = generate7DaysPlan(
            calculatedResult.level,
            calculatedResult.weaknessTop3,
            day1ItemIds
          );

          // 保存计划
          savePlan(newPlan);
          existingPlan = newPlan;
        }

        setPlan(existingPlan);
        setLoading(false);
      } catch (error) {
        console.error('Failed to generate report:', error);
        alert('生成报告失败，请重试');
        router.push('/assessment/start');
      }
    }

    loadReport();
  }, [router]);

  const handleDayClick = (day: number, locked: boolean) => {
    if (!plan) return;

    if (day === 1) {
      // Day1 免费，直接跳转
      router.push(`/practice/plan_day1?mode=plan&day=1&planId=${plan.planId}`);
    } else if (locked) {
      // 检查Pro解锁状态
      const proUnlock = getProUnlock();
      const isPro = proUnlock?.unlocked && proUnlock.expiresAt > Date.now();
      
      if (!isPro) {
        // 显示付费弹窗
        setSelectedDay(day);
        setShowPaymentModal(true);
        trackEvent('paywall_open', { source: 'assessment_report', day });
      } else {
        // 已解锁，跳转到对应训练页
        router.push(`/practice/plan_day${day}?mode=plan&day=${day}&planId=${plan.planId}`);
      }
    } else {
      // 已解锁，跳转
      router.push(`/practice/plan_day${day}?mode=plan&day=${day}&planId=${plan.planId}`);
    }
  };

  const handleUnlock = () => {
    const result = unlockPro('7d');
    
    if (result.success) {
      trackEvent('unlock_success', { plan: '7d', source: 'assessment_report' });
      setShowPaymentModal(false);
      alert('解锁成功！现在可以访问完整的7天训练路线了');
      
      // 重新加载页面以更新状态
      window.location.reload();
    } else {
      alert(result.message);
    }
  };

  if (loading || !result || !plan) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">正在生成报告...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              你的提分路线已生成
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              基于测评表现 + 历年真题高频分布，为你匹配最短路径
            </p>
          </div>

          {/* 卡片1: 当前水平 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              当前水平
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">测评正确率</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {Math.round(result.accuracy * 100)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">平均用时</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {Math.round(result.avgTimeSec)}s
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">当前水平</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {result.level}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">短期可提分</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {result.scoreGap.min}–{result.scoreGap.max}分
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              可提分空间为估算：高频考点占分 × 当前掌握缺口
            </p>
          </div>

          {/* 卡片2: 薄弱点 Top3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              你最该优先补的 3 个点
            </h2>
            <div className="space-y-4">
              {result.weaknessTop3.map((weakness, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ① {weakness.knowledge}
                        </span>
                        <span className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                          {weakness.frequency}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {weakness.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {weakness.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 卡片3: 7天游标路线 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              7 天游标提分路线
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              每天 15–25 分钟 · 完成后将生成"提分报告 + 复测对比"，看得见进步
            </p>

            <div className="space-y-3">
              {plan.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => handleDayClick(day.day, day.locked)}
                  disabled={day.day === 7}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    day.day === 1
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                      : day.locked
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900/50 opacity-60'
                      : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white">
                          Day{day.day}: {day.title}
                        </span>
                        {day.day === 1 && (
                          <span className="px-2 py-0.5 text-xs bg-green-600 text-white rounded">
                            免费
                          </span>
                        )}
                        {day.locked && day.day !== 7 && (
                          <span className="text-xl">🔒</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {day.description}
                      </p>
                      {day.totalQuestions > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {day.totalQuestions}题 · 目标正确率≥{Math.round(day.targetAccuracy * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 解锁模块 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-500 dark:border-purple-400 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              解锁 Pro：让提分"有路径、有纠偏、有证明"
            </h2>
            <ul className="space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>AI 错因诊断：告诉你为什么错，以及下一步怎么补</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>高中衔接补漏：自动定位先修缺口，3 分钟补齐</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                <span>平行复测卷 + 提分报告：每 7 天给一次可对比的进步</span>
              </li>
            </ul>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  7 天游标冲刺卡
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  免输入更快刷题 + 完整提分路线
                </p>
              </div>
              <button
                onClick={handleUnlock}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                ¥19 解锁
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 付费弹窗 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              解锁完整路线
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              你已获得：薄弱点 Top3 + Day1 任务
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              解锁后获得：Day2–Day7 路线 + 衔接卡 + 错因诊断 + 复测卷 + 提分报告
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                先不解锁，继续 Day1
              </button>
              <button
                onClick={handleUnlock}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                ¥19 解锁
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}



