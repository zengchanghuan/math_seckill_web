/**
 * 测评题目加载器
 */

import type { Question, AssessmentQuestion } from '@/types';

// 加载测评题集
export async function loadAssessmentSet() {
  const response = await fetch('/assessment/assessment_set_v1.json');
  if (!response.ok) {
    throw new Error('Failed to load assessment set');
  }
  return await response.json();
}

// 从年份的JSON文件中加载具体题目
export async function loadQuestionFromPaper(
  year: number,
  questionNumber: number,
  sectionName: string
): Promise<Question | null> {
  try {
    const response = await fetch(`/papers/广东_高数_${year}.json`);
    if (!response.ok) return null;

    const data = await response.json();
    const section = data.paper.sections.find(
      (s: any) => s.section_name === sectionName
    );

    if (!section) return null;

    const questionData = section.questions.find(
      (q: any) => q.question_number === questionNumber
    );

    if (!questionData) return null;

    // 解析选项（如果是选择题）
    const content = questionData.content;
    const lines = content.split('\n');
    const questionText = lines[0];
    const options = lines.slice(1).filter((line: string) => /^[A-D]\./.test(line));

    // 解析答案
    const answerText = questionData.answer || '';
    const answerMatch = answerText.match(/^([A-D]|[^【\n]+)/);
    const correctAnswer = answerMatch ? answerMatch[1].trim() : '';

    // 提取解析（去掉【精析】标记）
    const solutionMatch = answerText.match(/【精析】(.+)/s);
    const solution = solutionMatch ? solutionMatch[1].trim() : answerText;

    // 调试日志
    console.log(`Loading question ${year}_q${questionNumber}:`, {
      questionText,
      optionsCount: options.length,
      correctAnswer,
    });

    // 构造Question对象
    const question: Question = {
      questionId: `${year}_q${questionNumber}`,
      topic: '高数综合',
      difficulty: 'L2',
      type: options.length > 0 ? 'choice' : 'fill',
      question: questionText,
      options: options.length > 0 ? options : undefined,
      answer: correctAnswer,
      solution: solution,
      knowledgePoints: [],
      paperId: `paper_${year}_1`,
      images: questionData.images || [],
    };

    return question;
  } catch (error) {
    console.error(`Error loading question ${year}_q${questionNumber}:`, error);
    return null;
  }
}

// 加载所有测评题目
export async function loadAllAssessmentQuestions(): Promise<Question[]> {
  const assessmentSet = await loadAssessmentSet();
  const questions: Question[] = [];

  for (const item of assessmentSet.questions) {
    const question = await loadQuestionFromPaper(
      item.year,
      item.questionNumber,
      item.sectionName
    );
    if (question) {
      // 添加知识点信息
      question.knowledgePoints = item.knowledge;
      questions.push(question);
    }
  }

  return questions;
}

// 构建知识点到题目ID的映射
export function buildKnowledgeQuestionsMap(
  assessmentSet: any
): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  assessmentSet.questions.forEach((item: AssessmentQuestion) => {
    item.knowledge.forEach((kp: string) => {
      if (!map[kp]) {
        map[kp] = [];
      }
      map[kp].push(item.id);
    });
  });

  return map;
}

