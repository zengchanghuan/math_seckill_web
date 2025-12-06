// 题目类型
export interface Question {
  questionId: string;
  topic: string;
  difficulty: 'L1' | 'L2' | 'L3';
  type: 'choice' | 'fill' | 'solution';
  question: string;
  options?: string[];
  answer: string;
  solution: string;
  tags?: string[];
  knowledgePoints?: string[];
  abilityTags?: string[];
  templateId?: string;
  source?: 'generated' | 'real_exam' | 'manual';
  isRealExam?: boolean;
  totalAttempts?: number;
  correctRate?: number;
  discriminationIndex?: number;
  avgTimeSeconds?: number;
  reviewStatus?: 'pending' | 'approved' | 'rejected' | 'revision';
  createdAt?: string;
}

// 作答记录
export interface AnswerRecord {
  recordId: string;
  studentId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeSpent: number;
  submittedAt: string;
}

// 提交答案请求
export interface SubmitAnswerRequest {
  studentId: string;
  questionId: string;
  answer: string;
  timeSpent: number;
}

// 提交答案响应
export interface SubmitAnswerResponse {
  success: boolean;
  isCorrect: boolean;
  correctAnswer?: string;
  message?: string;
}

// 学生画像
export interface StudentProfile {
  studentId: string;
  knowledgeMastery: Record<string, number>;
  questionTypeAccuracy: Record<string, number>;
  difficultyAccuracy: {
    L1: number;
    L2: number;
    L3: number;
  };
  weakPoints: string[];
  predictedScore: number;
  totalAnswered: number;
  totalCorrect: number;
  overallAccuracy: number;
}

// 推荐请求
export interface RecommendationRequest {
  studentId: string;
  mode: 'weak_points' | 'comprehensive' | 'exam_prep';
  count?: number;
}

// 推荐响应
export interface RecommendationResponse {
  studentId: string;
  mode: string;
  reason: string;
  questions: Question[];
}

// 题目统计
export interface QuestionStats {
  questionId: string;
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  correctRate: number;
  discriminationIndex: number;
  avgTimeSeconds: number;
  optionDistribution?: Record<string, number>;
}

// 题库统计
export interface QuestionBankStats {
  total: number;
  byDifficulty: {
    L1: number;
    L2: number;
    L3: number;
  };
  byType: {
    choice: number;
    fill: number;
    solution: number;
  };
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
    revision: number;
  };
}

// 应用配置
export interface AppConfig {
  studentId: string;
  serverUrl: string;
  isOfflineMode: boolean;
  theme: 'light' | 'dark';
}
