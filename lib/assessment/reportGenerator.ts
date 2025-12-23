/**
 * 测评报告生成器
 */

import type { AssessmentAnswer, AssessmentReport, DayPlan } from '@/types';
import {
  getLevel,
  getScoreGap,
  generateWeaknessTop3,
} from './ruleEngine';
import { loadAssessmentSet, buildKnowledgeQuestionsMap } from './questionLoader';

/**
 * 生成完整的测评报告
 */
export async function generateAssessmentReport(
  answers: AssessmentAnswer[]
): Promise<AssessmentReport> {
  // 加载题集数据（用于知识点映射）
  const assessmentSet = await loadAssessmentSet();
  const knowledgeQuestionsMap = buildKnowledgeQuestionsMap(assessmentSet);

  // 计算基础指标
  const answeredQuestions = answers.filter((a) => !a.skipped);
  const correctCount = answeredQuestions.filter((a) => a.isCorrect).length;
  const totalAnswered = answeredQuestions.length;
  const accuracy = totalAnswered > 0 ? correctCount / totalAnswered : 0;
  const avgTime =
    answeredQuestions.length > 0
      ? answeredQuestions.reduce((sum, a) => sum + a.timeSpent, 0) /
        answeredQuestions.length
      : 0;

  // 判定水平
  const level = getLevel(accuracy);

  // 提分空间
  const [scoreGapMin, scoreGapMax] = getScoreGap(level);

  // 生成薄弱点Top3
  const weaknessTop3 = generateWeaknessTop3(answers, knowledgeQuestionsMap);

  // 生成7天训练路线
  const planDays = generate7DayPlan(weaknessTop3, level);

  // 生成报告ID
  const reportId = `report_${Date.now()}`;

  const report: AssessmentReport = {
    reportId,
    accuracy: Math.round(accuracy * 100) / 100,
    avgTime: Math.round(avgTime),
    level,
    scoreGapMin,
    scoreGapMax,
    weaknessTop3,
    planDays,
    completedAt: new Date().toISOString(),
  };

  return report;
}

/**
 * 生成7天训练路线
 */
function generate7DayPlan(
  weaknessTop3: any[],
  level: '偏弱' | '一般' | '较好'
): DayPlan[] {
  const planDays: DayPlan[] = [];

  // Day1: 针对第一个薄弱点（解锁）
  planDays.push({
    day: 1,
    title: `补齐 ${weaknessTop3[0]?.knowledge || '基本极限'}`,
    topic: weaknessTop3[0]?.knowledge || '基本极限',
    prereq: weaknessTop3[0]?.prereq,
    taskCount: 12,
    targetAccuracy: 0.8,
    targetAvgTime: 60,
    locked: false,
    questionIds: [], // 实际应该从题库筛选
  });

  // Day2: 针对第二个薄弱点（锁定）
  planDays.push({
    day: 2,
    title: `${weaknessTop3[1]?.knowledge || '导数求法'} 专项闭环（含衔接卡 + 错因纠偏）`,
    topic: weaknessTop3[1]?.knowledge || '导数求法',
    prereq: weaknessTop3[1]?.prereq,
    taskCount: 10,
    targetAccuracy: 0.85,
    targetAvgTime: 50,
    locked: true,
  });

  // Day3: 针对第三个薄弱点（锁定）
  planDays.push({
    day: 3,
    title: `${weaknessTop3[2]?.knowledge || '定积分计算'} 提速训练（含错因诊断）`,
    topic: weaknessTop3[2]?.knowledge || '定积分计算',
    prereq: weaknessTop3[2]?.prereq,
    taskCount: 10,
    targetAccuracy: 0.85,
    targetAvgTime: 45,
    locked: true,
  });

  // Day4: 高频综合小测（锁定）
  planDays.push({
    day: 4,
    title: '高频综合小测（平行卷）',
    topic: '综合训练',
    taskCount: 15,
    targetAccuracy: 0.8,
    targetAvgTime: 50,
    locked: true,
  });

  // Day5: 薄弱点二刷（锁定）
  planDays.push({
    day: 5,
    title: '薄弱点二刷（自动挑题）',
    topic: '复习巩固',
    taskCount: 12,
    targetAccuracy: 0.9,
    targetAvgTime: 40,
    locked: true,
  });

  // Day6: 复测卷（锁定）
  planDays.push({
    day: 6,
    title: '7 天游标复测卷（同结构不同题）',
    topic: '复测评估',
    taskCount: 10,
    targetAccuracy: 0.85,
    targetAvgTime: 45,
    locked: true,
  });

  // Day7: 提分报告（锁定）
  planDays.push({
    day: 7,
    title: '提分报告（可下载/可分享）',
    topic: '总结分析',
    taskCount: 0,
    targetAccuracy: 1.0,
    targetAvgTime: 0,
    locked: true,
  });

  return planDays;
}

