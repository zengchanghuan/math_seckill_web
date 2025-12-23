// 图片信息类型
export interface QuestionImage {
  alt_text: string;
  url: string;
  position: string;
  caption?: string;
  question_ref?: number;
}

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
  shortSolution?: string; // 简短解析（免费）
  detailedSolution?: string; // 详细解析（Pro功能）
  tags?: string[];
  knowledgePoints?: string[];
  abilityTags?: string[];
  templateId?: string;
  source?: 'generated' | 'real_exam' | 'manual';
  isRealExam?: boolean;
  paperId?: string; // 关联的试卷ID
  totalAttempts?: number;
  correctRate?: number;
  discriminationIndex?: number;
  avgTimeSeconds?: number;
  reviewStatus?: 'pending' | 'approved' | 'rejected' | 'revision';
  createdAt?: string;
  images?: QuestionImage[]; // 题目中的图片
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

// 真题试卷
export interface ExamPaper {
  paperId: string;
  name: string; // "2023年广东专升本高数真题（第1套）"
  year: number;
  region?: string; // "广东"
  examType?: string; // "专升本"
  subject?: string; // "高数"
  questionIds: string[];
  suggestedTime: number; // 建议用时（分钟）
  description?: string;
  totalQuestions?: number;
  questionTypes?: {
    choice: number;
    fill: number;
    solution: number;
  };
}

// 试卷练习进度
export interface PaperProgress {
  paperId: string;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  accuracy: number;
  answers: Record<string, string>; // questionId -> userAnswer
  isCompleted: boolean;
  mode?: 'objective' | 'solution'; // 当前模式
  lastObjectiveIndex?: number; // 客观题模式最后访问的题号
  lastSolutionIndex?: number; // 解答题模式最后访问的题号
  questionStatus?: Record<string, 'unanswered' | 'answered' | 'wrong'>; // 每道题的状态
}

// 试卷结果
export interface PaperResult {
  paperId: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  accuracy: number;
  questionTypeAccuracy: {
    choice: number;
    fill: number;
    solution: number;
  };
  weakPoints: string[];
  wrongQuestionIds: string[];
}

// ========== 测评系统类型 ==========

// 测评配置
export interface AssessmentConfig {
  timeBudget: '<30天' | '30-60天' | '60天+';
  selfEval?: '偏弱' | '一般' | '较好';
}

// 测评答题记录
export interface AssessmentAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // 秒
  skipped: boolean;
}

// 薄弱点
export interface WeaknessItem {
  knowledge: string; // 知识点名称
  freqTag: '高频' | '中频';
  status: '易错' | '用时偏长' | '概念不稳';
  suggestion: string;
  prereq?: string; // 先修知识点
}

// 训练日计划
export interface DayPlan {
  day: number;
  title: string;
  topic: string;
  prereq?: string;
  taskCount: number;
  targetAccuracy: number; // 0.8 = 80%
  targetAvgTime: number; // 秒
  locked: boolean;
  questionIds?: string[]; // Day1的题目ID列表
}

// 测评报告
export interface AssessmentReport {
  reportId: string;
  accuracy: number;
  avgTime: number;
  level: '偏弱' | '一般' | '较好';
  scoreGapMin: number;
  scoreGapMax: number;
  weaknessTop3: WeaknessItem[];
  planDays: DayPlan[]; // 7天
  completedAt: string;
}

// 解锁状态
export interface UnlockStatus {
  isPro: boolean;
  unlockedAt?: string;
  expiresAt?: string; // Pro到期时间
}

// 测评题目数据（从题集JSON加载）
export interface AssessmentQuestion {
  id: string;
  year: number;
  questionNumber: number;
  sectionName: string;
  knowledge: string[];
}

// ========== 填空题转选择题系统 ==========

// 选项
export interface ChoiceOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  error_type?: string; // 错误类型（仅干扰项有）
}

// 干扰项理由
export interface DistractorRationale {
  key: 'A' | 'B' | 'C' | 'D';
  why_wrong_or_right: string;
}

// 唯一性检查结果
export interface UniquenessCheck {
  strategy: string;
  equivalence_risks: string[];
  passed: boolean;
}

// 转换结果
export interface ConvertToChoiceResult {
  type: 'single_choice';
  stem: string;
  options: ChoiceOption[];
  correct_key: 'A' | 'B' | 'C' | 'D';
  correct_text: string;
  normalize_answer: string;
  distractor_rationales: DistractorRationale[];
  uniqueness_check: UniquenessCheck;
}

// 转换请求
export interface ConvertToChoiceRequest {
  stem: string;
  answer: string;
  solution?: string;
  knowledge?: string[];
}
