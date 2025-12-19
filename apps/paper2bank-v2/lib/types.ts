export type QuestionType = string;

export type Question = {
  id: string;
  type?: QuestionType;
  stem: string;
  options?: string[];
  answer?: string;
  analysis?: string;
  /**
   * 可选：用于 EvidencePanel
   */
  ocrText?: string;
  imageUrl?: string;
};

export type SolveSide = {
  answer?: string;
  analysis?: string;
  raw?: unknown;
  error?: string;
};

export type SolveResult = {
  deepseek?: SolveSide;
  qwen?: SolveSide;
  final?: SolveSide & { source?: 'qwen' | 'deepseek' };
  /**
   * deepseek 与 qwen 的答案（规范化后）是否一致
   */
  consistent?: boolean;
  /**
   * 若后端做了等价性判断，可以放这里；本版以 boolean 为主
   */
  equiv?: boolean | 'unknown';
  /**
   * 后端内部决策/失败原因（前端可选展示）
   */
  debug?: Record<string, unknown>;
};

export type ParseResult = {
  meta?: {
    importId?: string;
    status?: string;
    updatedAt?: string;
  };
  questions: Question[];
};

export type DeepseekTaskPlan = {
  task_type:
    | 'domain'
    | 'limit'
    | 'derivative'
    | 'integral_definite'
    | 'integral_indefinite'
    | 'ode'
    | 'series_radius'
    | 'implicit_diff'
    | 'partial'
    | 'solve_equation'
    | 'simplify'
    | 'unknown';
  expr_latex?: string;
  expr_sympy?: string;
  notes?: string;
  candidate_answer?: string;
  candidate_analysis?: string;
};
