'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import MathText from '@/components/MathText';
import type { ConvertToChoiceRequest, ConvertToChoiceResult } from '@/types';
import { generateValidationReport } from '@/lib/assessment/choiceValidator';

export default function ConvertToolPage() {
  const [request, setRequest] = useState<ConvertToChoiceRequest>({
    stem: '已知 $y = \\ln(x + 1)$，则 $dy = $ ____',
    answer: '$\\frac{1}{x + 1} dx$',
    solution: '$dy = y\' dx = \\frac{1}{x + 1} dx$',
    knowledge: ['微分运算', '基本微分公式'],
  });

  const [result, setResult] = useState<ConvertToChoiceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/convert-to-choice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '转换失败');
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const validation = result ? generateValidationReport(result) : null;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            填空题转选择题工具
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：输入 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                输入填空题
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    题干 *
                  </label>
                  <textarea
                    value={request.stem}
                    onChange={(e) =>
                      setRequest({ ...request, stem: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="例如：已知 y = ln(x + 1)，则 dy = ____"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    答案 *
                  </label>
                  <input
                    type="text"
                    value={request.answer}
                    onChange={(e) =>
                      setRequest({ ...request, answer: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="例如：1/(x+1) dx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    解析（可选）
                  </label>
                  <textarea
                    value={request.solution || ''}
                    onChange={(e) =>
                      setRequest({ ...request, solution: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="例如：dy = y' dx = 1/(x+1) dx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    知识点（可选，用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={request.knowledge?.join(', ') || ''}
                    onChange={(e) =>
                      setRequest({
                        ...request,
                        knowledge: e.target.value
                          .split(',')
                          .map((k) => k.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                    placeholder="例如：微分运算, 基本微分公式"
                  />
                </div>

                <button
                  onClick={handleConvert}
                  disabled={loading || !request.stem || !request.answer}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '转换中...' : '转换为选择题'}
                </button>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：输出 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                转换结果
              </h2>

              {!result && !loading && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                  填写左侧信息后点击"转换为选择题"
                </p>
              )}

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* 题干 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      题干
                    </h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <MathText content={result.stem} />
                    </div>
                  </div>

                  {/* 选项 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      选项
                    </h3>
                    <div className="space-y-2">
                      {result.options.map((option) => (
                        <div
                          key={option.key}
                          className={`p-3 rounded-lg border-2 ${
                            option.key === result.correct_key
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                          }`}
                        >
                          <div className="flex items-start">
                            <span className="font-semibold mr-2">
                              {option.key}.
                            </span>
                            <div className="flex-1">
                              <MathText content={option.text} />
                              {option.error_type && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                  错误类型：{option.error_type}
                                </p>
                              )}
                            </div>
                            {option.key === result.correct_key && (
                              <span className="ml-2 text-green-600 dark:text-green-400 font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 验证报告 */}
                  {validation && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        验证报告
                      </h3>
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          validation.valid
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        }`}
                      >
                        <p className="font-semibold mb-2">
                          {validation.valid ? '✓ 验证通过' : '⚠ 存在问题'}
                        </p>
                        {validation.errors.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">
                              错误：
                            </p>
                            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
                              {validation.errors.map((err, idx) => (
                                <li key={idx}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {validation.warnings.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                              警告：
                            </p>
                            <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400">
                              {validation.warnings.map((warn, idx) => (
                                <li key={idx}>{warn}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 唯一性检查 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      唯一性检查策略
                    </h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                      <p className="text-gray-700 dark:text-gray-300">
                        {result.uniqueness_check.strategy}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

