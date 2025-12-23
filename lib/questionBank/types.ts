/**
 * 题目元数据类型定义
 */

import type { ConceptTag } from './conceptTags';

/**
 * 扩展的题目元数据
 */
export interface QuestionMetadata {
  questionId: string; // 规范ID: GD-2024-S1-Q01
  
  // AI标注字段
  conceptTags: ConceptTag[]; // 1-3个核心知识点
  prereqTags: ConceptTag[]; // 0-3个先修知识点
  difficulty: 1 | 2 | 3 | 4 | 5; // 难度等级
  timeEstimateSec: number; // 预估用时(秒)
  skills: string[]; // 能力要求: ['计算', '理解', '应用']
  confidence: number; // 标注置信度 0-1
  needsReview: boolean; // 是否需要人工复审
  
  // 一致性校验
  annotationVersion: number; // 标注版本号
  annotatedAt: number; // 标注时间戳
  consistencyCheck: {
    attempt1: any; // 第一次标注结果
    attempt2: any; // 第二次标注结果
    consistent: boolean; // 是否一致
  };
}

/**
 * 完整的题目数据（原始JSON + 元数据）
 */
export interface EnrichedQuestion {
  // 原始字段
  questionNum: number;
  content: string;
  answer: string;
  images?: Array<{
    alt_text: string;
    url: string;
    position: string;
  }>;
  sectionName: string;
  
  // 扩展元数据
  metadata: QuestionMetadata;
}

/**
 * 题库JSON扩展结构
 */
export interface EnrichedPaperData {
  meta: {
    year: number;
    province: string;
    exam_type: string;
    subject: string;
    total_questions: number;
    annotated_at?: number; // 标注完成时间
    annotation_version?: number;
  };
  
  paper: {
    sections: Array<{
      section_name: string;
      questions: Array<{
        question_num: number;
        content: string;
        answer: string;
        images?: any[];
        
        // 扩展：元数据
        metadata?: QuestionMetadata;
      }>;
    }>;
  };
}

/**
 * 题库查询参数
 */
export interface QuestionQueryParams {
  conceptTags?: ConceptTag[]; // 必须包含的知识点
  difficulty?: [number, number]; // 难度区间 [min, max]
  questionType?: 'choice' | 'fill' | 'solution'; // 题型
  excludeIds?: string[]; // 排除的题目ID
  yearRange?: [number, number]; // 年份范围
  provinces?: string[]; // 省份过滤
  limit?: number; // 返回数量
  orderBy?: 'difficulty' | 'time' | 'random'; // 排序方式
}

/**
 * Day训练抽题参数
 */
export interface DayTrainingQueryParams {
  weaknessConcepts: ConceptTag[]; // 用户薄弱知识点
  targetDifficulty: [number, number]; // 目标难度区间
  questionCount: number; // 需要题目数量
  excludeIds?: string[]; // 排除已做题目
  preferRealExam?: boolean; // 优先真题
}

/**
 * DeepSeek标注请求
 */
export interface AnnotationRequest {
  questionNum: number;
  content: string;
  answer: string;
  sectionName: string;
}

/**
 * DeepSeek标注响应
 */
export interface AnnotationResponse {
  conceptTags: ConceptTag[];
  prereqTags: ConceptTag[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeEstimateSec: number;
  skills: string[];
  confidence: number;
  reasoning?: string; // 标注理由（可选）
}

