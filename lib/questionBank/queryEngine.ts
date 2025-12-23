/**
 * 题库查询引擎
 * 支持按知识点、难度、题型等多维度过滤和抽题
 */

import type {
  EnrichedPaperData,
  EnrichedQuestion,
  QuestionQueryParams,
  DayTrainingQueryParams,
  QuestionMetadata,
} from './types';
import type { ConceptTag } from './conceptTags';
import { SECTION_TYPE_MAP } from './conceptTags';

/**
 * 题库索引（内存缓存）
 */
class QuestionBankIndex {
  private questions: EnrichedQuestion[] = [];
  private byConceptTag: Map<ConceptTag, string[]> = new Map();
  private byDifficulty: Map<number, string[]> = new Map();
  private byType: Map<string, string[]> = new Map();

  /**
   * 加载题库数据并建立索引
   */
  async loadFromJSON(jsonPath: string): Promise<void> {
    const response = await fetch(jsonPath);
    const data: EnrichedPaperData = await response.json();

    // 清空现有索引
    this.questions = [];
    this.byConceptTag.clear();
    this.byDifficulty.clear();
    this.byType.clear();

    // 遍历所有题目
    for (const section of data.paper.sections) {
      const questionType = SECTION_TYPE_MAP[section.section_name] || 'solution';

      for (const q of section.questions) {
        if (!q.metadata) continue; // 跳过未标注的题目

        const enrichedQ: EnrichedQuestion = {
          questionNum: q.question_num,
          content: q.content,
          answer: q.answer,
          images: q.images,
          sectionName: section.section_name,
          metadata: q.metadata,
        };

        this.questions.push(enrichedQ);

        // 建立索引
        const qid = q.metadata.questionId;

        // 按知识点索引
        for (const tag of q.metadata.conceptTags) {
          if (!this.byConceptTag.has(tag)) {
            this.byConceptTag.set(tag, []);
          }
          this.byConceptTag.get(tag)!.push(qid);
        }

        // 按难度索引
        if (!this.byDifficulty.has(q.metadata.difficulty)) {
          this.byDifficulty.set(q.metadata.difficulty, []);
        }
        this.byDifficulty.get(q.metadata.difficulty)!.push(qid);

        // 按题型索引
        if (!this.byType.has(questionType)) {
          this.byType.set(questionType, []);
        }
        this.byType.get(questionType)!.push(qid);
      }
    }

    console.log(`[QuestionBank] 加载完成，共 ${this.questions.length} 道题`);
  }

  /**
   * 通用查询
   */
  query(params: QuestionQueryParams): EnrichedQuestion[] {
    let candidates = [...this.questions];

    // 按知识点过滤
    if (params.conceptTags && params.conceptTags.length > 0) {
      candidates = candidates.filter((q) =>
        params.conceptTags!.some((tag) =>
          q.metadata.conceptTags.includes(tag)
        )
      );
    }

    // 按难度区间过滤
    if (params.difficulty) {
      const [min, max] = params.difficulty;
      candidates = candidates.filter(
        (q) => q.metadata.difficulty >= min && q.metadata.difficulty <= max
      );
    }

    // 按题型过滤
    if (params.questionType) {
      candidates = candidates.filter((q) => {
        const qType = SECTION_TYPE_MAP[q.sectionName];
        return qType === params.questionType;
      });
    }

    // 排除指定题目
    if (params.excludeIds && params.excludeIds.length > 0) {
      const excludeSet = new Set(params.excludeIds);
      candidates = candidates.filter((q) => !excludeSet.has(q.metadata.questionId));
    }

    // 排序
    if (params.orderBy === 'difficulty') {
      candidates.sort((a, b) => a.metadata.difficulty - b.metadata.difficulty);
    } else if (params.orderBy === 'time') {
      candidates.sort(
        (a, b) => a.metadata.timeEstimateSec - b.metadata.timeEstimateSec
      );
    } else if (params.orderBy === 'random') {
      candidates = this.shuffleArray(candidates);
    }

    // 限制数量
    if (params.limit) {
      candidates = candidates.slice(0, params.limit);
    }

    return candidates;
  }

  /**
   * Day训练专用抽题
   */
  queryForDayTraining(params: DayTrainingQueryParams): EnrichedQuestion[] {
    const { weaknessConcepts, targetDifficulty, questionCount, excludeIds } = params;

    // 优先从薄弱知识点中抽题
    let selected: EnrichedQuestion[] = [];

    for (const concept of weaknessConcepts) {
      const conceptQuestions = this.query({
        conceptTags: [concept],
        difficulty: targetDifficulty,
        excludeIds: [...(excludeIds || []), ...selected.map((q) => q.metadata.questionId)],
        limit: Math.ceil(questionCount / weaknessConcepts.length),
        orderBy: 'random',
      });

      selected.push(...conceptQuestions);
    }

    // 如果不够，从难度区间内随机补充
    if (selected.length < questionCount) {
      const additional = this.query({
        difficulty: targetDifficulty,
        excludeIds: [...(excludeIds || []), ...selected.map((q) => q.metadata.questionId)],
        limit: questionCount - selected.length,
        orderBy: 'random',
      });
      selected.push(...additional);
    }

    // 打乱顺序
    return this.shuffleArray(selected).slice(0, questionCount);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const conceptStats = new Map<ConceptTag, number>();
    const difficultyStats = new Map<number, number>();
    const typeStats = new Map<string, number>();

    for (const q of this.questions) {
      // 知识点统计
      for (const tag of q.metadata.conceptTags) {
        conceptStats.set(tag, (conceptStats.get(tag) || 0) + 1);
      }

      // 难度统计
      difficultyStats.set(
        q.metadata.difficulty,
        (difficultyStats.get(q.metadata.difficulty) || 0) + 1
      );

      // 题型统计
      const qType = SECTION_TYPE_MAP[q.sectionName];
      typeStats.set(qType, (typeStats.get(qType) || 0) + 1);
    }

    return {
      totalQuestions: this.questions.length,
      conceptStats: Object.fromEntries(conceptStats),
      difficultyStats: Object.fromEntries(difficultyStats),
      typeStats: Object.fromEntries(typeStats),
    };
  }

  /**
   * Fisher-Yates洗牌算法
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// 单例
export const questionBank = new QuestionBankIndex();

/**
 * 初始化题库（从所有年份JSON加载）
 */
export async function initializeQuestionBank(years: number[]): Promise<void> {
  for (const year of years) {
    try {
      await questionBank.loadFromJSON(`/papers/广东_高数_${year}.json`);
      console.log(`[QuestionBank] 已加载 ${year} 年题库`);
    } catch (error) {
      console.error(`[QuestionBank] 加载 ${year} 年题库失败:`, error);
    }
  }

  const stats = questionBank.getStats();
  console.log('[QuestionBank] 题库统计:', stats);
}

