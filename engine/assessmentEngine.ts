/**
 * 测评计算引擎
 * 规则判定 + 薄弱点分析（不调用大模型）
 */

import type { AssessmentAnswer } from '@/types';
import { ASSESSMENT_SET_V1, type AssessmentSetMeta } from '@/data/assessmentSets';

export type LevelType = '偏弱' | '一般' | '较好';
export type WeaknessStatus = '易错' | '用时偏长' | '概念不稳';

export interface WeaknessItem {
  knowledge: string;
  frequency: '高频' | '中频';
  status: WeaknessStatus;
  suggestion: string;
  prerequisite?: string;
  wrongCount: number;
  skipCount: number;
  avgTime: number;
  weakScore: number; // 内部评分
}

export interface AssessmentResult {
  accuracy: number; // 正确率
  avgTimeSec: number; // 平均用时
  level: LevelType; // 水平
  weaknessTop3: WeaknessItem[]; // Top3薄弱点
  scoreGap: { min: number; max: number }; // 可提分空间
}

/**
 * 计算测评结果
 */
export function calculateAssessmentResult(
  answers: AssessmentAnswer[]
): AssessmentResult {
  const totalQuestions = answers.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const accuracy = correctCount / totalQuestions;

  // 计算平均用时（排除跳过的题）
  const validTimes = answers.filter((a) => !a.skipped).map((a) => a.timeSpent);
  const avgTimeSec =
    validTimes.length > 0
      ? validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length
      : 0;

  // 判定水平
  const level = determineLevel(accuracy, avgTimeSec);

  // 分析薄弱点
  const weaknessTop3 = analyzeWeakness(answers);

  // 估算提分空间
  const scoreGap = estimateScoreGap(level, weaknessTop3);

  return {
    accuracy,
    avgTimeSec,
    level,
    weaknessTop3,
    scoreGap,
  };
}

/**
 * 判定水平（规则）
 */
function determineLevel(accuracy: number, avgTimeSec: number): LevelType {
  let level: LevelType;

  if (accuracy < 0.5) {
    level = '偏弱';
  } else if (accuracy <= 0.75) {
    level = '一般';
  } else {
    level = '较好';
  }

  // 用时过长降级
  if (avgTimeSec > 75 && level === '较好') {
    level = '一般';
  } else if (avgTimeSec > 75 && level === '一般') {
    level = '偏弱';
  }

  return level;
}

/**
 * 分析薄弱点（按知识点聚合）
 */
function analyzeWeakness(answers: AssessmentAnswer[]): WeaknessItem[] {
  const meta = ASSESSMENT_SET_V1.meta;
  const knowledgeStats = new Map<string, {
    wrongCount: number;
    skipCount: number;
    times: number[];
    difficulties: number[];
  }>();

  // 聚合统计
  for (const answer of answers) {
    const itemMeta = meta[answer.questionId];
    if (!itemMeta) continue;

    const knowledge = itemMeta.knowledge;
    if (!knowledgeStats.has(knowledge)) {
      knowledgeStats.set(knowledge, {
        wrongCount: 0,
        skipCount: 0,
        times: [],
        difficulties: [],
      });
    }

    const stats = knowledgeStats.get(knowledge)!;

    if (answer.skipped) {
      stats.skipCount++;
    } else if (!answer.isCorrect) {
      stats.wrongCount++;
    }

    if (!answer.skipped) {
      stats.times.push(answer.timeSpent);
    }
    stats.difficulties.push(itemMeta.difficulty);
  }

  // 计算薄弱分数
  const weaknessList: WeaknessItem[] = [];

  for (const [knowledge, stats] of knowledgeStats) {
    const avgTime =
      stats.times.length > 0
        ? stats.times.reduce((sum, t) => sum + t, 0) / stats.times.length
        : 0;

    const avgDifficulty =
      stats.difficulties.length > 0
        ? stats.difficulties.reduce((sum, d) => sum + d, 0) /
          stats.difficulties.length
        : 0;

    // 薄弱分数：错误*2 + 跳过*1 + 用时慢(+1) + 难度高(+1)
    const weakScore =
      stats.wrongCount * 2 +
      stats.skipCount * 1 +
      (avgTime > 75 ? 1 : 0) +
      (avgDifficulty >= 2.5 ? 1 : 0);

    if (weakScore > 0) {
      // 判断状态
      const status = determineWeaknessStatus(stats.wrongCount, stats.skipCount, avgTime);

      // 判断频率（简化：所有认为中频）
      const frequency: '高频' | '中频' = avgDifficulty >= 2 ? '高频' : '中频';

      // 生成建议
      const suggestion = generateSuggestion(knowledge, status, frequency);

      weaknessList.push({
        knowledge,
        frequency,
        status,
        suggestion,
        wrongCount: stats.wrongCount,
        skipCount: stats.skipCount,
        avgTime,
        weakScore,
      });
    }
  }

  // 排序取Top3
  weaknessList.sort((a, b) => b.weakScore - a.weakScore);
  return weaknessList.slice(0, 3);
}

/**
 * 判定薄弱状态
 */
function determineWeaknessStatus(
  wrongCount: number,
  skipCount: number,
  avgTime: number
): WeaknessStatus {
  if (wrongCount >= 1) {
    return '易错';
  }
  if (avgTime > 75) {
    return '用时偏长';
  }
  if (skipCount >= 1) {
    return '概念不稳';
  }
  return '易错'; // 默认
}

/**
 * 生成建议
 */
function generateSuggestion(
  knowledge: string,
  status: WeaknessStatus,
  frequency: '高频' | '中频'
): string {
  // 根据知识点查找先修点
  const prereqMap: Record<string, string> = {
    '极限-基本极限': '三角恒等变形',
    '导数-链式法则': '复合函数与代数变形',
    '积分-换元法': '微分形式与代换',
    '微分方程-一阶': '积分与分离变量',
  };

  const prereq = prereqMap[knowledge];

  if (status === '易错') {
    if (prereq) {
      return `建议：先补「${prereq}」`;
    }
    return '建议：做 6 题闭环';
  }

  if (status === '用时偏长') {
    return '建议：做 6 题闭环提速';
  }

  if (status === '概念不稳') {
    return '建议：3 分钟衔接卡 + 8 题训练';
  }

  return '建议：做 6 题闭环';
}

/**
 * 估算提分空间
 */
function estimateScoreGap(
  level: LevelType,
  weaknessTop3: WeaknessItem[]
): { min: number; max: number } {
  // 简化估算：根据水平和薄弱点数量
  if (level === '偏弱') {
    return { min: 15, max: 30 };
  }
  if (level === '一般') {
    return { min: 10, max: 20 };
  }
  // 较好
  return { min: 5, max: 15 };
}

