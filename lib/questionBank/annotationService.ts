/**
 * DeepSeek API 题目元数据标注服务
 * 支持双温度一致性校验
 */

import 'server-only';

import type {
  AnnotationRequest,
  AnnotationResponse,
  QuestionMetadata,
} from './types';
import type { ConceptTag } from './conceptTags';
import { CONCEPT_TAGS } from './conceptTags';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

function getDeepSeekApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    // 不要提供默认值，避免泄漏与误用
    throw new Error(
      'Missing DEEPSEEK_API_KEY. Please set it in server env (.env.local).'
    );
  }
  return key;
}

// 标注版本（修改prompt时递增）
export const ANNOTATION_VERSION = 1;

/**
 * 生成标注prompt
 */
function generateAnnotationPrompt(request: AnnotationRequest): string {
  const conceptList = Object.entries(CONCEPT_TAGS)
    .map(([key, label]) => `${key}: ${label}`)
    .join('\n');

  return `你是专升本高数题库标注专家。请为以下题目生成精准的元数据标注。

【题目信息】
题型：${request.sectionName}
题干：${request.content}
答案：${request.answer}

【标注要求】
1. concept_tags：从以下枚举表中选择1-3个最核心的知识点
${conceptList}

2. prereq_tags：从上述枚举表中选择0-3个先修知识点（做此题需要先掌握的前置知识）

3. difficulty：难度等级1-5
   - 1: 基础概念/直接套用公式
   - 2: 简单计算/单一知识点应用
   - 3: 中等难度/需要2步变形
   - 4: 综合应用/多知识点结合
   - 5: 高难度/需要创新思维

4. time_estimate_sec：预估学生完成时间（秒），考虑题型和难度

5. skills：能力要求，从中选择1-3个
   - "记忆": 背诵公式定理
   - "理解": 概念理解
   - "计算": 数值计算
   - "推理": 逻辑推导
   - "应用": 实际问题建模
   - "综合": 多知识点整合

6. confidence：你对此标注的置信度（0-1）

【输出格式】
严格输出JSON，不要任何其他文本：
{
  "concept_tags": ["limit-basic", "deriv-chain"],
  "prereq_tags": ["func-basic"],
  "difficulty": 3,
  "time_estimate_sec": 120,
  "skills": ["计算", "推理"],
  "confidence": 0.95,
  "reasoning": "简短说明标注理由"
}`;
}

/**
 * 调用DeepSeek API进行标注
 */
async function callDeepSeekAnnotation(
  request: AnnotationRequest,
  temperature: number = 0.1
): Promise<AnnotationResponse> {
  const prompt = generateAnnotationPrompt(request);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getDeepSeekApiKey()}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            '你是专业的题目标注专家。必须输出严格的JSON格式，不要任何额外文本。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from DeepSeek');
  }

  const result = JSON.parse(content);

  // 验证必需字段
  if (!result.concept_tags || !Array.isArray(result.concept_tags)) {
    throw new Error('Invalid concept_tags in response');
  }

  return {
    conceptTags: result.concept_tags,
    prereqTags: result.prereq_tags || [],
    difficulty: result.difficulty,
    timeEstimateSec: result.time_estimate_sec,
    skills: result.skills || [],
    confidence: result.confidence || 0.8,
    reasoning: result.reasoning,
  };
}

/**
 * 计算两次标注的一致性
 */
function checkConsistency(
  attempt1: AnnotationResponse,
  attempt2: AnnotationResponse
): boolean {
  // 核心知识点一致性（至少50%重合）
  const tags1 = new Set(attempt1.conceptTags);
  const tags2 = new Set(attempt2.conceptTags);
  const intersection = [...tags1].filter((t) => tags2.has(t));
  const conceptMatch =
    intersection.length >= Math.min(tags1.size, tags2.size) * 0.5;

  // 难度一致性（相差不超过1）
  const difficultyMatch =
    Math.abs(attempt1.difficulty - attempt2.difficulty) <= 1;

  // 用时一致性（相差不超过30%）
  const timeRatio = Math.max(
    attempt1.timeEstimateSec / attempt2.timeEstimateSec,
    attempt2.timeEstimateSec / attempt1.timeEstimateSec
  );
  const timeMatch = timeRatio <= 1.3;

  // 综合判断：必须conceptMatch；difficultyMatch与timeMatch至少满足一个
  return conceptMatch && (difficultyMatch || timeMatch);
}

/**
 * 合并两次标注结果（取置信度高的）
 */
function mergeAnnotations(
  attempt1: AnnotationResponse,
  attempt2: AnnotationResponse
): AnnotationResponse {
  if (attempt1.confidence >= attempt2.confidence) {
    return attempt1;
  }
  return attempt2;
}

/**
 * 完整标注流程：双温度+一致性校验
 */
export async function annotateQuestion(
  request: AnnotationRequest
): Promise<QuestionMetadata> {
  console.log(`[Annotation] 开始标注题目: ${request.questionNum}`);

  // 第一次标注（温度0.05，偏确定）
  const attempt1 = await callDeepSeekAnnotation(request, 0.05);
  console.log('[Annotation] 第一次标注完成');

  // 延迟1秒避免API限流
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 第二次标注（温度0.45，制造合理扰动）
  const attempt2 = await callDeepSeekAnnotation(request, 0.45);
  console.log('[Annotation] 第二次标注完成');

  // 一致性检查
  const consistent = checkConsistency(attempt1, attempt2);
  console.log(`[Annotation] 一致性检查: ${consistent ? '一致' : '不一致'}`);

  // 合并结果
  const finalResult = consistent
    ? mergeAnnotations(attempt1, attempt2)
    : attempt1;

  // 生成元数据
  const metadata: QuestionMetadata = {
    questionId: '', // 由调用方设置
    conceptTags: finalResult.conceptTags as ConceptTag[],
    prereqTags: finalResult.prereqTags as ConceptTag[],
    difficulty: finalResult.difficulty,
    timeEstimateSec: finalResult.timeEstimateSec,
    skills: finalResult.skills,
    confidence: finalResult.confidence,
    needsReview: !consistent, // 不一致则需要人工复审
    annotationVersion: ANNOTATION_VERSION,
    annotatedAt: Date.now(),
    consistencyCheck: {
      attempt1,
      attempt2,
      consistent,
    },
  };

  return metadata;
}

/**
 * 批量标注题目
 */
export async function batchAnnotateQuestions(
  requests: AnnotationRequest[],
  onProgress?: (current: number, total: number) => void
): Promise<QuestionMetadata[]> {
  const results: QuestionMetadata[] = [];

  for (let i = 0; i < requests.length; i++) {
    try {
      const metadata = await annotateQuestion(requests[i]);
      results.push(metadata);

      if (onProgress) {
        onProgress(i + 1, requests.length);
      }

      // 标注间隔2秒，避免限流
      if (i < requests.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`[Annotation] 标注失败: ${requests[i].questionNum}`, error);

      // 失败时创建需要复审的元数据
      results.push({
        questionId: '',
        conceptTags: [],
        prereqTags: [],
        difficulty: 3,
        timeEstimateSec: 120,
        skills: [],
        confidence: 0,
        needsReview: true,
        annotationVersion: ANNOTATION_VERSION,
        annotatedAt: Date.now(),
        consistencyCheck: {
          attempt1: null,
          attempt2: null,
          consistent: false,
        },
      });
    }
  }

  return results;
}
