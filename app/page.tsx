import Layout from '@/components/Layout';
import Link from 'next/link';
import { BookOpen, Target, User, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* 欢迎区域 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            欢迎使用数学秒杀
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            智能刷题系统，个性化学习推荐
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/drill"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">刷题训练</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              按主题和难度筛选题目，进行针对性练习
            </p>
          </Link>

          <Link
            href="/recommendation"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">智能推荐</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              基于学习画像，个性化推荐最适合的题目
            </p>
          </Link>

          <Link
            href="/profile"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">学习画像</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              查看学习数据，了解掌握情况和薄弱点
            </p>
          </Link>
        </div>

        {/* 快速开始 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            快速开始
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>前往「设置」页面配置学生ID和服务器地址</li>
            <li>在「刷题」页面开始练习，系统会自动记录你的答题情况</li>
            <li>查看「学习画像」了解自己的掌握情况</li>
            <li>使用「智能推荐」获取个性化题目推荐</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
