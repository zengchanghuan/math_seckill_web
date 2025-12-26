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

// 白名单集合
const VALID_CONCEPT = new Set(Object.keys(CONCEPT_TAGS));
const VALID_SKILLS = new Set(['记忆', '理解', '计算', '推理', '应用', '综合']);

/**
 * 数值夹逼（整数）
 */
function clampInt(v: any, min: number, max: number, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.round(n);
  return Math.min(max, Math.max(min, i));
}

/**
 * 数值夹逼（浮点数）
 */
function clampNum(v: any, min: number, max: number, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * 数组去重
 */
function uniq(arr: string[]): string[] {
  return [...new Set(arr)];
}

/**
 * 规范化知识点标签（concept/prereq）
 */
function normalizeTags(v: any, maxLen: number): string[] {
  const arr = Array.isArray(v) ? v : [];
  const cleaned = arr
    .map((x) => String(x).trim())
    .filter((x) => VALID_CONCEPT.has(x));
  return uniq(cleaned).slice(0, maxLen);
}

/**
 * 规范化能力标签
 */
function normalizeSkills(v: any, maxLen: number): string[] {
  const arr = Array.isArray(v) ? v : [];
  const cleaned = arr
    .map((x) => String(x).trim())
    .filter((x) => VALID_SKILLS.has(x));
  return uniq(cleaned).slice(0, maxLen);
}

/**
 * DeepSeek输出强校验与净化
 * 确保所有字段在合法范围内、去重、夹逼
 */
function parseDeepSeekResult(raw: any): AnnotationResponse {
  if (!raw || typeof raw !== 'object') {
    throw new Error('DeepSeek result is not an object');
  }

  // 1. 核心知识点：必须1-3个，在枚举内
  const conceptTags = normalizeTags(raw.concept_tags, 3);
  if (conceptTags.length < 1) {
    throw new Error('No valid concept_tags found in DeepSeek output');
  }

  // 2. 先修知识点：0-3个，在枚举内
  const prereqTags = normalizeTags(raw.prereq_tags, 3);

  // 3. 难度：强制1-5，默认3
  const difficulty = clampInt(raw.difficulty, 1, 5, 3);

  // 4. 预估用时：强制20-1800秒（0.3分钟-30分钟），默认120秒
  const timeEstimateSec = clampInt(raw.time_estimate_sec, 20, 1800, 120);

  // 5. 能力要求：最多3个，在白名单内
  const skills = normalizeSkills(raw.skills, 3);

  // 6. 置信度：强制0-1，默认0.8
  const confidence = clampNum(raw.confidence, 0, 1, 0.8);

  // 7. 理由：截断到200字符
  const reasoning =
    typeof raw.reasoning === 'string' ? raw.reasoning.trim().slice(0, 200) : '';

  return {
    conceptTags: conceptTags as ConceptTag[],
    prereqTags: prereqTags as ConceptTag[],
    difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
    timeEstimateSec,
    skills,
    confidence,
    reasoning,
  };
}

/**
 * 生成标注prompt
 */
function generateAnnotationPrompt(request: AnnotationRequest): string {
  // 生成更紧凑、信息量更大的知识点列表
  const conceptList = Object.entries(CONCEPT_TAGS)
    .map(([key, config]) => {
      const aliasStr = config.aliases.length > 0 ? ` [触发词: ${config.aliases.join(', ')}]` : '';
      return `${key}: ${config.label}${aliasStr}\n   (判定: ${config.notes})`;
    })
    .join('\n');

  return `你是专升本高数题库标注专家。请为以下题目生成精准、稳定、可复现的元数据标注。

【题目信息】
题型：${request.sectionName}
题干：${request.content}
答案：${request.answer}

【核心原则】
- 优先选择最直接、最明显的知识点（避免过度解读）
- 难度判定基于"专升本考生平均水平"（不要过高或过低）
- 用时估算要符合真实考试场景（不要理想化）
- 标注要稳定一致，避免模棱两可的边界判断

【标注要求】
1. concept_tags：从以下枚举表中选择1-3个最核心的知识点
   - 优先选择"必考知识点"（标注有"必考X"的）
   - 如果题目综合多个知识点，选择"占分最多"的那个
   - 避免选择过于宽泛或过于细节的知识点
${conceptList}

2. prereq_tags：从上述枚举表中选择0-3个先修知识点
   - 只选择"做此题必须先掌握"的前置知识
   - 如果此题是基础题，可以为空
   - 不要选择"相关但非必须"的知识点

3. difficulty：难度等级1-5（基于专升本考生平均水平）
   - 1: 送分题，直接套公式（如 lim(x→0) sinx/x）
   - 2: 简单题，一步计算（如 求 f'(x) = x²）
   - 3: 中等题，2-3步变形（如 换元积分、分部积分）
   - 4: 偏难题，需要技巧（如 凹凸性判断、二重积分换序）
   - 5: 压轴题，需要综合应用（如 微分方程应用题）
   【提示】约70%的题目应在2-3难度，避免极端化

4. time_estimate_sec：预估学生完成时间（秒）
   - 选择题：60-120秒（简单60，中等90，偏难120）
   - 填空题：90-180秒（简单90，中等120，偏难180）
   - 解答题：180-300秒（简单180，中等240，偏难300）
   【提示】考虑"写步骤"的时间，不只是"算出来"

5. skills：能力要求，从中选择1-2个最核心的
   - "记忆": 背诵公式定理
   - "理解": 概念理解
   - "计算": 数值计算（最常见）
   - "推理": 逻辑推导
   - "应用": 实际问题建模
   - "综合": 多知识点整合
   【提示】大部分题目是"计算"或"计算+推理"

6. confidence：你对此标注的置信度（0-1）
   - 0.9-1.0: 非常确定（知识点明确、难度清晰）
   - 0.7-0.9: 比较确定（可能有小的歧义）
   - <0.7: 不太确定（建议人工复审）

【输出格式】
严格输出JSON，不要任何其他文本：
{
  "concept_tags": ["limit-calculation", "limit-special"],
  "prereq_tags": ["func-basic"],
  "difficulty": 2,
  "time_estimate_sec": 60,
  "skills": ["计算"],
  "confidence": 0.95,
  "reasoning": "此题考查重要极限，属于必考点，难度为送分题级别"
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

  // 解析JSON并强校验
  const raw = JSON.parse(content);
  const result = parseDeepSeekResult(raw);

  return result;
}

/**
 * 计算两次标注的一致性
 * 优化版：放宽阈值，降低人工审核率
 */
function checkConsistency(
  attempt1: AnnotationResponse,
  attempt2: AnnotationResponse
): boolean {
  // 知识点一致性（降低到40%重合即可，因为AI可能从不同角度标注）
  const tags1 = new Set(attempt1.conceptTags);
  const tags2 = new Set(attempt2.conceptTags);
  const intersection = [...tags1].filter((t) => tags2.has(t));
  const conceptMatch =
    intersection.length >= Math.min(tags1.size, tags2.size) * 0.4;

  // 难度一致性（放宽到相差≤2，因为难度本身有主观性）
  const difficultyMatch =
    Math.abs(attempt1.difficulty - attempt2.difficulty) <= 2;

  // 用时一致性（放宽到相差≤40%）
  const timeRatio = Math.max(
    attempt1.timeEstimateSec / attempt2.timeEstimateSec,
    attempt2.timeEstimateSec / attempt1.timeEstimateSec
  );
  const timeMatch = timeRatio <= 1.4;

  // 置信度检查（新增）：如果两次置信度都≥0.85，直接通过
  const highConfidence =
    attempt1.confidence >= 0.85 && attempt2.confidence >= 0.85;
  if (highConfidence && conceptMatch) {
    return true; // 高置信度 + 知识点匹配 = 直接通过
  }

  // 综合判断：知识点匹配 + (难度或用时至少一个匹配)
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
 * 完整标注流程：双温度+一致性校验+智能仲裁
 * 优化版：最大化降低人工审核
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
  let consistent = checkConsistency(attempt1, attempt2);
  console.log(`[Annotation] 一致性检查: ${consistent ? '一致' : '不一致'}`);

  let finalResult = attempt1;
  let thirdAttempt = null;

  // 【新增】如果不一致，尝试第三次仲裁（温度0.25，中等确定性）
  if (!consistent) {
    console.log('[Annotation] 启动第三次仲裁标注...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    thirdAttempt = await callDeepSeekAnnotation(request, 0.25);
    console.log('[Annotation] 第三次标注完成');

    // 三选二：找出最接近的两次
    const pairs = [
      {
        a: attempt1,
        b: attempt2,
        consistent: checkConsistency(attempt1, attempt2),
      },
      {
        a: attempt1,
        b: thirdAttempt,
        consistent: checkConsistency(attempt1, thirdAttempt),
      },
      {
        a: attempt2,
        b: thirdAttempt,
        consistent: checkConsistency(attempt2, thirdAttempt),
      },
    ];

    // 找到一致性最高的pair
    const bestPair = pairs.find((p) => p.consistent);
    if (bestPair) {
      // 有任意两次一致，使用置信度更高的那次
      finalResult =
        bestPair.a.confidence >= bestPair.b.confidence
          ? bestPair.a
          : bestPair.b;
      consistent = true; // 三次中有两次一致，认为可以通过
      console.log('[Annotation] 仲裁成功：三次中有两次一致');
    } else {
      // 三次都不一致，使用置信度最高的
      const allAttempts = [attempt1, attempt2, thirdAttempt];
      finalResult = allAttempts.reduce((prev, curr) =>
        curr.confidence > prev.confidence ? curr : prev
      );
      consistent = false; // 仍然需要人工复审
      console.log('[Annotation] 仲裁失败：三次均不一致，需人工复审');
    }
  } else {
    // 两次一致，使用置信度高的
    finalResult =
      attempt1.confidence >= attempt2.confidence ? attempt1 : attempt2;
  }

  // 生成元数据
  const metadata: QuestionMetadata = {
    questionId: '', // 由调用方设置
    conceptTags: finalResult.conceptTags as ConceptTag[],
    prereqTags: finalResult.prereqTags as ConceptTag[],
    difficulty: finalResult.difficulty,
    timeEstimateSec: finalResult.timeEstimateSec,
    skills: finalResult.skills,
    confidence: finalResult.confidence,
    needsReview: !consistent, // 只有三次都不一致才需要复审
    annotationVersion: ANNOTATION_VERSION,
    annotatedAt: Date.now(),
    consistencyCheck: {
      attempt1,
      attempt2,
      consistent,
      ...(thirdAttempt && { attempt3: thirdAttempt }), // 记录第三次尝试
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
