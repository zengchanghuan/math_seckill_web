'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Link from 'next/link';
import type { ExamPaper } from '@/types';

// 题库API响应类型
interface PaperSummary {
  id: number;
  year: number;
  province: string;
  subject: string;
  exam_type: string;
  total_sections: number;
  total_questions: number;
  total_images: number;
  created_at: string;
}

export default function HomePage() {
  const router = useRouter();
  const [examPapers, setExamPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [formData, setFormData] = useState({
    willingToPay: '',
    priceRange: '',
    contact: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // 加载题库数据
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 所有可用的年份（按倒序排列）
        // 2024 + 2003-2018(16年) + 2020-2023(4年) = 21年
        const allYears = [
          2024, 2023, 2022, 2021, 2020, 2018, 2017, 2016, 2015, 2014, 2013, 
          2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003
        ];
        
        // 加载所有JSON文件
        const paperPromises = allYears.map(async (year) => {
          try {
            const response = await fetch(`/papers/广东_高数_${year}.json`);
            if (!response.ok) throw new Error(`${year}年数据不可用`);
            return await response.json();
          } catch (err) {
            console.warn(`跳过 ${year} 年:`, err);
            return null;
          }
        });
        
        const papers = await Promise.all(paperPromises);
        const validPapers = papers.filter(p => p !== null);
        
        // 转换为ExamPaper格式
        const examPaperData: ExamPaper[] = validPapers.map((paperData) => {
          const { meta, paper } = paperData;
          return {
            paperId: `paper_${meta.year}_1`,
            name: `${meta.year}年${meta.province}${meta.exam_type}${meta.subject}真题`,
            year: meta.year,
            region: meta.province,
            examType: meta.exam_type,
            subject: meta.subject,
            questionIds: [], // 后续需要时再加载具体题目
            suggestedTime: 90,
            totalQuestions: meta.total_questions,
            questionTypes: { choice: 0, fill: 0, solution: 0 }, // 可以从sections推断
          };
        });
        
        console.log(`✅ 成功加载 ${examPaperData.length} 套试卷（${examPaperData.map(p => p.year).join(', ')}）`);
        setExamPapers(examPaperData);
      } catch (err) {
        console.error('加载试卷失败:', err);
        setError(err instanceof Error ? err.message : '加载失败');
        setExamPapers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPapers();
  }, []);

  const scrollToPapers = () => {
    document.getElementById('papers-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPayment = () => {
    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 提交到后端API
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Layout>
      <div className="space-y-0">
        {/* Hero Section */}
        <section className="min-h-[42vh] flex flex-col items-center justify-center text-center px-4 py-8 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            高中 → 大学数学衔接
          </h1>
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-2">
            专门为 广东专升本高数 做的真题 + 基础训练，
            <br />
            补上高数里最容易丢分的那一块基础。
          </p>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-4">
            你的私塾教练
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <button
              onClick={() => router.push('/assessment/start')}
              className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
            >
              5分钟测评 → 生成提分路线
            </button>
            <button
              onClick={scrollToPapers}
              className="px-5 py-2 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              继续刷真题（{examPapers.length > 0 ? examPapers[0]?.year : '2024'}）
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            做 10 道题，自动找出薄弱点 + 7 天游标路线（约 5 分钟）
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
            <p>当前为内测版：</p>
            <p>✅ 真题 & 基础解析永久免费</p>
            <p>✅ 未来将增加「错题本、专项训练、进度统计」等 Pro 功能</p>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-8 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">
              为什么值得在这里刷题？——像有一位自己的私塾教练
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1 */}
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                  从真题出发，而不是泛泛而谈
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                  精选近几年广东专升本 / 高数真题，每题标出「考点 + 难度 + 是否值得多刷」。
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                  专门做&ldquo;高中 → 大学&rdquo;这一步
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                  不卷怪题，而是回到函数、方程、三角、排列组合、复数、参数方程这些高数必用模块。
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                  做完就知道为什么对 / 为什么错
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                  选择、填空即时判分，附上关键思路和易错点，而不是只丢一个冷冰冰的答案。
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                  后续 Pro 功能（内测招募中）
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                  计划加入错题本、专项训练、进度统计，如果你愿意为这些功能付费支持，可以在页面底部留下联系方式。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exam Papers Section */}
        <section id="papers-section" className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
              选择一套真题，开始练习
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-2 text-sm">
              已收录 <strong className="text-primary-600 dark:text-primary-400">{examPapers.length} 套</strong> 广东专升本高数真题（2003-2024）
            </p>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-sm">
              已收录2003-2024年广东专升本高数真题（共21年），
              <br />
              所有题目均包含完整的题目、答案和详细解析。
            </p>

            {/* 加载状态 */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">加载中...</p>
              </div>
            )}

            {/* 错误提示 */}
            {error && !loading && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  ⚠️ {error}（已切换到离线模式）
                </p>
              </div>
            )}

            {/* 试卷列表 */}
            {!loading && examPapers.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {(showAll ? examPapers : examPapers.slice(0, 8)).map((paper) => (
                    <Link
                      key={paper.paperId}
                      href={`/practice/${paper.paperId}`}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-lg transition-all text-center group"
                    >
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1 group-hover:scale-110 transition-transform">
                        {paper.year}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        共 {paper.totalQuestions} 题
                      </div>
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        开始练习 →
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* 显示更多按钮 */}
                {examPapers.length > 8 && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="px-6 py-2 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      {showAll ? '收起 ↑' : `查看更早年份（2003-2014）↓`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 空状态 */}
            {!loading && examPapers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-sm">暂无试卷数据</p>
              </div>
            )}
          </div>
        </section>

        {/* Payment Intent Section */}
        <section id="payment-section" className="py-12 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-5">
              想要更完整的功能？你可以决定这个产品的未来
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">
                目前你看到的是一个 <strong>内测版本</strong>：
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                ✅ 真题刷题和基础解析永久免费
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">
                开发者正在考虑是否投入更多时间，做出一个真正好用的「高数衔接工具」
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                在决定之前，我想先确认一件事：
                <br />
                👉 是否真的有人愿意为它付费？
              </p>
            </div>

            {/* Pro Features */}
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                计划中的 Pro 功能包括（仍在设计中）：
              </h3>
              <ul className="space-y-1.5 text-gray-700 dark:text-gray-300 text-sm">
                <li>• 自动错题本：所有做错/标记的题自动收集，支持按章节/知识点二刷</li>
                <li>• 专项训练：按「章节 + 难度」刷题，集中攻克某一块</li>
                <li>• 学习进度统计：最近 7/30 天做题数、正确率趋势、薄弱环节分析</li>
                <li>• 真题不断更新：收录更多年份、更多地区的高数真题</li>
              </ul>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                预计价格区间：¥19 ~ ¥49，一次付费或短期冲刺卡。
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  问题 1：你是否愿意为这样的工具付费？
                </label>
                <div className="space-y-1.5">
                  {['是的，如果功能靠谱，我愿意付费支持', '不确定，需要再用一段时间看看', '不会，我只想用免费内容'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="willingToPay"
                        value={option}
                        checked={formData.willingToPay === option}
                        onChange={(e) => setFormData({ ...formData, willingToPay: e.target.value })}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  问题 2（可选）：你能接受的大概价格范围是？
                </label>
                <div className="space-y-1.5">
                  {['¥19 以内', '¥29 ~ ¥39', '¥49 及以上，只要确实对考试有帮助', '不考虑付费'].map((option) => (
                    <label key={option} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        value={option}
                        checked={formData.priceRange === option}
                        onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                        className="mr-2"
                      />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  问题 3：如果你愿意参与后续内测，可以留下联系方式：
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  如果愿意参与后续内测（优先体验新功能，给些反馈意见），
                  可以留下你的联系方式（微信号 / 邮箱）。
                  我会不定期发测试版和小礼物给内测用户 🙌
                </p>
                <input
                  type="text"
                  placeholder="微信号 / 邮箱（选填）"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                提交反馈
              </button>

              {submitted && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                  <p className="text-green-700 dark:text-green-300 font-medium text-sm">
                    ✅ 已收到，感谢你的反馈！
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                    你给我的这些信息，会直接影响接下来这个产品的发展方向。
                  </p>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
    </Layout>
  );
}
