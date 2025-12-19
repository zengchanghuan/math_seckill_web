#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将广东专升本真题Markdown文件转换为JSON格式
保留图片信息，添加省份和年份标签
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict, Any


def extract_year_from_filename(filename: str) -> int:
    """从文件名中提取年份"""
    match = re.search(r'(\d{4})年', filename)
    if match:
        return int(match.group(1))
    return 0


def parse_markdown_content(content: str, year: int) -> Dict[str, Any]:
    """解析Markdown内容，提取题目、答案和图片"""
    lines = content.split('\n')
    
    paper_data = {
        "province": "广东",
        "subject": "高等数学",
        "year": year,
        "exam_type": "专升本" if year < 2021 else "普通专升本",
        "sections": []
    }
    
    current_section = None
    current_question = None
    current_content = []
    in_answer_section = False
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        # 检测章节标题（一、二、三、四等）
        section_match = re.match(r'^#?\s*([一二三四五六七八九十]+)[、\s]*(.+?)[:：]?[\(（]?.*?[\)）]?$', line)
        if section_match:
            # 保存上一个问题
            if current_question and current_content:
                current_question['content'] = '\n'.join(current_content).strip()
                current_content = []
            
            # 保存上一个章节
            if current_section:
                paper_data['sections'].append(current_section)
            
            section_name = section_match.group(2).strip()
            
            # 判断是否进入答案部分
            if '答案' in section_name or '解析' in section_name:
                in_answer_section = True
            
            current_section = {
                "section_number": section_match.group(1),
                "section_name": section_name,
                "questions": []
            }
            current_question = None
            continue
        
        # 检测题号（数字开头，后跟.或、）
        question_match = re.match(r'^(\d+)[\.、\s]', line)
        if question_match and current_section:
            # 保存上一个问题
            if current_question and current_content:
                # 追加内容，而不是覆盖
                if current_question['content']:
                    current_question['content'] += '\n' + '\n'.join(current_content).strip()
                else:
                    current_question['content'] = '\n'.join(current_content).strip()
                current_content = []
            
            question_num = int(question_match.group(1))
            
            # 如果在答案区，查找对应的问题
            if in_answer_section:
                # 在之前的章节中查找对应题号的问题
                found = False
                for section in paper_data['sections']:
                    for q in section['questions']:
                        if q['question_number'] == question_num:
                            # 添加答案/解析到已有问题
                            if 'answer' not in q:
                                q['answer'] = ''
                            current_question = q
                            found = True
                            break
                    if found:
                        break
                
                if not found:
                    # 如果没找到对应问题，创建新问题（答案部分）
                    current_question = {
                        "question_number": question_num,
                        "content": "",
                        "answer": ""
                    }
                    current_section['questions'].append(current_question)
            else:
                # 题目部分，创建新问题
                current_question = {
                    "question_number": question_num,
                    "content": line[question_match.end():].strip(),
                    "images": []
                }
                current_section['questions'].append(current_question)
            
            continue
        
        # 检测图片
        image_match = re.search(r'!\[([^\]]*)\]\(([^)]+)\)', line)
        if image_match and current_question:
            image_info = {
                "alt_text": image_match.group(1),
                "url": image_match.group(2),
                "position": "inline"
            }
            
            # 检查下一行是否是图片说明
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                caption_match = re.match(r'^第\s*(\d+)\s*题图', next_line)
                if caption_match:
                    image_info['caption'] = next_line
                    image_info['question_ref'] = int(caption_match.group(1))
            
            if 'images' not in current_question:
                current_question['images'] = []
            current_question['images'].append(image_info)
            
            # 将图片标记也加入内容
            current_content.append(line)
            continue
        
        # 检测答案标记
        answer_match = re.match(r'^\[?答案\]?\s*[:：]?\s*(.+)$', line)
        if answer_match and current_question and in_answer_section:
            if 'answer' not in current_question:
                current_question['answer'] = ''
            current_question['answer'] += f"答案: {answer_match.group(1)}\n"
            continue
        
        # 检测精析标记
        analysis_match = re.match(r'^【?精析】?\s*(.*)$', line)
        if analysis_match and current_question and in_answer_section:
            if 'answer' not in current_question:
                current_question['answer'] = ''
            current_question['answer'] += f"精析: {analysis_match.group(1)}\n"
            current_content.append(line)
            continue
        
        # 普通内容行
        if line and current_question:
            current_content.append(line)
    
    # 保存最后一个问题和章节
    if current_question and current_content:
        if in_answer_section and 'answer' in current_question:
            current_question['answer'] += '\n'.join(current_content).strip()
        else:
            # 追加内容，而不是覆盖
            if current_question['content']:
                current_question['content'] += '\n' + '\n'.join(current_content).strip()
            else:
                current_question['content'] = '\n'.join(current_content).strip()
    
    if current_section:
        paper_data['sections'].append(current_section)
    
    return paper_data


def convert_directory_to_json(input_dir: str, output_file: str):
    """转换整个目录下的所有Markdown文件为JSON"""
    input_path = Path(input_dir)
    all_papers = []
    
    # 获取所有_clean.md文件并按年份排序
    md_files = sorted(input_path.glob("*_clean.md"), 
                     key=lambda f: extract_year_from_filename(f.name))
    
    print(f"找到 {len(md_files)} 个Markdown文件")
    
    for md_file in md_files:
        print(f"\n处理: {md_file.name}")
        year = extract_year_from_filename(md_file.name)
        
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            paper_data = parse_markdown_content(content, year)
            all_papers.append(paper_data)
            
            # 统计信息
            total_questions = sum(len(section['questions']) for section in paper_data['sections'])
            total_images = sum(
                len(q.get('images', [])) 
                for section in paper_data['sections'] 
                for q in section['questions']
            )
            print(f"  ✓ {year}年: {len(paper_data['sections'])}个章节, {total_questions}道题, {total_images}张图片")
            
        except Exception as e:
            print(f"  ✗ 处理失败: {e}")
    
    # 保存为JSON
    output_data = {
        "meta": {
            "province": "广东",
            "subject": "高等数学",
            "exam_type": "专升本",
            "year_range": {
                "start": min(p['year'] for p in all_papers) if all_papers else 0,
                "end": max(p['year'] for p in all_papers) if all_papers else 0
            },
            "total_papers": len(all_papers),
            "total_questions": sum(
                sum(len(section['questions']) for section in paper['sections'])
                for paper in all_papers
            ),
            "total_images": sum(
                sum(
                    len(q.get('images', [])) 
                    for section in paper['sections'] 
                    for q in section['questions']
                )
                for paper in all_papers
            )
        },
        "papers": all_papers
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n" + "="*60)
    print(f"转换完成！")
    print(f"输出文件: {output_file}")
    print(f"年份范围: {output_data['meta']['year_range']['start']}-{output_data['meta']['year_range']['end']}")
    print(f"试卷总数: {output_data['meta']['total_papers']}")
    print(f"题目总数: {output_data['meta']['total_questions']}")
    print(f"图片总数: {output_data['meta']['total_images']}")
    print("="*60)


if __name__ == '__main__':
    input_directory = "/Users/zengchanghuan/Documents/广东专升本真题/真题/广东省_高等数学_真题"
    # 输出到工作区目录
    output_json = "/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/data/广东省_高等数学_真题.json"
    
    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    
    convert_directory_to_json(input_directory, output_json)

