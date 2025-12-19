"""
题库管理 API 路由
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.database import Paper, Section, Question, QuestionImage
from app.models.schemas import (
    PaperSummary, PaperDetail, QuestionDetail, StatsResponse
)

router = APIRouter(prefix="/api", tags=["questions"])


@router.get("/papers/stats", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """获取题库统计信息"""
    papers = db.query(Paper).all()
    questions = db.query(Question).all()
    images = db.query(QuestionImage).all()
    
    years = [p.year for p in papers]
    provinces = list(set(p.province for p in papers))
    subjects = list(set(p.subject for p in papers))
    
    return StatsResponse(
        total_papers=len(papers),
        total_questions=len(questions),
        total_images=len(images),
        year_range={
            "start": min(years) if years else 0,
            "end": max(years) if years else 0
        },
        provinces=provinces,
        subjects=subjects
    )


@router.get("/papers", response_model=List[PaperSummary])
async def get_papers(
    province: Optional[str] = Query(None, description="省份筛选"),
    subject: Optional[str] = Query(None, description="科目筛选"),
    year: Optional[int] = Query(None, description="年份筛选"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """获取试卷列表"""
    query = db.query(Paper)
    
    if province:
        query = query.filter(Paper.province == province)
    if subject:
        query = query.filter(Paper.subject == subject)
    if year:
        query = query.filter(Paper.year == year)
    
    papers = query.order_by(Paper.year.desc()).offset(skip).limit(limit).all()
    
    # 计算统计信息
    result = []
    for paper in papers:
        sections_count = len(paper.sections)
        questions_count = sum(len(section.questions) for section in paper.sections)
        images_count = sum(
            len(question.images) 
            for section in paper.sections 
            for question in section.questions
        )
        
        paper_summary = PaperSummary(
            id=paper.id,
            year=paper.year,
            province=paper.province,
            subject=paper.subject,
            exam_type=paper.exam_type,
            total_sections=sections_count,
            total_questions=questions_count,
            total_images=images_count,
            created_at=paper.created_at
        )
        result.append(paper_summary)
    
    return result


@router.get("/papers/{year}", response_model=PaperDetail)
async def get_paper_by_year(
    year: int,
    province: str = Query("广东", description="省份"),
    subject: str = Query("高等数学", description="科目"),
    db: Session = Depends(get_db)
):
    """获取指定年份的试卷详情"""
    paper = db.query(Paper).filter(
        Paper.year == year,
        Paper.province == province,
        Paper.subject == subject
    ).first()
    
    if not paper:
        raise HTTPException(status_code=404, detail=f"未找到{year}年{province}{subject}试卷")
    
    return paper


@router.get("/questions/{question_id}", response_model=QuestionDetail)
async def get_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    """获取题目详情"""
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="题目不存在")
    
    return QuestionDetail(
        id=question.id,
        question_number=question.question_number,
        content=question.content,
        answer=question.answer,
        section_name=question.section.section_name,
        images=[
            {
                "alt_text": img.alt_text,
                "url": img.url,
                "position": img.position,
                "caption": img.caption,
                "question_ref": img.question_ref
            }
            for img in question.images
        ]
    )


@router.get("/questions", response_model=List[QuestionDetail])
async def search_questions(
    year: Optional[int] = Query(None, description="年份"),
    section_name: Optional[str] = Query(None, description="章节名称"),
    keyword: Optional[str] = Query(None, description="关键词搜索"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """搜索题目"""
    query = db.query(Question).join(Section).join(Paper)
    
    if year:
        query = query.filter(Paper.year == year)
    if section_name:
        query = query.filter(Section.section_name.contains(section_name))
    if keyword:
        query = query.filter(Question.content.contains(keyword))
    
    questions = query.offset(skip).limit(limit).all()
    
    return [
        QuestionDetail(
            id=q.id,
            question_number=q.question_number,
            content=q.content,
            answer=q.answer,
            section_name=q.section.section_name,
            images=[
                {
                    "alt_text": img.alt_text,
                    "url": img.url,
                    "position": img.position,
                    "caption": img.caption,
                    "question_ref": img.question_ref
                }
                for img in q.images
            ]
        )
        for q in questions
    ]

