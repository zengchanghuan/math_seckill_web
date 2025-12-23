/**
 * 7天游标路线模板
 * 根据水平 + 薄弱点填槽生成
 */

import type { LevelType, WeaknessItem } from './assessmentEngine';

export interface DayPlanTask {
  day: number;
  title: string;
  description: string;
  knowledge: string; // 关联的知识点
  prerequisite?: string; // 先修知识点
  targetAccuracy: number; // 目标正确率
  targetAvgTime: number; // 目标平均用时(秒)
  totalQuestions: number; // 题目数量
  locked: boolean; // 是否锁定
  itemIds?: string[]; // 题目ID列表（Day1需要）
}

export interface Plan7Days {
  planId: string;
  level: LevelType;
  days: DayPlanTask[];
}

/**
 * 生成7天路线
 */
export function generate7DaysPlan(
  level: LevelType,
  weaknessTop3: WeaknessItem[],
  day1ItemIds: string[]
): Plan7Days {
  const planId = `plan_${Date.now()}`;

  let days: DayPlanTask[];

  if (level === '偏弱') {
    days = generateWeakPlan(weaknessTop3, day1ItemIds);
  } else if (level === '一般') {
    days = generateNormalPlan(weaknessTop3, day1ItemIds);
  } else {
    days = generateGoodPlan(weaknessTop3, day1ItemIds);
  }

  return {
    planId,
    level,
    days,
  };
}

/**
 * 偏弱版路线
 */
function generateWeakPlan(
  weaknessTop3: WeaknessItem[],
  day1ItemIds: string[]
): DayPlanTask[] {
  const w1 = weaknessTop3[0]?.knowledge || '基础知识';
  const w2 = weaknessTop3[1]?.knowledge || '基础知识';
  const w3 = weaknessTop3[2]?.knowledge || '基础知识';

  const p1 = weaknessTop3[0]?.prerequisite;
  const p2 = weaknessTop3[1]?.prerequisite;
  const p3 = weaknessTop3[2]?.prerequisite;

  return [
    {
      day: 1,
      title: `${w1} 基础巩固`,
      description: `补齐基础 + ${p1 ? `先修「${p1}」` : '概念梳理'}`,
      knowledge: w1,
      prerequisite: p1,
      targetAccuracy: 0.8,
      targetAvgTime: 60,
      totalQuestions: 12,
      locked: false,
      itemIds: day1ItemIds,
    },
    {
      day: 2,
      title: `${w1} 6题闭环纠偏`,
      description: '深度理解 + 错因诊断',
      knowledge: w1,
      targetAccuracy: 0.85,
      targetAvgTime: 55,
      totalQuestions: 6,
      locked: true,
    },
    {
      day: 3,
      title: `${w2} 基础巩固`,
      description: `补齐基础 + ${p2 ? `先修「${p2}」` : '概念梳理'}`,
      knowledge: w2,
      prerequisite: p2,
      targetAccuracy: 0.8,
      targetAvgTime: 60,
      totalQuestions: 12,
      locked: true,
    },
    {
      day: 4,
      title: `${w2} 6题闭环纠偏`,
      description: '深度理解 + 错因诊断',
      knowledge: w2,
      targetAccuracy: 0.85,
      targetAvgTime: 55,
      totalQuestions: 6,
      locked: true,
    },
    {
      day: 5,
      title: `${w3} 基础巩固`,
      description: `补齐基础 + ${p3 ? `先修「${p3}」` : '概念梳理'}`,
      knowledge: w3,
      prerequisite: p3,
      targetAccuracy: 0.8,
      targetAvgTime: 60,
      totalQuestions: 12,
      locked: true,
    },
    {
      day: 6,
      title: '平行复测卷',
      description: '同结构不同题 + 能力对比',
      knowledge: '综合',
      targetAccuracy: 0.7,
      targetAvgTime: 60,
      totalQuestions: 10,
      locked: true,
    },
    {
      day: 7,
      title: '提分报告',
      description: '可下载/可分享 + 进步可视化',
      knowledge: '综合',
      targetAccuracy: 0,
      targetAvgTime: 0,
      totalQuestions: 0,
      locked: true,
    },
  ];
}

/**
 * 一般版路线
 */
