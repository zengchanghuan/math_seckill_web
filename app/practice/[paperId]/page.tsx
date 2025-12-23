'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api/client';
import type { Question, ExamPaper, PaperProgress } from '@/types';
import { getDayTask } from '@/storage/planStorage';
import TopBar from './components/TopBar';
import QuestionArea from './components/QuestionArea';
import AnswerArea from './components/AnswerArea';
import SolutionPanel from './components/SolutionPanel';
import QuestionNav from './components/QuestionNav';
import BottomBar from './components/BottomBar';

// 模拟试卷数据
const mockPapers: Record<string, ExamPaper> = {
  paper_2023_1: {
    paperId: 'paper_2023_1',
    name: '2023年广东专升本高数真题（第1套）',
    year: 2023,
    region: '广东',
    examType: '专升本',
    subject: '高数',
    questionIds: ['q1', 'q2', 'q3'],
    suggestedTime: 90,
    totalQuestions: 3,
    questionTypes: { choice: 1, fill: 1, solution: 1 },
  },
  paper_2022_1: {
    paperId: 'paper_2022_1',
    name: '2022年广东专升本高数真题（第1套）',
    year: 2022,
    region: '广东',
    examType: '专升本',
    subject: '高数',
    questionIds: ['q1', 'q2', 'q3'],
    suggestedTime: 90,
    totalQuestions: 3,
    questionTypes: { choice: 1, fill: 1, solution: 1 },
  },
  paper_2021_1: {
    paperId: 'paper_2021_1',
    name: '2021年广东专升本高数真题（第1套）',
    year: 2021,
    region: '广东',
    examType: '专升本',
    subject: '高数',
    questionIds: ['q1', 'q2', 'q3'],
    suggestedTime: 90,
    totalQuestions: 3,
    questionTypes: { choice: 1, fill: 1, solution: 1 },
  },
};

