'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import type { AssessmentReport, AssessmentAnswer, UnlockStatus } from '@/types';
import { generateAssessmentReport } from '@/lib/assessment/reportGenerator';

export default function AssessmentReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [unlockStatus, setUnlockStatus] = useState<UnlockStatus>({
    isPro: false,
  });

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

        // 生成报告
        const generatedReport = await generateAssessmentReport(answers);
        setReport(generatedReport);

        // 保存报告
        localStorage.setItem(
          'assessment_report',
          JSON.stringify(generatedReport)
        );
        localStorage.setItem('assessment_report_id', generatedReport.reportId);

        // 加载解锁状态
        const unlockStr = localStorage.getItem('unlock_status');
        if (unlockStr) {
          const unlock: UnlockStatus = JSON.parse(unlockStr);
          // 检查是否过期
          if (unlock.expiresAt && new Date(unlock.expiresAt) > new Date()) {
            setUnlockStatus(unlock);
          }
        }

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
    if (day === 1) {
      // Day1 免费，直接跳转
      router.push('/practice/assessment_day1?mode=plan&day=1');
    } else if (locked && !unlockStatus.isPro) {
      // 显示付费弹窗
      setSelectedDay(day);
      setShowPaymentModal(true);
    } else {
      // 已解锁，跳转到对应训练页
      router.push(`/practice/assessment_day${day}?mode=plan&day=${day}`);
    }
  };

  const handleUnlock = () => {
    const unlockStatus: UnlockStatus = {
      isPro: true,
      unlockedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
    };
    localStorage.setItem('unlock_status', JSON.stringify(unlockStatus));
    setUnlockStatus(unlockStatus);
    setShowPaymentModal(false);
    alert('解锁成功！现在可以访问完整的7天训练路线了');
  };

  if (loading) {
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

  if (!report) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600 dark:text-gray-400">报告数据异常</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              你的提分路线已生成
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              基于测评表现 + 历年真题高频分布，为你匹配最短路径
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full">
              <span className="text-sm text-primary-600 dark:text-primary-400">
                完成 10/10 题
              </span>
            </div>
          </div>

          {/* 卡片1：当前水平 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              当前水平
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  测评正确率
                </p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {Math.round(report.accuracy * 100)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  平均用时
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.avgTime}s
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  当前水平
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.level}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  可提分空间
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {report.scoreGapMin}~{report.scoreGapMax}分
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              💡 可提分空间为估算：高频考点占分 × 当前掌握缺口
            </p>
          </div>

          {/* 卡片2：薄弱点Top3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              你最该优先补的 3 个点
            </h2>
            <div className="space-y-4">
              {report.weaknessTop3.map((weakness, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-primary-500 pl-4 py-2"
                >
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white mr-2">
                      ① {weakness.knowledge}
                    </span>
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded">
                      {weakness.freqTag}
                    </span>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      ｜{weakness.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    建议：{weakness.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 卡片3：7天路线 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              7 天游标提分路线
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              完成后将生成"提分报告 + 复测对比"，看得见进步
            </p>

            <div className="space-y-3">
              {report.planDays.map((day) => (
                <div
                  key={day.day}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    day.locked && !unlockStatus.isPro
                      ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Day{day.day}：{day.title}
                        </h3>
                        {day.locked && !unlockStatus.isPro && (
                          <span className="ml-2">🔒</span>
                        )}
                      </div>
                      {day.day === 1 || unlockStatus.isPro ? (
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>任务：{day.taskCount} 题（同类真题）</p>
                          <p>
                            达标线：正确率 ≥ {day.targetAccuracy * 100}% 且
                            平均用时 ≤ {day.targetAvgTime}s
                          </p>
                        </div>
                      ) : null}
                    </div>
                    <button
                      onClick={() => handleDayClick(day.day, day.locked)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        day.day === 1 || unlockStatus.isPro
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {day.day === 1
                        ? '开始训练'
                        : day.locked && !unlockStatus.isPro
                        ? '查看详情'
                        : '开始训练'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 付费模块 */}
          {!unlockStatus.isPro && (
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                解锁 Pro：让提分&ldquo;有路径、有纠偏、有证明&rdquo;
              </h2>
              <ul className="space-y-2 mb-6 text-gray-700 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="mr-2">✅</span>
                  AI 错因诊断：告诉你为什么错，以及下一步怎么补
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>
                  高中衔接补漏：自动定位先修缺口，3 分钟补齐
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✅</span>
                  平行复测卷 + 提分报告：每 7 天给一次可对比的进步
                </li>
              </ul>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-lg"
              >
                ¥19 解锁 7 天游标冲刺卡
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 付费弹窗 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              解锁完整路线
            </h3>
            <div className="space-y-3 mb-6 text-gray-700 dark:text-gray-300">
              <p>
                <strong>你已获得：</strong>薄弱点 Top3 + Day1 任务
              </p>
              <p>
                <strong>解锁后获得：</strong>Day2–Day7 路线 + 衔接卡 + 错因诊断
                + 复测卷 + 提分报告
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleUnlock}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                ¥19 解锁 7 天游标冲刺卡
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                先不解锁，继续 Day1
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

