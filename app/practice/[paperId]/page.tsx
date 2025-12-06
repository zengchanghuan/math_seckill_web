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
    questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'],
    suggestedTime: 90,
    totalQuestions: 8,
    questionTypes: { choice: 4, fill: 3, solution: 1 },
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
    shortSolution: '直接代入计算。将 $x = 2$ 代入函数表达式即可。',
    detailedSolution: '详细步骤：\n1. 原式：$f(x) = x^2 + 2x + 1$\n2. 代入 $x = 2$：$f(2) = 2^2 + 2 \\times 2 + 1$\n3. 计算：$= 4 + 4 + 1 = 9$\n4. 因此答案为 C',
    knowledgePoints: ['函数', '函数值计算'],
    paperId: 'paper_2023_1',
  },
  {
    questionId: 'q2',
    topic: '方程',
    difficulty: 'L1',
    type: 'fill',
    question: '方程 $x^2 - 5x + 6 = 0$ 的实数解为 $x = $ ______（可有多个解）',
    answer: '2 与 3',
    solution: '因式分解：$(x-2)(x-3) = 0$，所以 $x = 2$ 或 $x = 3$',
    shortSolution: '因式分解法。将二次方程因式分解后求解。本题有两个解：$x_1 = 2$，$x_2 = 3$。',
    detailedSolution: '详细步骤：\n1. 原方程：$x^2 - 5x + 6 = 0$\n2. 因式分解：$(x-2)(x-3) = 0$\n3. 由因式分解可得：$x-2=0$ 或 $x-3=0$\n4. 解得：$x = 2$ 或 $x = 3$\n5. 因此本题有两个解：$x_1 = 2$，$x_2 = 3$，2 和 3 都是解。',
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
    shortSolution: '使用辅助角公式将两个三角函数合并为一个。',
    detailedSolution: '详细步骤：\n1. 原函数：$y = \\sin x + \\cos x$\n2. 提取系数：$= \\sqrt{2}(\\frac{1}{\\sqrt{2}}\\sin x + \\frac{1}{\\sqrt{2}}\\cos x)$\n3. 应用辅助角公式：$= \\sqrt{2}\\sin(x + \\frac{\\pi}{4})$\n4. 由于 $\\sin(x + \\frac{\\pi}{4})$ 的最大值为 1\n5. 因此 $y$ 的最大值为 $\\sqrt{2}$',
    knowledgePoints: ['三角函数', '辅助角公式'],
    paperId: 'paper_2023_1',
  },
  // 添加更多客观题用于测试
  {
    questionId: 'q4',
    topic: '不等式',
    difficulty: 'L1',
    type: 'choice',
    question: '不等式 $2x - 3 > 5$ 的解集是（    ）',
    options: ['A. $x > 4$', 'B. $x > 3$', 'C. $x < 4$', 'D. $x < 3$'],
    answer: 'A',
    solution: '$2x - 3 > 5$，移项得 $2x > 8$，所以 $x > 4$',
    shortSolution: '移项求解。将常数项移到右边，然后除以系数。',
    detailedSolution: '详细步骤：\n1. 原不等式：$2x - 3 > 5$\n2. 移项：$2x > 5 + 3 = 8$\n3. 两边同时除以 2：$x > 4$\n4. 因此答案为 A',
    knowledgePoints: ['不等式', '一元一次不等式'],
    paperId: 'paper_2023_1',
  },
  {
    questionId: 'q5',
    topic: '函数',
    difficulty: 'L1',
    type: 'fill',
    question: '函数 $f(x) = 3x + 2$ 在 $x = 1$ 处的函数值为 $f(1) = $ ______',
    answer: '5',
    solution: '将 $x = 1$ 代入：$f(1) = 3 \\times 1 + 2 = 5$',
    shortSolution: '直接代入计算。',
    detailedSolution: '详细步骤：\n1. 原函数：$f(x) = 3x + 2$\n2. 代入 $x = 1$：$f(1) = 3 \\times 1 + 2$\n3. 计算：$= 3 + 2 = 5$\n4. 因此答案为 5',
    knowledgePoints: ['函数', '函数值计算'],
    paperId: 'paper_2023_1',
  },
  {
    questionId: 'q6',
    topic: '方程',
    difficulty: 'L1',
    type: 'choice',
    question: '方程 $3x + 5 = 14$ 的解是（    ）',
    options: ['A. $x = 2$', 'B. $x = 3$', 'C. $x = 4$', 'D. $x = 5$'],
    answer: 'B',
    solution: '$3x + 5 = 14$，移项得 $3x = 9$，所以 $x = 3$',
    shortSolution: '移项求解。将常数项移到右边，然后除以系数。',
    detailedSolution: '详细步骤：\n1. 原方程：$3x + 5 = 14$\n2. 移项：$3x = 14 - 5 = 9$\n3. 两边同时除以 3：$x = 3$\n4. 因此答案为 B',
    knowledgePoints: ['方程', '一元一次方程'],
    paperId: 'paper_2023_1',
  },
  {
    questionId: 'q7',
    topic: '函数',
    difficulty: 'L2',
    type: 'fill',
    question: '函数 $f(x) = x^2 - 4x + 3$ 的最小值为 ______',
    answer: '-1',
    solution: '配方：$f(x) = (x-2)^2 - 1$，当 $x = 2$ 时取得最小值 $-1$',
    shortSolution: '配方法。将二次函数配方成顶点式，找到最小值。',
    detailedSolution: '详细步骤：\n1. 原函数：$f(x) = x^2 - 4x + 3$\n2. 配方：$= (x^2 - 4x + 4) - 4 + 3 = (x-2)^2 - 1$\n3. 由于 $(x-2)^2 \\geq 0$，所以 $f(x) \\geq -1$\n4. 当 $x = 2$ 时，$(x-2)^2 = 0$，此时 $f(x) = -1$\n5. 因此最小值为 $-1$',
    knowledgePoints: ['函数', '二次函数', '配方法'],
    paperId: 'paper_2023_1',
  },
  {
    questionId: 'q8',
    topic: '不等式',
    difficulty: 'L1',
    type: 'choice',
    question: '不等式 $x + 3 < 7$ 的解集是（    ）',
    options: ['A. $x < 4$', 'B. $x < 3$', 'C. $x > 4$', 'D. $x > 3$'],
    answer: 'A',
    solution: '$x + 3 < 7$，移项得 $x < 4$',
    shortSolution: '移项求解。',
    detailedSolution: '详细步骤：\n1. 原不等式：$x + 3 < 7$\n2. 移项：$x < 7 - 3 = 4$\n3. 因此答案为 A',
    knowledgePoints: ['不等式', '一元一次不等式'],
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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
    console.log('handleQuestionClick 被调用，目标索引:', index, '当前索引:', currentIndex);
    if (index < 0 || index >= filteredQuestions.length) {
      console.error('无效的索引:', index, '总题数:', filteredQuestions.length);
      return;
    }
    setCurrentIndex(index);
    setUserAnswer('');
    setSubmitted(false);
    setIsCorrect(null);

    // 更新对应模式的最后索引
    setProgress(prev => ({
      ...prev,
      [currentMode === 'objective' ? 'lastObjectiveIndex' : 'lastSolutionIndex']: index,
    }));

    // 平滑滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // 加载试卷和题目（仅从 API 加载，不使用 mock 数据）
  useEffect(() => {
    const loadPaper = async () => {
      setIsLoading(true);
      setLoadError(null);
      console.log('开始从 API 加载试卷:', paperId);

      try {
        // 1. 从 API 获取试卷信息
        const papers = await apiClient.getExamPapers();
        const paperData = papers.find(p => p.paperId === paperId);

        if (!paperData) {
          console.error('未找到试卷:', paperId);
          setLoadError(`未找到试卷：${paperId}。请检查试卷 ID 是否正确，或联系管理员。`);
          setIsLoading(false);
          return;
        }

        console.log('从 API 加载试卷信息:', paperData);

        // 2. 从 API 获取题目
        const paperQuestions = await apiClient.getQuestionsByPaper(paperId);

        if (!paperQuestions || paperQuestions.length === 0) {
          console.error('API 未返回题目:', paperId);
          setLoadError(`试卷 "${paperData.name}" 暂无题目数据。请稍后再试或联系管理员。`);
          setIsLoading(false);
          return;
        }

        console.log(`从 API 加载了 ${paperQuestions.length} 道题目`);

        setPaper(paperData);
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

        setIsLoading(false);
      } catch (error: any) {
        console.error('API 加载失败:', error);
        const errorMessage = error?.message || '未知错误';
        if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_NETWORK')) {
          setLoadError('无法连接到服务器。请检查网络连接或服务器地址配置。');
        } else {
          setLoadError(`加载失败：${errorMessage}。请稍后重试或联系管理员。`);
        }
        setIsLoading(false);
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

  // 跳过后显示提示
  const [showSkipMessage, setShowSkipMessage] = useState(false);
  const [skipMessageText, setSkipMessageText] = useState('');

  // 当跳转到已跳过的题时显示提示
  useEffect(() => {
    if (currentQuestion) {
      const status = progress.questionStatus?.[currentQuestion.questionId];
      if (status === 'skipped') {
        // 当跳转到已跳过的题时，显示提示
        setSkipMessageText('已跳过本题，后面可以在「未作答」列表里再回来做。');
        setShowSkipMessage(true);
        const timer = setTimeout(() => {
          setShowSkipMessage(false);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setShowSkipMessage(false);
      }
    } else {
      setShowSkipMessage(false);
    }
  }, [currentQuestion?.questionId, progress.questionStatus]);

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

  // 答案判分逻辑（支持多解）
  const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    const user = userAnswer.toLowerCase().trim();
    const correct = correctAnswer.toLowerCase().trim();

    // 完全匹配
    if (user === correct) return true;

    // 处理多解情况（如"2 与 3"、"2或3"、"2,3"等）
    const normalizeAnswer = (ans: string) => {
      return ans
        .replace(/[与和或、,，]/g, ' ')
        .split(/\s+/)
        .filter(s => s.length > 0)
        .sort()
        .join(' ');
    };

    const normalizedUser = normalizeAnswer(user);
    const normalizedCorrect = normalizeAnswer(correct);

    return normalizedUser === normalizedCorrect;
  };

  // 提交答案
  const handleSubmit = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    setSubmitted(true);

    // 答案检查（支持多解）
    const correct = checkAnswer(userAnswer, currentQuestion.answer);
    setIsCorrect(correct);

    // 更新进度
    setProgress(prev => {
      const newAnswers = { ...prev.answers, [currentQuestion.questionId]: userAnswer };
      const newStatus: Record<string, 'unanswered' | 'answered' | 'wrong' | 'skipped'> = {
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
    // 清除当前题目的状态，允许重新提交
  };

  // 跳过当前题（使用与"下一题"相同的跳转逻辑）
  const handleSkip = () => {
    if (!currentQuestion) {
      return;
    }

    // 显示跳过提示
    setSkipMessageText('已跳过本题，后面可以在「未作答」列表里再回来做。');
    setShowSkipMessage(true);
    setTimeout(() => {
      setShowSkipMessage(false);
    }, 3000);

    // 更新状态，标记当前题为跳过
    const currentStatus = progress.questionStatus || {};
    const newStatus: Record<string, 'unanswered' | 'answered' | 'wrong' | 'skipped'> = {
      ...currentStatus,
      [currentQuestion.questionId]: 'skipped',
    };

    setProgress(prev => ({
      ...prev,
      questionStatus: newStatus,
    }));

    // 找到下一个未作答的题（优先找未作答，如果没有则找跳过的）
    const findNextUnanswered = () => {
      // 1. 从当前题往后找未作答的（不包括跳过的）
      for (let i = currentIndex + 1; i < filteredQuestions.length; i++) {
        const q = filteredQuestions[i];
        const status = newStatus[q.questionId];
        if (!status || status === 'unanswered') {
          return i;
        }
      }

      // 2. 如果后面都做完了，从第1题开始找未作答的
      for (let i = 0; i < currentIndex; i++) {
        const q = filteredQuestions[i];
        const status = newStatus[q.questionId];
        if (!status || status === 'unanswered') {
          return i;
        }
      }

      // 3. 如果所有题都已作答或跳过，找第一个跳过的题（不包括当前题）
      for (let i = currentIndex + 1; i < filteredQuestions.length; i++) {
        const q = filteredQuestions[i];
        const status = newStatus[q.questionId];
        if (status === 'skipped' && i !== currentIndex) {
          return i;
        }
      }

      for (let i = 0; i < currentIndex; i++) {
        const q = filteredQuestions[i];
        const status = newStatus[q.questionId];
        if (status === 'skipped' && i !== currentIndex) {
          return i;
        }
      }

      // 4. 如果所有题都已作答或跳过，跳转到第一题
      if (filteredQuestions.length > 0 && currentIndex !== 0) {
        return 0;
      }

      return null;
    };

    const nextIndex = findNextUnanswered();

    // 立即跳转，使用与 handleNext 相同的逻辑（通过 handleQuestionClick）
    if (nextIndex !== null && nextIndex !== currentIndex) {
      handleQuestionClick(nextIndex);
    } else if (nextIndex === null && currentIndex < filteredQuestions.length - 1) {
      // 如果找不到下一题，但还有题目，跳转到下一题（类似 handleNext）
      handleQuestionClick(currentIndex + 1);
    }
    // 如果已经是最后一题，不跳转（保持与 handleNext 一致的行为）
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

  // 加载状态
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-center text-gray-600 dark:text-gray-400">正在加载试卷...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // 错误状态
  if (loadError) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">加载失败</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 max-w-md">{loadError}</p>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                重新加载
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                返回首页
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <p>提示：请检查：</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>网络连接是否正常</li>
                <li>服务器地址配置是否正确（可在设置页面检查）</li>
                <li>后端 API 服务是否正常运行</li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 如果没有试卷数据，显示错误
  if (!paper || allQuestions.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-yellow-500 text-5xl mb-4">📄</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">暂无数据</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 max-w-md">
              试卷或题目数据为空。请检查试卷 ID 是否正确，或联系管理员。
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mt-4"
            >
              返回首页
            </button>
          </div>
        </div>
      </Layout>
    );
  }

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
                {showSkipMessage && (
                  <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm text-orange-700 dark:text-orange-300">
                    {skipMessageText}
                  </div>
                )}
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
                  onSkip={!submitted ? handleSkip : undefined}
                />
                {/* 调试信息 */}
                {!submitted && (
                  <div className="text-xs text-gray-400 p-2">
                    调试: submitted={String(submitted)}, handleSkip={typeof handleSkip}
                  </div>
                )}

                {submitted && (
                  <SolutionPanel
                    question={currentQuestion}
                    isCorrect={isCorrect}
                    correctAnswer={currentQuestion.answer}
                    userAnswer={userAnswer}
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
          questionStatus={
            currentQuestion
              ? (progress.questionStatus?.[currentQuestion.questionId] as 'unanswered' | 'answered' | 'wrong' | 'skipped') || 'unanswered'
              : 'unanswered'
          }
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFinish={handleFinish}
          onSkip={!submitted ? handleSkip : undefined}
        />
      </div>
    </Layout>
  );
}