function generateNormalPlan(
  weaknessTop3: WeaknessItem[],
  day1ItemIds: string[]
): DayPlanTask[] {
  const w1 = weaknessTop3[0]?.knowledge || '核心知识';
  const w2 = weaknessTop3[1]?.knowledge || '核心知识';
  const w3 = weaknessTop3[2]?.knowledge || '核心知识';

  return [
    {
      day: 1,
      title: `${w1} 专项闭环`,
      description: '深度训练 + 易错点纠偏',
      knowledge: w1,
      targetAccuracy: 0.85,
      targetAvgTime: 55,
      totalQuestions: 12,
      locked: false,
      itemIds: day1ItemIds,
    },
    {
      day: 2,
      title: `${w2} 专项闭环`,
      description: '深度训练 + 易错点纠偏',
      knowledge: w2,
      targetAccuracy: 0.85,
      targetAvgTime: 55,
      totalQuestions: 12,
      locked: true,
    },
    {
      day: 3,
      title: `${w1} 提速训练`,
      description: '限时练习 + 速度提升',
      knowledge: w1,
      targetAccuracy: 0.9,
      targetAvgTime: 45,
      totalQuestions: 8,
      locked: true,
    },
    {
      day: 4,
      title: '高频综合小测',
      description: '高频考点混合 + 应试模拟',
      knowledge: '综合',
      targetAccuracy: 0.8,
      targetAvgTime: 50,
      totalQuestions: 10,
      locked: true,
    },
    {
      day: 5,
      title: `${w3} 专项闭环`,
      description: '深度训练 + 易错点纠偏',
      knowledge: w3,
      targetAccuracy: 0.85,
      targetAvgTime: 55,
      totalQuestions: 12,
      locked: true,
    },
    {
      day: 6,
      title: '平行复测卷',
      description: '同结构不同题 + 能力对比',
      knowledge: '综合',
      targetAccuracy: 0.8,
      targetAvgTime: 55,
      totalQuestions: 10,
      locked: true,
    },
    {
      day: 7,
      title: '提分报告',
      description: '可下载/可分享 + 进步可视化',
      knowledge: '综合',
      targetAccuracy: 0,
      targetAvgTime: 0,
      totalQuestions: 0,
      locked: true,
    },
  ];
}

/**
 * 较好版路线
 */
function generateGoodPlan(
  weaknessTop3: WeaknessItem[],
  day1ItemIds: string[]
): DayPlanTask[] {
  const w1 = weaknessTop3[0]?.knowledge || '提升点';
  const w2 = weaknessTop3[1]?.knowledge || '提升点';

  return [
    {
      day: 1,
      title: `${w1} 提速+细节纠错`,
      description: '速度优化 + 细节陷阱识别',
      knowledge: w1,
      targetAccuracy: 0.9,
      targetAvgTime: 45,
      totalQuestions: 12,
      locked: false,
      itemIds: day1ItemIds,
    },
    {
      day: 2,
      title: `${w2} 提速+细节纠错`,
      description: '速度优化 + 细节陷阱识别',
      knowledge: w2,
      targetAccuracy: 0.9,
      targetAvgTime: 45,
      totalQuestions: 12,
      locked: true,
    },
    {
      day: 3,
      title: '高频综合强化',
      description: '高频难题 + 综合应用',
      knowledge: '综合',
      targetAccuracy: 0.85,
      targetAvgTime: 50,
      totalQuestions: 10,
      locked: true,
    },
    {
      day: 4,
      title: '平行小测',
      description: '限时模拟 + 状态调整',
      knowledge: '综合',
      targetAccuracy: 0.9,
      targetAvgTime: 50,
      totalQuestions: 10,
      locked: true,
    },
    {
      day: 5,
      title: '易错点清单+二刷',
      description: '历史易错题 + 巩固提高',
      knowledge: '综合',
      targetAccuracy: 0.95,
      targetAvgTime: 40,
      totalQuestions: 12,
      locked: true,
    },
    {
      day: 6,
      title: '复测卷',
      description: '全真模拟 + 能力验证',
      knowledge: '综合',
      targetAccuracy: 0.9,
      targetAvgTime: 50,
      totalQuestions: 10,
      locked: true,
    },
    {
      day: 7,
      title: '提分报告',
      description: '可下载/可分享 + 进步可视化',
      knowledge: '综合',
      targetAccuracy: 0,
      targetAvgTime: 0,
      totalQuestions: 0,
      locked: true,
    },
  ];
}

