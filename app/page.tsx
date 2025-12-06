'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import type { ExamPaper } from '@/types';

// 模拟真题数据（如果后端API未就绪）
const mockExamPapers: ExamPaper[] = [
  {
    paperId: 'paper_2023_1',
    name: '2023年广东专升本高数真题（第1套）',
    year: 2023,
    region: '广东',
    examType: '专升本',
    subject: '高数',
    questionIds: [],
    suggestedTime: 90,
    totalQuestions: 25,
    questionTypes: { choice: 10, fill: 7, solution: 8 },
  },
  {
    paperId: 'paper_2022_1',
    name: '2022年广东专升本高数真题（第1套）',
    year: 2022,
    region: '广东',
    examType: '专升本',
    subject: '高数',
    questionIds: [],
    suggestedTime: 90,
    totalQuestions: 25,
    questionTypes: { choice: 10, fill: 7, solution: 8 },
  },
  {
    paperId: 'paper_2021_1',
    name: '2021年广东专升本高数真题（第1套）',
    year: 2021,
    region: '广东',
    examType: '专升本',
    subject: '高数',
    questionIds: [],
    suggestedTime: 90,
    totalQuestions: 25,
    questionTypes: { choice: 10, fill: 7, solution: 8 },
  },
];

export default function HomePage() {
  const [examPapers] = useState<ExamPaper[]>(mockExamPapers);
  const [formData, setFormData] = useState({
    willingToPay: '',
    priceRange: '',
    contact: '',
  });
  const [submitted, setSubmitted] = useState(false);

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
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            高中 → 大学数学衔接
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4">
            用真题和基础训练，补齐你的「高数底座」
          </p>
          <p className="text-lg text-primary-600 dark:text-primary-400 font-medium mb-8">
            你的私塾教练
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
            精选广东专升本 / 高数真题 + 关键基础知识，
            <br />
            用最少的时间，搞懂高数最常考、最容易掉分的那一部分。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={scrollToPapers}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              开始刷真题
            </button>
            <button
              onClick={scrollToPayment}
              className="px-8 py-3 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
            >
              了解如何升级 Pro
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>当前为内测版：</p>
            <p>✅ 真题、解析永久免费体验</p>
            <p>✅ 后续将增加「错题本、专项训练、进度统计」等 Pro 功能</p>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-20 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  从真题出发，而不是泛泛而谈
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  精选近几年广东专升本 / 高数相关真题，
                  所有题目都按「考点 + 难度」标注，
                  刷每一道题都知道：这道题在考什么、值不值得多花时间。
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  专门做「高中 → 大学」这一步
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  精力不再浪费在极难偏题上，
                  而是回到函数、方程、三角、排列组合、复数、参数方程这些
                  高数里一定会反复用到的基础模块。
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  做完就知道为什么对 / 为什么错
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  选择题、填空题即时判分，
                  附带「关键思路 + 易错点」解析，
                  不再只看到一个冷冰冰的标准答案。
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  后续 Pro 功能（内测招募中）
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  计划新增：
                  <br />• 自动错题本
                  <br />• 按章节 / 知识点的专项训练
                  <br />• 学习进度与薄弱环节统计
                  <br />
                  如果你愿意为这类功能付费支持，可以在页面底部留下联系方式。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Exam Papers Section */}
        <section id="papers-section" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              选择一套真题，开始练习
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
              当前内测版本已收录部分广东专升本高数真题，
              <br />
              后续会持续更新更多年份与相近难度的题目。
            </p>

            <div className="space-y-4">
              {examPapers.map((paper) => (
                <div
                  key={paper.paperId}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {paper.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    共 {paper.totalQuestions} 题 · 选择 + 填空 + 解答 · 建议用时 {paper.suggestedTime} 分钟
                  </p>
                  <Link
                    href={`/practice/${paper.paperId}`}
                    className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    开始练习
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Intent Section */}
        <section id="payment-section" className="py-20 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
              想要更完整的功能？你可以决定这个产品的未来
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-8">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                目前你看到的是一个 <strong>内测版本</strong>：
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ✅ 真题刷题和基础解析永久免费
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                开发者正在考虑是否投入更多时间，做出一个真正好用的「高数衔接工具」
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                在决定之前，我想先确认一件事：
                <br />
                👉 是否真的有人愿意为它付费？
              </p>
            </div>

            {/* Pro Features */}
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                计划中的 Pro 功能包括（仍在设计中）：
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• 自动错题本：所有做错/标记的题自动收集，支持按章节/知识点二刷</li>
                <li>• 专项训练：按「章节 + 难度」刷题，集中攻克某一块</li>
                <li>• 学习进度统计：最近 7/30 天做题数、正确率趋势、薄弱环节分析</li>
                <li>• 真题不断更新：收录更多年份、更多地区的高数真题</li>
              </ul>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                预计价格区间：¥19 ~ ¥49，一次付费或短期冲刺卡。
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  问题 1：你是否愿意为这样的工具付费？
                </label>
                <div className="space-y-2">
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
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  问题 2（可选）：你能接受的大概价格范围是？
                </label>
                <div className="space-y-2">
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
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  问题 3：如果你愿意参与后续内测，可以留下联系方式：
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  如果愿意参与后续内测（优先体验新功能，给些反馈意见），
                  可以留下你的联系方式（微信号 / 邮箱）。
                  我会不定期发测试版和小礼物给内测用户 🙌
                </p>
                <input
                  type="text"
                  placeholder="微信号 / 邮箱（选填）"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                提交反馈
              </button>

              {submitted && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    ✅ 已收到，感谢你的反馈！
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">
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
