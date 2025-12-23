/**
 * 测评规则引擎
 */

import type { AssessmentAnswer, WeaknessItem } from '@/types';
import { getFreqTag, getPrereq, getSuggestion } from './knowledgeMap';

/**
 * 判定用户水平
 */
export function getLevel(accuracy: number): '偏弱' | '一般' | '较好' {
  if (accuracy >= 0.8) return '较好';
  if (accuracy >= 0.6) return '一般';
  return '偏弱';
}

/**
 * 估算提分空间
 */
export function getScoreGap(level: '偏弱' | '一般' | '较好'): [number, number] {
  const scoreGapMap = {
    '偏弱': [15, 25] as [number, number],
    '一般': [10, 18] as [number, number],
    '较好': [5, 12] as [number, number],
  };
  return scoreGapMap[level];
}

/**
 * 推断薄弱点状态
 */
export function inferWeaknessStatus(
  answers: AssessmentAnswer[],
  knowledge: string,
  knowledgeQuestionsMap: Record<string, string[]>
): '易错' | '用时偏长' | '概念不稳' {
  const relatedQuestionIds = knowledgeQuestionsMap[knowledge] || [];
  const relatedAnswers = answers.filter((a) =>
    relatedQuestionIds.includes(a.questionId)
  );

  if (relatedAnswers.length === 0) return '概念不稳';

  const correctCount = relatedAnswers.filter((a) => a.isCorrect).length;
  const accuracy = correctCount / relatedAnswers.length;
  const avgTime =
    relatedAnswers.reduce((sum, a) => sum + a.timeSpent, 0) /
    relatedAnswers.length;

  if (accuracy < 0.5) return '易错';
  if (avgTime > 90) return '用时偏长';
  return '概念不稳';
}

/**
 * 生成薄弱点 Top3
 */
export function generateWeaknessTop3(
  answers: AssessmentAnswer[],
  knowledgeQuestionsMap: Record<string, string[]>
): WeaknessItem[] {
  // 从错题中统计知识点频次
  const wrongQuestions = answers.filter((a) => !a.isCorrect && !a.skipped);
  const knowledgeCount: Record<string, number> = {};

  wrongQuestions.forEach((answer) => {
    // 找到该题目对应的所有知识点
    Object.entries(knowledgeQuestionsMap).forEach(([knowledge, questionIds]) => {
      if (questionIds.includes(answer.questionId)) {
        knowledgeCount[knowledge] = (knowledgeCount[knowledge] || 0) + 1;
      }
    });
  });

  // 如果没有错题，从所有题目中找用时最长的知识点
  if (Object.keys(knowledgeCount).length === 0) {
    const timeMap: Record<string, number[]> = {};
    answers.forEach((answer) => {
      Object.entries(knowledgeQuestionsMap).forEach(([knowledge, questionIds]) => {
        if (questionIds.includes(answer.questionId)) {
          if (!timeMap[knowledge]) timeMap[knowledge] = [];
          timeMap[knowledge].push(answer.timeSpent);
        }
      });
    });

    // 计算平均用时并排序
    Object.entries(timeMap).forEach(([knowledge, times]) => {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      if (avgTime > 60) {
        // 超过60秒的认为是薄弱点
        knowledgeCount[knowledge] = 1;
      }
    });
  }

  // 排序后取Top3
  const top3 = Object.entries(knowledgeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([kp]) => ({
      knowledge: kp,
      freqTag: getFreqTag(kp),
      status: inferWeaknessStatus(answers, kp, knowledgeQuestionsMap),
      suggestion: getSuggestion(kp),
      prereq: getPrereq(kp),
    }));

  // 如果薄弱点不足3个，用默认知识点补充
  const defaultKnowledge = ['基本极限', '导数求法', '定积分计算'];
  while (top3.length < 3) {
    const fallback = defaultKnowledge[top3.length];
    if (!top3.find((w) => w.knowledge === fallback)) {
      top3.push({
        knowledge: fallback,
        freqTag: getFreqTag(fallback),
        status: '概念不稳',
        suggestion: getSuggestion(fallback),
        prereq: getPrereq(fallback),
      });
    }
  }

  return top3;
}

/**
 * 猜测错误原因（用于即时反馈）
 */
export function guessErrorReason(questionType: string): string {
  if (questionType === '单项选择题') {
    return '可能原因：基本公式不熟';
  }
  return '可能原因：变形不到位';
}

/**
 * 计算答题速度评级
 */
export function getSpeedRating(timeSpent: number): '快' | '正常' | '慢' {
  if (timeSpent < 30) return '快';
  if (timeSpent < 60) return '正常';
  return '慢';
}

