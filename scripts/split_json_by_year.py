#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将题库JSON文件按年份拆分成多个文件
命名格式：省份_高数_年号.json
"""

import json
import os
from pathlib import Path
from typing import Dict, Any


def split_json_by_year(input_file: str, output_dir: str):
    """按年份拆分JSON文件"""
    
    # 读取原始JSON文件
    print(f"📂 读取文件: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 创建输出目录
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"📊 总试卷数: {len(data['papers'])}")
    print(f"📁 输出目录: {output_dir}\n")
    
    # 按年份拆分
    for paper in data['papers']:
        year = paper['year']
        province = paper['province']
        subject = paper['subject']
        
        # 简化科目名称
        subject_short = "高数" if "高等数学" in subject else subject
        
        # 生成文件名：省份_高数_年号.json
        filename = f"{province}_{subject_short}_{year}.json"
        output_file = output_path / filename
        
        # 创建单个年份的数据结构
        year_data = {
            "meta": {
                "province": province,
                "subject": subject,
                "year": year,
                "exam_type": paper['exam_type'],
                "total_sections": len(paper['sections']),
                "total_questions": sum(len(s['questions']) for s in paper['sections']),
                "total_images": sum(
                    len(q.get('images', [])) 
                    for s in paper['sections'] 
                    for q in s['questions']
                )
            },
            "paper": paper
        }
        
        # 写入文件
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(year_data, f, ensure_ascii=False, indent=2)
        
        # 统计信息
        questions_count = year_data['meta']['total_questions']
        images_count = year_data['meta']['total_images']
        file_size = output_file.stat().st_size / 1024  # KB
        
        print(f"✓ {filename:30s} | {questions_count:3d}题 | {images_count:2d}图 | {file_size:6.1f}KB")
    
    print(f"\n{'='*70}")
    print(f"✅ 拆分完成！共生成 {len(data['papers'])} 个文件")
    print(f"{'='*70}")


def create_index_file(output_dir: str):
    """创建索引文件，列出所有年份文件"""
    output_path = Path(output_dir)
    
    # 获取所有JSON文件
    json_files = sorted(output_path.glob("*.json"), reverse=True)
    
    index_data = {
        "description": "广东专升本高等数学真题索引",
        "total_files": len(json_files),
        "files": []
    }
    
    for json_file in json_files:
        if json_file.name == 'index.json':
            continue
        # 读取文件元数据
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        meta = data.get('meta', data.get('paper', {}))
        index_data["files"].append({
            "filename": json_file.name,
            "year": meta.get('year', 0),
            "province": meta.get('province', ''),
            "subject": meta.get('subject', ''),
            "exam_type": meta.get('exam_type', ''),
            "total_questions": data['meta']['total_questions'] if 'meta' in data else sum(len(s['questions']) for s in data['paper']['sections']),
            "total_images": data['meta']['total_images'] if 'meta' in data else sum(len(q.get('images', [])) for s in data['paper']['sections'] for q in s['questions'])
        })
    
    # 写入索引文件
    index_file = output_path / "index.json"
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n📋 索引文件: {index_file}")
    return index_file


if __name__ == '__main__':
    # 输入和输出路径
    input_file = "/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/data/广东省_高等数学_真题.json"
    output_dir = "/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/data/papers"
    
    print("="*70)
    print("  📚 题库JSON文件按年份拆分")
    print("="*70)
    print()
    
    # 拆分文件
    split_json_by_year(input_file, output_dir)
    
    # 创建索引
    create_index_file(output_dir)
    
    print("\n✨ 所有文件已生成！")

