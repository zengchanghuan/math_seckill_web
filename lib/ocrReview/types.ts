export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'fill_blank'
  | 'short_answer'
  | 'true_false'
  | 'unknown';

export type OcrQuestion = {
  id: string;
  type: QuestionType | string;
  stem: string;
  options?: string[];
  answer?: string;
  analysis?: string;
};

export type SolutionEntry = {
  deepseek?: {
    answer?: string;
    analysis?: string;
    raw?: unknown;
  };
  qwen?: {
    answer?: string;
    analysis?: string;
    raw?: unknown;
  };
  final?: {
    answer?: string;
    analysis?: string;
    raw?: unknown;
  };
  consistent?: boolean;
  equiv?: boolean | 'unknown';
};

export type SolutionsMap = Record<string, SolutionEntry | undefined>;

export type OcrTaskMeta = {
  projectId?: string;
  importId: string;
  status?: 'pending' | 'running' | 'done' | 'failed' | string;
  updatedAt?: string;
};

export type ParseResult = {
  meta: OcrTaskMeta;
  questions: OcrQuestion[];
  solutions: SolutionsMap;
  /**
   * 证据区：每题 OCR 原文（纯文本）
   */
  ocrTextById?: Record<string, string | undefined>;
  /**
   * 证据区：每题对应图片 URL（可选）
   */
  imageUrlById?: Record<string, string | undefined>;
};

export type QuestionVM = {
  id: string;
  no: number;
  type: string;
  stem: string;
  options: string[];
  answer: string;
  analysis: string;
  solution: SolutionEntry;
  /**
   * 与 final 不一致时用于列表醒目标识
   */
  hasDiffWithFinal: boolean;
};

export type OcrReviewState = {
  meta: OcrTaskMeta;
  questions: QuestionVM[];
  ocrTextById: Record<string, string | undefined>;
  imageUrlById: Record<string, string | undefined>;
};

export type SavePatch = {
  id: string;
  answer?: string;
  analysis?: string;
  needsReview?: boolean;
};

export type SaveCorrectionsInput = {
  importId: string;
  patches: SavePatch[];
};

export type SaveCorrectionsResult = {
  ok: boolean;
  savedIds: string[];
};


