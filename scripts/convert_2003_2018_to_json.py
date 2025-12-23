#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将2003-2018年的Markdown文件转换为JSON格式
保留图片信息
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict, Any

def extract_images(content: str) -> tuple:
    """提取内容中的图片并返回处理后的内容和图片列表"""
    images = []
    image_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    
    matches = re.finditer(image_pattern, content)
    for match in matches:
        images.append({
            "alt_text": match.group(1),
            "url": match.group(2),
            "position": "inline"
        })
    
    return content, images

def parse_markdown_file(file_path: Path, year: int) -> Dict[str, Any]:
    """解析单个Markdown文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    
    sections = []
    current_section = None
    current_question = None
    question_content_lines = []
    in_answer_section = False
    
    # 用于存储所有问题，方便答案匹配
    all_questions = {}
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # 跳过文件标题行
        if i < 5 and (line.startswith('#') or not line):
            i += 1
            continue
        
        # 检测章节标题（一、二、三、四等）
        section_match = re.match(r'^#?\s*([一二三四五六七八九十]+)[、\.\s]?\s*(.+?)(?:（|\(|$)', line)
        if section_match:
            # 保存上一个问题
            if current_question and question_content_lines:
                content_str = '\n'.join(question_content_lines).strip()
                content_str, imgs = extract_images(content_str)
                current_question['content'] = content_str
                current_question['images'].extend(imgs)
                question_content_lines = []
            
            # 保存上一个章节
            if current_section and not in_answer_section:
                sections.append(current_section)
            
            section_name = section_match.group(2).strip()
            
            # 判断是否进入答案部分
            if '答案' in section_name or '解析' in section_name or '参考答案' in section_name:
                in_answer_section = True
                i += 1
                continue
            else:
                in_answer_section = False
            
            current_section = {
                "section_number": section_match.group(1),
                "section_name": section_name,
                "questions": []
            }
            current_question = None
            i += 1
            continue
        
        # 检测题号
        question_match = re.match(r'^(\d+)[\.、\s](.*)$', line)
        if question_match:
            # 保存上一个问题
            if current_question and question_content_lines:
                content_str = '\n'.join(question_content_lines).strip()
                content_str, imgs = extract_images(content_str)
                if in_answer_section:
                    # 答案部分
                    q_num = current_question['question_number']
                    if q_num in all_questions:
                        all_questions[q_num]['answer'] = content_str
                else:
                    # 问题部分
                    current_question['content'] = content_str
                    current_question['images'].extend(imgs)
                question_content_lines = []
            
            question_num = int(question_match.group(1))
            question_text = question_match.group(2).strip()
            
            if in_answer_section:
                # 答案部分
                current_question = {'question_number': question_num}
                if question_text:
                    question_content_lines.append(question_text)
            else:
                # 问题部分
                current_question = {
                    "question_number": question_num,
                    "content": "",
                    "answer": "",
                    "images": []
                }
                current_section['questions'].append(current_question)
                all_questions[question_num] = current_question
                if question_text:
                    question_content_lines.append(question_text)
            
            i += 1
            continue
        
        # 普通内容行
        if line and current_question:
            question_content_lines.append(line)
        
        i += 1
    
    # 保存最后一个问题
    if current_question and question_content_lines:
        content_str = '\n'.join(question_content_lines).strip()
        content_str, imgs = extract_images(content_str)
        if in_answer_section:
            q_num = current_question['question_number']
            if q_num in all_questions:
                all_questions[q_num]['answer'] = content_str
        else:
            current_question['content'] = content_str
            current_question['images'].extend(imgs)
    
    # 保存最后一个章节
    if current_section and not in_answer_section:
        sections.append(current_section)
    
    # 统计信息
    total_questions = sum(len(section['questions']) for section in sections)
    total_images = sum(
        len(q['images']) 
        for section in sections 
        for q in section['questions']
    )
    
    return {
        "meta": {
            "province": "广东省",
            "subject": "高等数学",
            "year": year,
            "exam_type": "专升本",
            "total_sections": len(sections),
            "total_questions": total_questions,
            "total_images": total_images
        },
        "paper": {
            "year": year,
            "province": "广东省",
            "subject": "高等数学",
            "exam_type": "专升本",
            "sections": sections
        }
    }

def convert_directory():
    """转换整个目录"""
    input_dir = Path("/Users/zengchanghuan/Documents/广东专升本真题/2003-2018")
    output_dir = Path("/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/public/papers")
    
    # 确保输出目录存在
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 获取所有MD文件
    md_files = sorted(input_dir.glob("*.md"))
    
    print(f"📂 找到 {len(md_files)} 个Markdown文件\n")
    
    success_count = 0
    for md_file in md_files:
        # 提取年份
        year_match = re.search(r'(\d{4})年', md_file.name)
        if not year_match:
            print(f"⚠️  跳过 {md_file.name}：无法提取年份")
            continue
        
        year = int(year_match.group(1))
        
        try:
            print(f"📄 处理 {year}年...")
            
            # 解析文件
            data = parse_markdown_file(md_file, year)
            
            # 保存JSON
            output_file = output_dir / f"广东_高数_{year}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"   ✅ 成功: {data['meta']['total_questions']}题, {data['meta']['total_images']}图")
            print(f"   💾 保存至: {output_file.name}\n")
            
            success_count += 1
            
        except Exception as e:
            print(f"   ❌ 失败: {e}\n")
    
    print("=" * 60)
    print(f"✅ 转换完成！成功: {success_count}/{len(md_files)}")
    print("=" * 60)

if __name__ == '__main__':
    convert_directory()

