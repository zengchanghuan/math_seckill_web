import axios, { AxiosInstance } from 'axios';
import type {
  Question,
  AnswerRecord,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  StudentProfile,
  RecommendationRequest,
  RecommendationResponse,
  QuestionStats,
  QuestionBankStats,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private studentId: string;

  constructor() {
    // 默认配置
    this.baseUrl = typeof window !== 'undefined'
      ? localStorage.getItem('serverUrl') || 'http://localhost:8000'
      : 'http://localhost:8000';

    this.studentId = typeof window !== 'undefined'
      ? localStorage.getItem('studentId') || 'student_001'
      : 'student_001';

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 可以在这里添加认证 token 等
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
    this.client.defaults.baseURL = url;
    if (typeof window !== 'undefined') {
      localStorage.setItem('serverUrl', url);
    }
  }

  setStudentId(studentId: string) {
    this.studentId = studentId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('studentId', studentId);
    }
  }

  getStudentId() {
    return this.studentId;
  }

  // ==================== 基础 ====================

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // ==================== 题库管理 ====================

  async getQuestionBankStats(): Promise<QuestionBankStats | null> {
    try {
      const response = await this.client.get<QuestionBankStats>('/api/questions/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting question bank stats:', error);
      return null;
    }
  }

  async getQuestion(questionId: string): Promise<Question | null> {
    try {
      const response = await this.client.get<Question>(`/api/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting question:', error);
      return null;
    }
  }

  async createQuestion(question: Question): Promise<Question | null> {
    try {
      const response = await this.client.post<Question>('/api/questions', question);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      return null;
    }
  }

  // ==================== 作答记录 ====================

  async submitAnswer(request: SubmitAnswerRequest): Promise<SubmitAnswerResponse | null> {
    try {
      const response = await this.client.post<SubmitAnswerResponse>(
        '/api/answers/submit',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      return null;
    }
  }

  async getStudentAnswers(studentId: string): Promise<AnswerRecord[]> {
    try {
      const response = await this.client.get<AnswerRecord[]>(
        `/api/answers/student/${studentId}`
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error getting student answers:', error);
      return [];
    }
  }

  // ==================== 学生画像 ====================

  async getStudentProfile(studentId: string): Promise<StudentProfile | null> {
    try {
      const response = await this.client.get<StudentProfile>(
        `/api/student/${studentId}/profile`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting student profile:', error);
      return null;
    }
  }

  // ==================== 个性化推荐 ====================

  async getRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse | null> {
    try {
      const response = await this.client.post<RecommendationResponse>(
        '/api/student/recommend',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return null;
    }
  }

  // ==================== 题目统计 ====================

  async getQuestionStats(questionId: string): Promise<QuestionStats | null> {
    try {
      const response = await this.client.get<QuestionStats>(
        `/api/admin/question/${questionId}/stats`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting question stats:', error);
      return null;
    }
  }
}

// 单例模式
export const apiClient = new ApiClient();
