"""
Pydantic 模型定义（用于 API 请求/响应）
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ImageSchema(BaseModel):
    """图片信息"""
    alt_text: Optional[str] = None
    url: str
    position: str = "inline"
    caption: Optional[str] = None
    question_ref: Optional[int] = None


class QuestionBase(BaseModel):
    """题目基础信息"""
    question_number: int
    content: str
    answer: Optional[str] = None


class QuestionDetail(QuestionBase):
    """题目详细信息"""
    id: int
    section_name: str
    images: List[ImageSchema] = []
    
    class Config:
        from_attributes = True


class SectionBase(BaseModel):
    """章节基础信息"""
    section_number: str
    section_name: str
    questions: List[QuestionBase] = []


class SectionDetail(BaseModel):
    """章节详细信息"""
    id: int
    section_number: str
    section_name: str
    questions: List[QuestionBase] = []  # 使用QuestionBase避免循环引用
    
    class Config:
        from_attributes = True


class PaperBase(BaseModel):
    """试卷基础信息"""
    year: int
    province: str
    subject: str
    exam_type: str


class PaperSummary(PaperBase):
    """试卷摘要信息"""
    id: int
    total_sections: int = 0
    total_questions: int = 0
    total_images: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaperDetail(PaperBase):
    """试卷详细信息"""
    id: int
    sections: List[SectionDetail] = []
    created_at: datetime
    
    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    """统计信息响应"""
    total_papers: int
    total_questions: int
    total_images: int
    year_range: dict
    provinces: List[str]
    subjects: List[str]


class ImportRequest(BaseModel):
    """导入请求"""
    data_path: str = Field(..., description="JSON数据文件路径")
    overwrite: bool = Field(default=False, description="是否覆盖已存在的数据")


class ImportResponse(BaseModel):
    """导入响应"""
    success: bool
    message: str
    papers_imported: int
    questions_imported: int
    images_imported: int

