export type Paper2BankClientConfig = {
  baseUrl: string;
  apiKey?: string;
};

const LS_BASE_URL = 'paper2bank.teacherApiBaseUrl';
const LS_API_KEY = 'paper2bank.teacherApiKey';

export const DEFAULT_TEACHER_API_BASE_URL =
  process.env.NEXT_PUBLIC_TEACHER_API_BASE_URL || 'http://localhost:8000';

export function readClientConfig(): Paper2BankClientConfig {
  if (typeof window === 'undefined') {
    return { baseUrl: DEFAULT_TEACHER_API_BASE_URL };
  }
  const baseUrl = localStorage.getItem(LS_BASE_URL) || DEFAULT_TEACHER_API_BASE_URL;
  const apiKey = localStorage.getItem(LS_API_KEY) || undefined;
  return { baseUrl, apiKey };
}

export function writeClientConfig(next: Partial<Paper2BankClientConfig>) {
  if (typeof window === 'undefined') return;
  if (typeof next.baseUrl === 'string') localStorage.setItem(LS_BASE_URL, next.baseUrl);
  if (typeof next.apiKey === 'string') localStorage.setItem(LS_API_KEY, next.apiKey);
  if (next.apiKey === undefined) localStorage.removeItem(LS_API_KEY);
}




