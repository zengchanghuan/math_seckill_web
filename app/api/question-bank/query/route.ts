/**
 * API路由：题库查询
 * POST /api/question-bank/query
 */

import { NextRequest, NextResponse } from 'next/server';
import { questionBank } from '@/lib/questionBank/queryEngine';
import type {
  QuestionQueryParams,
  DayTrainingQueryParams,
} from '@/lib/questionBank/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, params } = body;

    // 通用查询
    if (mode === 'query') {
      const queryParams: QuestionQueryParams = params;
      const results = questionBank.query(queryParams);

      return NextResponse.json({
        success: true,
        questions: results,
        count: results.length,
      });
    }

    // Day训练抽题
    if (mode === 'day-training') {
      const dayParams: DayTrainingQueryParams = params;
      const results = questionBank.queryForDayTraining(dayParams);

      return NextResponse.json({
        success: true,
        questions: results,
        count: results.length,
      });
    }

    // 获取统计信息
    if (mode === 'stats') {
      const stats = questionBank.getStats();
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API] 查询失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Query failed',
      },
      { status: 500 }
    );
  }
}



