'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAppStore } from '@/lib/store/appStore';
import { apiClient } from '@/lib/api/client';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { config, setStudentId, setServerUrl, setOfflineMode, setTheme } =
    useAppStore();
  const [studentIdInput, setStudentIdInput] = useState(config.studentId);
  const [serverUrlInput, setServerUrlInput] = useState(config.serverUrl);
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'checking' | 'success' | 'error'
  >('idle');

  useEffect(() => {
    setStudentIdInput(config.studentId);
    setServerUrlInput(config.serverUrl);
  }, [config]);

  const handleTestConnection = async () => {
    setConnectionStatus('checking');
    try {
      const originalUrl = apiClient['baseUrl'];
      apiClient.setBaseUrl(serverUrlInput);
      const isConnected = await apiClient.healthCheck();
      if (isConnected) {
        setConnectionStatus('success');
        setServerUrl(serverUrlInput);
      } else {
        setConnectionStatus('error');
        apiClient.setBaseUrl(originalUrl);
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const handleSaveStudentId = () => {
    setStudentId(studentIdInput);
    apiClient.setStudentId(studentIdInput);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          设置
        </h1>

        {/* 用户设置 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            用户设置
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                学生ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="student_001"
                />
                <button
                  onClick={handleSaveStudentId}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 服务器配置 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            服务器配置
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                服务器地址
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="http://localhost:8000"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={connectionStatus === 'checking'}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {connectionStatus === 'checking' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>测试中...</span>
                    </>
                  ) : connectionStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>连接成功</span>
                    </>
                  ) : connectionStatus === 'error' ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>连接失败</span>
                    </>
                  ) : (
                    <span>测试连接</span>
                  )}
                </button>
              </div>
              {connectionStatus === 'success' && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  服务器连接正常
                </p>
              )}
              {connectionStatus === 'error' && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  无法连接到服务器，请检查地址是否正确
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 应用设置 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            应用设置
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  离线模式
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  使用本地题目数据，无需连接服务器
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isOfflineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  深色模式
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  切换浅色/深色主题
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.theme === 'dark'}
                  onChange={(e) =>
                    setTheme(e.target.checked ? 'dark' : 'light')
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 当前配置信息 */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            当前配置
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">学生ID：</span>
              <span className="text-gray-900 dark:text-white font-mono">
                {config.studentId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                服务器地址：
              </span>
              <span className="text-gray-900 dark:text-white font-mono">
                {config.serverUrl}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                离线模式：
              </span>
              <span className="text-gray-900 dark:text-white">
                {config.isOfflineMode ? '开启' : '关闭'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">主题：</span>
              <span className="text-gray-900 dark:text-white">
                {config.theme === 'dark' ? '深色' : '浅色'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
