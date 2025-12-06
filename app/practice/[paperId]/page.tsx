'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient } from '@/lib/api/client';
import type { Question, ExamPaper, PaperProgress } from '@/types';
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
    solution: '将 $x = 2$ 代入函数：$f(2) = 2^2 + 2 \\times 2 + 1 = 4 + 4 + 1 = 9$',
    shortSolution: '关键思路：直接代入计算。将 $x = 2$ 代入函数表达式即可。',
    detailedSolution: '详细步骤：\n1. 原式：$f(x) = x^2 + 2x + 1$\n2. 代入 $x = 2$：$f(2) = 2^2 + 2 \\times 2 + 1$\n3. 计算：$= 4 + 4 + 1 = 9$\n4. 因此答案为 C',
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
    detailedSolution: '详细步骤：\n1. 原方程：$x^2 - 5x + 6 = 0$\n2. 因式分解：$(x-2)(x-3) = 0$\n3. 由因式分解可得：$x-2=0$ 或 $x-3=0$\n4. 解得：$x = 2$ 或 $x = 3$',
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
    solution: '利用辅助角公式：$y = \\sin x + \\cos x = \\sqrt{2}\\sin(x + \\frac{\\pi}{4})$，最大值为 $\\sqrt{2}$',
    shortSolution: '关键思路：使用辅助角公式将两个三角函数合并为一个。',
    detailedSolution: '详细步骤：\n1. 原函数：$y = \\sin x + \\cos x$\n2. 提取系数：$= \\sqrt{2}(\\frac{1}{\\sqrt{2}}\\sin x + \\frac{1}{\\sqrt{2}}\\cos x)$\n3. 应用辅助角公式：$= \\sqrt{2}\\sin(x + \\frac{\\pi}{4})$\n4. 由于 $\\sin(x + \\frac{\\pi}{4})$ 的最大值为 1\n5. 因此 $y$ 的最大值为 $\\sqrt{2}$',
    knowledgePoints: ['三角函数', '辅助角公式'],
    paperId: 'paper_2023_1',
  },
];

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.paperId as string;

  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentMode, setCurrentMode] = useState<'objective' | 'solution'>('objective');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [navFilter, setNavFilter] = useState<'all' | 'unanswered' | 'wrong'>('all');
  const [isMobile, setIsMobile] = useState(false);
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
    return allQuestions.filter(q => {
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

  // 跳转到指定题目
  const handleQuestionClick = (index: number) => {
    setCurrentIndex(index);
    setUserAnswer('');
    setSubmitted(false);
    setIsCorrect(null);

    // 更新对应模式的最后索引
    setProgress(prev => ({
      ...prev,
      [currentMode === 'objective' ? 'lastObjectiveIndex' : 'lastSolutionIndex']: index,
    }));
  };

  // 键盘支持：方向键切换题目
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只在非输入框时响应方向键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        handleQuestionClick(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < filteredQuestions.length - 1) {
        e.preventDefault();
        handleQuestionClick(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, filteredQuestions.length]);

  // 加载试卷和题目
  useEffect(() => {
    const loadPaper = async () => {
      const paperData = mockPapers[paperId] || null;
      setPaper(paperData);

      if (paperData) {
        const paperQuestions = mockQuestions.filter(q => q.paperId === paperId);
        setAllQuestions(paperQuestions);

        // 从localStorage加载进度
        const savedProgress = localStorage.getItem(`paper_progress_${paperId}`);
        if (savedProgress) {
          try {
            const parsed = JSON.parse(savedProgress);
            setProgress(prev => ({
              ...prev,
              ...parsed,
              totalQuestions: paperQuestions.length,
            }));
            setCurrentMode(parsed.mode || 'objective');
            setCurrentIndex(parsed.mode === 'objective' ? (parsed.lastObjectiveIndex || 0) : (parsed.lastSolutionIndex || 0));
          } catch (e) {
            console.error('Failed to load progress:', e);
          }
        } else {
          setProgress(prev => ({
            ...prev,
            totalQuestions: paperQuestions.length,
          }));
        }
      }
    };

    loadPaper();
  }, [paperId]);

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 保存进度到localStorage
  useEffect(() => {
    if (paperId && progress.totalQuestions > 0) {
      localStorage.setItem(`paper_progress_${paperId}`, JSON.stringify(progress));
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
    setProgress(prev => ({
      ...prev,
      mode,
      [mode === 'objective' ? 'lastObjectiveIndex' : 'lastSolutionIndex']: currentIndex,
    }));

    setCurrentMode(mode);

    // 恢复新模式最后访问的题号
    const lastIndex = mode === 'objective'
      ? (progress.lastObjectiveIndex || 0)
      : (progress.lastSolutionIndex || 0);

    // 确保索引在有效范围内
    const newFiltered = allQuestions.filter(q => {
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
    if (!currentQuestion || !userAnswer.trim()) return;

    setSubmitted(true);

    // 简单的答案检查（实际应该调用API）
    const correct = currentQuestion.answer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
    setIsCorrect(correct);

    // 更新进度
    setProgress(prev => {
      const newAnswers = { ...prev.answers, [currentQuestion.questionId]: userAnswer };
      const newStatus: Record<string, 'unanswered' | 'answered' | 'wrong'> = {
        ...(prev.questionStatus || {}),
        [currentQuestion.questionId]: correct ? 'answered' : 'wrong',
      };
      const answeredQuestions = Object.values(newStatus).filter(s => s === 'answered' || s === 'wrong').length;
      const correctQuestions = Object.values(newStatus).filter(s => s === 'answered').length;

      return {
        ...prev,
        answers: newAnswers,
        questionStatus: newStatus,
        answeredCount: answeredQuestions,
        correctCount: correctQuestions,
        accuracy: answeredQuestions > 0 ? (correctQuestions / answeredQuestions) * 100 : 0,
      };
    });
  };

  // 修改答案
  const handleModifyAnswer = () => {
    setSubmitted(false);
    setIsCorrect(null);
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
          <p className="text-center text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </Layout>
    );
  }

  const currentQuestionStatus = currentQuestion
    ? (progress.questionStatus?.[currentQuestion.questionId] || 'unanswered')
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
                  />
                )}
              </>
            )}
          </div>

          {/* 右侧：题号导航（桌面端） */}
          <div className="hidden md:block w-[30%] p-4 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
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

        {/* 底部操作条 */}
        <BottomBar
          currentIndex={currentIndex}
          totalQuestions={filteredQuestions.length}
          questionStatus={currentQuestionStatus as 'unanswered' | 'answered' | 'wrong'}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      </div>
    </Layout>
  );
}
