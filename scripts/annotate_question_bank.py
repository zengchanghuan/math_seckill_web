#!/usr/bin/env python3
"""
题库标注脚本：批量标注题目元数据并写回JSON
使用方式：python scripts/annotate_question_bank.py --year 2024
"""

import json
import os
import sys
from pathlib import Path
import requests
import time

# API配置
API_BASE = "http://localhost:3000/api/question-bank"

def load_paper_json(year: int) -> dict:
    """加载题库JSON"""
    json_path = f"public/papers/广东_高数_{year}.json"
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"找不到题库文件: {json_path}")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_paper_json(year: int, data: dict):
    """保存题库JSON"""
    json_path = f"public/papers/广东_高数_{year}.json"
    
    # 备份原文件
    backup_path = f"public/papers/广东_高数_{year}.backup.json"
    if os.path.exists(json_path):
        os.rename(json_path, backup_path)
        print(f"[Backup] 已备份原文件到: {backup_path}")
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"[Save] 已保存到: {json_path}")

def annotate_paper(year: int, batch_size: int = 5):
    """标注整个试卷"""
    print(f"[Annotate] 开始标注 {year} 年题库")
    
    # 1. 加载JSON
    data = load_paper_json(year)
    print(f"[Load] 加载完成，共 {data['meta']['total_questions']} 道题")
    
    # 2. 构建标注请求
    requests_list = []
    for section in data['paper']['sections']:
        for q in section['questions']:
            # 跳过已标注的题目
            if 'metadata' in q and q['metadata']:
                print(f"[Skip] 题目 {q['question_num']} 已标注")
                continue
            
            requests_list.append({
                'questionNum': q['question_num'],
                'content': q['content'],
                'answer': q['answer'],
                'sectionName': section['section_name']
            })
    
    if not requests_list:
        print("[Done] 所有题目已标注完成")
        return
    
    print(f"[Annotate] 待标注题目数: {len(requests_list)}")
    
    # 3. 分批标注
    all_metadata = []
    for i in range(0, len(requests_list), batch_size):
        batch = requests_list[i:i+batch_size]
        print(f"\n[Batch] 标注 {i+1}-{min(i+batch_size, len(requests_list))} / {len(requests_list)}")
        
        try:
            response = requests.post(
                f"{API_BASE}/annotate",
                json={
                    'mode': 'batch',
                    'questions': batch,
                    'meta': {
                        'year': year,
                        'province': '广东'
                    }
                },
                timeout=300  # 5分钟超时
            )
            
            if response.status_code == 200:
                result = response.json()
                if result['success']:
                    batch_metadata = result['metadata']
                    all_metadata.extend(batch_metadata)
                    
                    print(f"[Success] 本批标注完成:")
                    print(f"  - 成功: {len(batch_metadata)} 题")
                    print(f"  - 需复审: {result['stats']['needsReview']} 题")
                    print(f"  - 平均置信度: {result['stats']['avgConfidence']:.2f}")
                else:
                    print(f"[Error] {result.get('error')}")
            else:
                print(f"[Error] HTTP {response.status_code}")
        
        except Exception as e:
            print(f"[Error] 标注失败: {e}")
            # 继续下一批
        
        # 批次间延迟
        if i + batch_size < len(requests_list):
            time.sleep(2)
    
    # 4. 写回JSON
    if not all_metadata:
        print("[Error] 没有成功标注任何题目")
        return
    
    print(f"\n[Merge] 合并元数据到JSON...")
    metadata_index = 0
    
    for section in data['paper']['sections']:
        for q in section['questions']:
            if 'metadata' not in q or not q['metadata']:
                if metadata_index < len(all_metadata):
                    q['metadata'] = all_metadata[metadata_index]
                    metadata_index += 1
    
    # 更新meta
    data['meta']['annotated_at'] = int(time.time() * 1000)
    data['meta']['annotation_version'] = 1
    
    # 5. 保存
    save_paper_json(year, data)
    
    # 6. 统计
    needs_review = sum(1 for m in all_metadata if m['needsReview'])
    print(f"\n[Done] 标注完成:")
    print(f"  - 总题数: {len(all_metadata)}")
    print(f"  - 需复审: {needs_review}")
    print(f"  - 复审率: {needs_review/len(all_metadata)*100:.1f}%")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='批量标注题库元数据')
    parser.add_argument('--year', type=int, required=True, help='年份')
    parser.add_argument('--batch-size', type=int, default=5, help='每批标注题数')
    
    args = parser.parse_args()
    
    try:
        annotate_paper(args.year, args.batch_size)
    except Exception as e:
        print(f"[Fatal] {e}", file=sys.stderr)
        sys.exit(1)

