"""
管理员 API 路由（数据导入等）
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from pathlib import Path
from app.database import get_db
from app.models.database import Paper, Section, Question, QuestionImage
from app.models.schemas import ImportRequest, ImportResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/import", response_model=ImportResponse)
async def import_data(
    request: ImportRequest,
    db: Session = Depends(get_db)
):
    """导入题库数据"""
    try:
        # 读取JSON文件
        data_path = Path(request.data_path)
        if not data_path.exists():
            raise HTTPException(status_code=404, detail=f"数据文件不存在: {request.data_path}")
        
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        papers_imported = 0
        questions_imported = 0
        images_imported = 0
        
        # 遍历所有试卷
        for paper_data in data.get('papers', []):
            year = paper_data['year']
            province = paper_data['province']
            subject = paper_data['subject']
            
            # 检查是否已存在
            existing_paper = db.query(Paper).filter(
                Paper.year == year,
                Paper.province == province,
                Paper.subject == subject
            ).first()
            
            if existing_paper and not request.overwrite:
                print(f"跳过已存在的试卷: {year}年{province}{subject}")
                continue
            elif existing_paper and request.overwrite:
                # 删除旧数据（级联删除相关数据）
                db.delete(existing_paper)
                db.commit()
            
            # 创建试卷
            paper = Paper(
                year=year,
                province=province,
                subject=subject,
                exam_type=paper_data.get('exam_type', '专升本')
            )
            db.add(paper)
            db.flush()  # 获取paper.id
            papers_imported += 1
            
            # 创建章节和题目
            for idx, section_data in enumerate(paper_data.get('sections', [])):
                section = Section(
                    paper_id=paper.id,
                    section_number=section_data['section_number'],
                    section_name=section_data['section_name'],
                    order_index=idx
                )
                db.add(section)
                db.flush()  # 获取section.id
                
                # 创建题目
                for question_data in section_data.get('questions', []):
                    question = Question(
                        section_id=section.id,
                        question_number=question_data['question_number'],
                        content=question_data.get('content', ''),
                        answer=question_data.get('answer', None)
                    )
                    db.add(question)
                    db.flush()  # 获取question.id
                    questions_imported += 1
                    
                    # 创建图片记录
                    for image_data in question_data.get('images', []):
                        image = QuestionImage(
                            question_id=question.id,
                            alt_text=image_data.get('alt_text'),
                            url=image_data['url'],
                            position=image_data.get('position', 'inline'),
                            caption=image_data.get('caption'),
                            question_ref=image_data.get('question_ref')
                        )
                        db.add(image)
                        images_imported += 1
        
        db.commit()
        
        return ImportResponse(
            success=True,
            message=f"成功导入数据",
            papers_imported=papers_imported,
            questions_imported=questions_imported,
            images_imported=images_imported
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"导入失败: {str(e)}")


@router.delete("/papers/{year}")
async def delete_paper(
    year: int,
    province: str = "广东",
    subject: str = "高等数学",
    db: Session = Depends(get_db)
):
    """删除指定年份的试卷"""
    paper = db.query(Paper).filter(
        Paper.year == year,
        Paper.province == province,
        Paper.subject == subject
    ).first()
    
    if not paper:
        raise HTTPException(status_code=404, detail=f"未找到{year}年{province}{subject}试卷")
    
    db.delete(paper)
    db.commit()
    
    return {"success": True, "message": f"已删除{year}年{province}{subject}试卷"}


@router.post("/reset")
async def reset_database(
    confirm: bool = False,
    db: Session = Depends(get_db)
):
    """重置数据库（危险操作）"""
    if not confirm:
        raise HTTPException(status_code=400, detail="需要确认操作")
    
    try:
        # 删除所有数据
        db.query(QuestionImage).delete()
        db.query(Question).delete()
        db.query(Section).delete()
        db.query(Paper).delete()
        db.commit()
        
        return {"success": True, "message": "数据库已重置"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"重置失败: {str(e)}")




