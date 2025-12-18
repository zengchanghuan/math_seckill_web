import { create } from 'zustand';
import type { AppConfig } from '@/types';

interface AppState {
  config: AppConfig;
  setStudentId: (studentId: string) => void;
  setServerUrl: (url: string) => void;
  setOfflineMode: (isOffline: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const defaultConfig: AppConfig = {
  studentId: 'student_001',
  serverUrl: 'http://localhost:8000',
  isOfflineMode: false,
  theme: 'light',
};

// 从 localStorage 加载配置
const loadConfig = (): AppConfig => {
  if (typeof window === 'undefined') {
    return defaultConfig;
  }
  try {
    const stored = localStorage.getItem('math-seckill-config');
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading config from localStorage:', error);
  }
  return defaultConfig;
};

// 保存配置到 localStorage
const saveConfig = (config: AppConfig) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('math-seckill-config', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config to localStorage:', error);
    }
  }
};

export const useAppStore = create<AppState>()((set) => {
  const initialConfig = loadConfig();

  // 同步到 API 客户端
  if (typeof window !== 'undefined') {
    const { apiClient } = require('@/lib/api/client');
    apiClient.setBaseUrl(initialConfig.serverUrl);
    apiClient.setStudentId(initialConfig.studentId);
  }

  return {
    config: initialConfig,
    setStudentId: (studentId) =>
      set((state) => {
        const newConfig = { ...state.config, studentId };
        saveConfig(newConfig);
        if (typeof window !== 'undefined') {
          const { apiClient } = require('@/lib/api/client');
          apiClient.setStudentId(studentId);
        }
        return { config: newConfig };
      }),
    setServerUrl: (serverUrl) =>
      set((state) => {
        const newConfig = { ...state.config, serverUrl };
        saveConfig(newConfig);
        if (typeof window !== 'undefined') {
          const { apiClient } = require('@/lib/api/client');
          apiClient.setBaseUrl(serverUrl);
        }
        return { config: newConfig };
      }),
    setOfflineMode: (isOfflineMode) =>
      set((state) => {
        const newConfig = { ...state.config, isOfflineMode };
        saveConfig(newConfig);
        return { config: newConfig };
      }),
    setTheme: (theme) =>
      set((state) => {
        const newConfig = { ...state.config, theme };
        saveConfig(newConfig);
        return { config: newConfig };
      }),
  };
});