// 模拟题目数据
const mockQuestions: Question[] = [
  {
    questionId: 'q1',
    topic: '函数',
    difficulty: 'L1',
    type: 'choice',
    question: '已知函数 $f(x) = x^2 + 2x + 1$，则 $f(2) = $（    ）',
    options: ['A. 5', 'B. 7', 'C. 9', 'D. 11'],
    answer: 'C',
    solution:
      '将 $x = 2$ 代入函数：$f(2) = 2^2 + 2 \\times 2 + 1 = 4 + 4 + 1 = 9$',
    shortSolution: '关键思路：直接代入计算。将 $x = 2$ 代入函数表达式即可。',
    detailedSolution:
      '详细步骤：\n1. 原式：$f(x) = x^2 + 2x + 1$\n2. 代入 $x = 2$：$f(2) = 2^2 + 2 \\times 2 + 1$\n3. 计算：$= 4 + 4 + 1 = 9$\n4. 因此答案为 C',
    knowledgePoints: ['函数', '函数值计算'],
    paperId: 'paper_2023_1',
  },
  {
    questionId: 'q2',
    topic: '方程',
    difficulty: 'L1',
    type: 'fill',
    question: '方程 $x^2 - 5x + 6 = 0$ 的解为 $x = $ ______',
    answer: '2 或 3',
    solution: '因式分解：$(x-2)(x-3) = 0$，所以 $x = 2$ 或 $x = 3$',
    shortSolution: '关键思路：因式分解法。将二次方程因式分解后求解。',
    detailedSolution:
      '详细步骤：\n1. 原方程：$x^2 - 5x + 6 = 0$\n2. 因式分解：$(x-2)(x-3) = 0$\n3. 由因式分解可得：$x-2=0$ 或 $x-3=0$\n4. 解得：$x = 2$ 或 $x = 3$',
    knowledgePoints: ['方程', '因式分解'],
    paperId: 'paper_2023_1',
  },
  {
    questionId: 'q3',
    topic: '三角函数',
    difficulty: 'L2',
    type: 'solution',
    question: '求函数 $y = \\sin x + \\cos x$ 的最大值。',
    answer: '$\\sqrt{2}$',
    solution:
      '利用辅助角公式：$y = \\sin x + \\cos x = \\sqrt{2}\\sin(x + \\frac{\\pi}{4})$，最大值为 $\\sqrt{2}$',
    shortSolution: '关键思路：使用辅助角公式将两个三角函数合并为一个。',
    detailedSolution:
      '详细步骤：\n1. 原函数：$y = \\sin x + \\cos x$\n2. 提取系数：$= \\sqrt{2}(\\frac{1}{\\sqrt{2}}\\sin x + \\frac{1}{\\sqrt{2}}\\cos x)$\n3. 应用辅助角公式：$= \\sqrt{2}\\sin(x + \\frac{\\pi}{4})$\n4. 由于 $\\sin(x + \\frac{\\pi}{4})$ 的最大值为 1\n5. 因此 $y$ 的最大值为 $\\sqrt{2}$',
    knowledgePoints: ['三角函数', '辅助角公式'],
    paperId: 'paper_2023_1',
  },
];

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperId = params.paperId as string;

  // 检测plan模式
  const mode = searchParams.get('mode');
  const isPlanMode = mode === 'plan';
  const planDay = searchParams.get('day') ? parseInt(searchParams.get('day')!) : null;
  const planId = searchParams.get('planId');

  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentMode, setCurrentMode] = useState<'objective' | 'solution'>(
    'objective'
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [navFilter, setNavFilter] = useState<'all' | 'unanswered' | 'wrong'>(
    'all'
  );
  const [isMobile, setIsMobile] = useState(false);
  const [showPlanComplete, setShowPlanComplete] = useState(false);
  const [progress, setProgress] = useState<PaperProgress>({
    paperId,
    currentIndex: 0,
    totalQuestions: 0,
    answeredCount: 0,
    correctCount: 0,
    accuracy: 0,
    answers: {},
    isCompleted: false,
    mode: 'objective',
    lastObjectiveIndex: 0,
    lastSolutionIndex: 0,
    questionStatus: {},
  });

  // 根据模式过滤题目
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (currentMode === 'objective') {
        return q.type === 'choice' || q.type === 'fill';
      } else {
        return q.type === 'solution';
      }
    });
  }, [allQuestions, currentMode]);

  // 当前题目
  const currentQuestion = filteredQuestions[currentIndex];

  // 移动端检测
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 键盘支持：方向键切换题目
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在非输入框时响应方向键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        handleQuestionClick(currentIndex - 1);
      } else if (
        e.key === 'ArrowRight' &&
        currentIndex < filteredQuestions.length - 1
      ) {
        e.preventDefault();
        handleQuestionClick(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredQuestions.length]);

  // 加载试卷和题目
  useEffect(() => {
    const loadPaper = async () => {
      try {
        // Plan模式：从dayTask加载题目
        if (isPlanMode && planDay && planId) {
          const dayTask = getDayTask(planId, planDay);
          if (!dayTask) {
            alert('未找到训练计划');
            router.push('/assessment/report');
            return;
          }

          if (!dayTask.itemIds || dayTask.itemIds.length === 0) {
            alert('该计划暂无题目');
            router.push('/assessment/report');
            return;
          }

          // 创建虚拟paper
          const planPaper: ExamPaper = {
            paperId: `plan_day${planDay}`,
            name: `Day${planDay}: ${dayTask.title}`,
            year: new Date().getFullYear(),
            region: '测评计划',
            examType: '专项训练',
            subject: '高数',
            questionIds: dayTask.itemIds,
            suggestedTime: Math.ceil(dayTask.totalQuestions * 2), // 每题2分钟
            totalQuestions: dayTask.totalQuestions,
            questionTypes: { choice: 0, fill: 0, solution: 0 },
          };

          setPaper(planPaper);

          // TODO: 从题库加载dayTask.itemIds对应的题目
          // 暂时使用mock数据
          setAllQuestions(mockQuestions.slice(0, dayTask.totalQuestions));
          
          return;
        }

        // 原有逻辑：从paperId提取年份（格式：paper_2023_1）
        const yearMatch = paperId.match(/paper_(\d{4})_/);
        if (!yearMatch) {
          console.error('无效的试卷ID格式');
          return;
        }

        const year = parseInt(yearMatch[1]);

        // 直接从public目录加载JSON文件
        const response = await fetch(`/papers/广东_高数_${year}.json`);

        if (!response.ok) {
          throw new Error('加载试卷失败');
        }

        const jsonData = await response.json();
        const { meta, paper: paperData } = jsonData;

        // 转换为ExamPaper格式
        const examPaper: ExamPaper = {
          paperId: paperId,
          name: `${meta.year}年${meta.province}${meta.exam_type}${meta.subject}真题`,
          year: meta.year,
          region: meta.province,
          examType: meta.exam_type,
          subject: meta.subject,
          questionIds: [],
          suggestedTime: 90,
          totalQuestions: meta.total_questions,
          questionTypes: { choice: 0, fill: 0, solution: 0 },
        };

        setPaper(examPaper);

        // 转换sections和questions为Question[]格式
        let paperQuestions: Question[] = [];
        let questionCounter = 1;

        // 遍历sections和questions，转换为Question[]格式
        for (const section of paperData.sections) {
          for (const q of section.questions) {
            // 判断题型（根据章节名）
            let questionType: 'choice' | 'fill' | 'solution' = 'solution';
            const sectionName = section.section_name;

            // 优先根据章节名判断
            if (sectionName.includes('选择')) {
              questionType = 'choice';
            } else if (sectionName.includes('填空')) {
              questionType = 'fill';
            }
            // 其他情况（计算题、综合题等）默认为solution

            // 从answer字段提取答案和解析
            // 格式通常是: "C\n【精析】解析内容" 或 "答案内容\n【解析】解析内容"
            let extractedAnswer = q.answer || '';
            let extractedSolution = '';

            if (q.answer) {
              const answerParts = q.answer.split(/\n【[精解][析析]】/);
              extractedAnswer = answerParts[0].trim();
              extractedSolution =
                answerParts.length > 1 ? answerParts[1].trim() : '';
            }

            const question: Question = {
              questionId: `${paperId}_q${questionCounter}`,
              topic: section.section_name,
              difficulty: 'L1', // 默认难度
              type: questionType,
              question:
                questionType === 'choice'
                  ? extractQuestionStem(q.content)
                  : q.content,
              answer: extractedAnswer,
              solution: extractedSolution || extractedAnswer,
              shortSolution: extractedSolution || extractedAnswer,
              detailedSolution: extractedSolution || extractedAnswer,
              knowledgePoints: [section.section_name],
              paperId: paperId,
              options:
                questionType === 'choice'
                  ? extractOptions(q.content)
                  : undefined,
              images: q.images || [],
            };

            paperQuestions.push(question);
            questionCounter++;
          }
        }

        setAllQuestions(paperQuestions);
        console.log(
          `✅ 成功加载 ${year}年试卷，共 ${paperQuestions.length} 道题目`
        );
      } catch (error) {
        console.error('❌ 加载试卷失败:', error);
        // 降级使用模拟数据
        const fallbackPaper = mockPapers[paperId] || null;
        setPaper(fallbackPaper);

        if (fallbackPaper) {
          const fallbackQuestions = mockQuestions.filter(
            (q) => q.paperId === paperId
          );
          setAllQuestions(fallbackQuestions);
        }
      }
    };

    loadPaper();
  }, [paperId, isPlanMode, planDay, planId, router]);

  // 从题目内容中提取选项（用于选择题）
  // 从content中提取纯题干（去除选项）
  function extractQuestionStem(content: string): string {
    // 找到第一个选项的位置（A. 或 A、）
    const firstOptionMatch = content.match(/[A-D][\.、]/);
    if (firstOptionMatch && firstOptionMatch.index !== undefined) {
      // 返回选项之前的内容作为题干
      return content.substring(0, firstOptionMatch.index).trim();
    }
    // 如果没有找到选项，返回全部内容
    return content.trim();
  }

  // 从content中提取选项（保留字母标识）
  function extractOptions(content: string): string[] {
    const options: string[] = [];
    // 匹配 A. B. C. D. 格式的选项（支持换行）
    const lines = content.split('\n');
    for (const line of lines) {
      const optionMatch = line.match(/^([A-D])[\.、]\s*(.+)$/);
      if (optionMatch) {
        // 保留完整的选项格式 "A. xxx"
        options.push(`${optionMatch[1]}. ${optionMatch[2].trim()}`);
      }
    }
    return options;
  }

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 保存进度到localStorage
  useEffect(() => {
    if (paperId && progress.totalQuestions > 0) {
      localStorage.setItem(
        `paper_progress_${paperId}`,
        JSON.stringify(progress)
      );
    }
  }, [progress, paperId]);

  // 恢复当前题目的答案
  useEffect(() => {
    if (currentQuestion) {
      const savedAnswer = progress.answers[currentQuestion.questionId] || '';
      setUserAnswer(savedAnswer);
      const status = progress.questionStatus?.[currentQuestion.questionId];
      if (status === 'answered' || status === 'wrong') {
        setSubmitted(true);
        setIsCorrect(status === 'answered');
      } else {
        setSubmitted(false);
        setIsCorrect(null);
      }
    }
  }, [currentQuestion, progress]);

  // 模式切换
  const handleModeChange = (mode: 'objective' | 'solution') => {
    // 保存当前模式的索引
    setProgress((prev) => ({
      ...prev,
      mode,
      [mode === 'objective' ? 'lastObjectiveIndex' : 'lastSolutionIndex']:
        currentIndex,
    }));

    setCurrentMode(mode);

    // 恢复新模式最后访问的题号
    const lastIndex =
      mode === 'objective'
        ? progress.lastObjectiveIndex || 0
        : progress.lastSolutionIndex || 0;

    // 确保索引在有效范围内
    const newFiltered = allQuestions.filter((q) => {
      if (mode === 'objective') {
        return q.type === 'choice' || q.type === 'fill';
      } else {
        return q.type === 'solution';
      }
    });

    const safeIndex = Math.min(lastIndex, newFiltered.length - 1);
    setCurrentIndex(safeIndex);
    setUserAnswer('');
    setSubmitted(false);
    setIsCorrect(null);
  };

  // 提交答案
  const handleSubmit = async () => {
    console.log('handleSubmit 被调用', {
      currentQuestion: currentQuestion?.questionId,
      questionType: currentQuestion?.type,
      userAnswer,
      hasAnswer: !!userAnswer.trim(),
    });

    if (!currentQuestion) return;

    // 对于解答题，允许不填写答案直接查看解析
    // 对于选择题和填空题，必须填写答案才能提交
    if (currentQuestion.type !== 'solution' && !userAnswer.trim()) {
      console.log('提交被阻止：选择题/填空题需要填写答案');
      return;
    }

    console.log('设置 submitted = true');
    setSubmitted(true);

    // 简单的答案检查（实际应该调用API）
    // 解答题默认为正确（因为没有自动判分）
    const correct =
      currentQuestion.type === 'solution'
        ? true
        : currentQuestion.answer.toLowerCase().trim() ===
          userAnswer.toLowerCase().trim();
    setIsCorrect(correct);

    console.log('答案检查结果:', {
      correct,
      answer: currentQuestion.answer,
      userAnswer,
    });

    // 更新进度
    setProgress((prev) => {
      const newAnswers = {
        ...prev.answers,
        [currentQuestion.questionId]: userAnswer,
      };
      const newStatus: Record<string, 'unanswered' | 'answered' | 'wrong'> = {
        ...(prev.questionStatus || {}),
        [currentQuestion.questionId]: correct ? 'answered' : 'wrong',
      };
      const answeredQuestions = Object.values(newStatus).filter(
        (s) => s === 'answered' || s === 'wrong'
      ).length;
      const correctQuestions = Object.values(newStatus).filter(
        (s) => s === 'answered'
      ).length;

      // Plan模式：检查是否完成所有题目
      if (isPlanMode && answeredQuestions === filteredQuestions.length) {
        setTimeout(() => setShowPlanComplete(true), 500);
      }

      return {
        ...prev,
        answers: newAnswers,
        questionStatus: newStatus,
        answeredCount: answeredQuestions,
        correctCount: correctQuestions,
        accuracy:
          answeredQuestions > 0
            ? (correctQuestions / answeredQuestions) * 100
            : 0,
      };
    });
  };

  // 修改答案
  const handleModifyAnswer = () => {
    setSubmitted(false);
    setIsCorrect(null);
  };

  // 跳转到指定题目
  const handleQuestionClick = (index: number) => {
    setCurrentIndex(index);
    setUserAnswer('');
    setSubmitted(false);
    setIsCorrect(null);

    // 更新对应模式的最后索引
    setProgress((prev) => ({
      ...prev,
      [currentMode === 'objective'
        ? 'lastObjectiveIndex'
        : 'lastSolutionIndex']: index,
    }));
  };

  // 上一题
  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleQuestionClick(currentIndex - 1);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      handleQuestionClick(currentIndex + 1);
    } else {
      // 完成试卷，跳转到结果页
      router.push(`/practice/${paperId}/result`);
    }
  };

  // 退出练习
  const handleExit = () => {
    router.push('/');
  };

  // 结束练习
  const handleFinish = () => {
    router.push(`/practice/${paperId}/result`);
  };

  if (!paper) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            加载中...
          </p>
        </div>
      </Layout>
    );
  }

  const currentQuestionStatus = currentQuestion
    ? progress.questionStatus?.[currentQuestion.questionId] || 'unanswered'
    : 'unanswered';

  return (
    <Layout>
      <div className="flex flex-col h-screen">
        {/* 顶部信息栏 */}
        <TopBar
          paper={paper}
          currentIndex={currentIndex}
          totalQuestions={filteredQuestions.length}
          currentMode={currentMode}
          onModeChange={handleModeChange}
          elapsedTime={elapsedTime}
          answeredCount={progress.answeredCount}
          onExit={handleExit}
        />

        {/* Plan模式：今日任务条 */}
        {isPlanMode && planDay && planId && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                    今日目标：{paper?.name || `Day${planDay}训练`}
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    任务：{filteredQuestions.length}题 | 
                    进度：{progress.answeredCount}/{filteredQuestions.length} | 
                    正确率：{progress.accuracy.toFixed(0)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Day{planDay}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 主内容区 */}
        <div className="flex-1 overflow-auto flex flex-col md:flex-row">
          {/* 左侧/中间：题目 + 作答区 */}
          <div className="flex-1 p-4 md:p-6 space-y-4 md:w-[70%]">
            {currentQuestion && (
              <>
                <QuestionArea
                  question={currentQuestion}
                  questionNumber={currentIndex + 1}
                />

                <AnswerArea
                  question={currentQuestion}
                  userAnswer={userAnswer}
                  onAnswerChange={setUserAnswer}
                  submitted={submitted}
                  isCorrect={isCorrect}
                  onSubmit={handleSubmit}
                  onModifyAnswer={submitted ? handleModifyAnswer : undefined}
                />

                {submitted && (
                  <SolutionPanel
                    question={currentQuestion}
                    isCorrect={isCorrect}
                    correctAnswer={currentQuestion.answer}
                    userAnswer={userAnswer}
                  />
                )}

                {/* 底部操作条 - 移到题目区域内 */}
                <BottomBar
                  currentIndex={currentIndex}
                  totalQuestions={filteredQuestions.length}
                  questionStatus={
                    currentQuestionStatus as 'unanswered' | 'answered' | 'wrong'
                  }
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onFinish={handleFinish}
                />
              </>
            )}
          </div>

          {/* 右侧：题号导航（桌面端） */}
          <div className="hidden md:block w-[30%] p-3 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
            <QuestionNav
              questions={filteredQuestions}
              currentIndex={currentIndex}
              questionStatus={progress.questionStatus || {}}
              onQuestionClick={handleQuestionClick}
              filter={navFilter}
              onFilterChange={setNavFilter}
              answeredCount={progress.answeredCount}
              correctCount={progress.correctCount}
              totalQuestions={filteredQuestions.length}
            />
          </div>
        </div>

        {/* 移动端题号导航（悬浮按钮） */}
        {isMobile && (
          <QuestionNav
            questions={filteredQuestions}
            currentIndex={currentIndex}
            questionStatus={progress.questionStatus || {}}
            onQuestionClick={handleQuestionClick}
            filter={navFilter}
            onFilterChange={setNavFilter}
            answeredCount={progress.answeredCount}
            correctCount={progress.correctCount}
            totalQuestions={filteredQuestions.length}
            isMobile={true}
          />
        )}

        {/* Plan模式完成弹窗 */}
        {showPlanComplete && isPlanMode && planDay && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                🎉 Day{planDay} 完成！
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">正确率</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {progress.accuracy.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">完成题数</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {progress.answeredCount}/{filteredQuestions.length}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">平均用时</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {Math.round(elapsedTime / progress.answeredCount)}秒/题
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowPlanComplete(false);
                    if (planDay && planDay < 7) {
                      router.push(`/assessment/report`);
                    }
                  }}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  {planDay && planDay < 7 ? '继续 Day' + (planDay + 1) + '（Pro）' : '返回报告页'}
                </button>
                <button
                  onClick={() => router.push('/assessment/report')}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  返回提分报告
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
