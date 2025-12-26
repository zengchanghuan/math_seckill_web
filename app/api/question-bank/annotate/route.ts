/**
 * API路由：题目元数据标注
 * POST /api/question-bank/annotate
 */

import { NextRequest, NextResponse } from 'next/server';
import { annotateQuestion, batchAnnotateQuestions } from '@/lib/questionBank/annotationService';
import { generateQuestionId } from '@/lib/questionBank/conceptTags';
import type { AnnotationRequest } from '@/lib/questionBank/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, questions, meta } = body;

    // 单题标注
    if (mode === 'single') {
      const req: AnnotationRequest = questions[0];
      const metadata = await annotateQuestion(req);
      
      // 生成questionId
      metadata.questionId = generateQuestionId(
        meta.province || '广东',
        meta.year,
        1,
        req.questionNum
      );

      return NextResponse.json({
        success: true,
        metadata,
      });
    }

    // 批量标注
    if (mode === 'batch') {
      const requests: AnnotationRequest[] = questions;
      const metadataList = await batchAnnotateQuestions(requests);

      // 为每个元数据生成questionId
      metadataList.forEach((metadata, index) => {
        metadata.questionId = generateQuestionId(
          meta.province || '广东',
          meta.year,
          1,
          requests[index].questionNum
        );
      });

      return NextResponse.json({
        success: true,
        metadata: metadataList,
        stats: {
          total: metadataList.length,
          needsReview: metadataList.filter((m) => m.needsReview).length,
          avgConfidence:
            metadataList.reduce((sum, m) => sum + m.confidence, 0) /
            metadataList.length,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API] 标注失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Annotation failed',
      },
      { status: 500 }
    );
  }
}



