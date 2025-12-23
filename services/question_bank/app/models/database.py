"""
数据库模型定义
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class Paper(Base):
    """试卷表"""
    __tablename__ = "papers"
    
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False, index=True)
    province = Column(String(50), nullable=False, index=True)
    subject = Column(String(100), nullable=False)
    exam_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联
    sections = relationship("Section", back_populates="paper", cascade="all, delete-orphan")


class Section(Base):
    """章节表"""
    __tablename__ = "sections"
    
    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    section_number = Column(String(10), nullable=False)  # 一、二、三
    section_name = Column(String(100), nullable=False)  # 单项选择题、填空题等
    order_index = Column(Integer, nullable=False)  # 排序
    
    # 关联
    paper = relationship("Paper", back_populates="sections")
    questions = relationship("Question", back_populates="section", cascade="all, delete-orphan")


class Question(Base):
    """题目表"""
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    question_number = Column(Integer, nullable=False)  # 题号
    content = Column(Text, nullable=False)  # 题目内容（Markdown格式）
    answer = Column(Text, nullable=True)  # 答案和解析（Markdown格式）
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关联
    section = relationship("Section", back_populates="questions")
    images = relationship("QuestionImage", back_populates="question", cascade="all, delete-orphan")


class QuestionImage(Base):
    """题目图片表"""
    __tablename__ = "question_images"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    alt_text = Column(String(200), nullable=True)
    url = Column(Text, nullable=False)
    position = Column(String(50), default="inline")  # inline, after, etc.
    caption = Column(String(200), nullable=True)  # 图片说明
    question_ref = Column(Integer, nullable=True)  # 关联题号
    
    # 关联
    question = relationship("Question", back_populates="images")


