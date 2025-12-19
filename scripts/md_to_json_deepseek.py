#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用 DeepSeek API 将 Markdown 试卷转换为结构化 JSON
保留所有图片信息
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, Any, List
import requests
from datetime import datetime


def extract_year_from_filename(filename: str) -> int:
    """从文件名中提取年份"""
    match = re.search(r'(\d{4})年', filename)
    if match:
        return int(match.group(1))
    return 0


def call_deepseek_api(markdown_content: str, year: int, api_key: str) -> Dict[str, Any]:
    """
    调用 DeepSeek API 将 Markdown 转换为结构化 JSON
    """
    
    system_prompt = """你是一个专业的试卷结构化解析助手。你需要将广东专升本高等数学试卷的 Markdown 格式转换为 JSON 格式。

**重要规则：**
1. 保留所有图片标记 ![alt](url)，不要丢失
2. 保留所有 LaTeX 公式（$...$ 和 $$...$$）
3. 题目内容（content）必须包含题干和所有选项（A/B/C/D）
4. 章节名称要完整（如"单项选择题"而不是"单"）
5. 答案和解析分开存储

**输出 JSON 格式：**
```json
{
  "province": "广东",
  "subject": "高等数学",
  "year": 2023,
  "exam_type": "专升本",
  "sections": [
    {
      "section_number": "一",
      "section_name": "单项选择题",
      "questions": [
        {
          "question_number": 1,
          "content": "题目内容（包含题干和选项A/B/C/D）",
          "answer": "答案内容",
          "images": [
            {
              "alt_text": "图片描述",
              "url": "图片URL",
              "position": "inline"
            }
          ]
        }
      ]
    }
  ]
}
```

直接返回 JSON，不要包含任何其他文字。"""

    user_prompt = f"""请将下面的试卷 Markdown 内容转换为结构化 JSON：

年份：{year}

Markdown内容：
{markdown_content}

请直接返回 JSON 格式的结果，确保：
1. 所有图片信息都保留
2. content字段包含完整的题目和选项
3. 章节名称完整
"""

    try:
        response = requests.post(
            'https://api.deepseek.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'deepseek-chat',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt}
                ],
                'temperature': 0.1,
                'max_tokens': 8192  # DeepSeek 限制
            },
            timeout=120
        )
        
        # 打印详细错误信息
        if response.status_code != 200:
            print(f"  ✗ API 返回状态码: {response.status_code}")
            print(f"  ✗ 错误详情: {response.text}")
        
        response.raise_for_status()
        result = response.json()
        
        # 提取返回的 JSON 内容
        content = result['choices'][0]['message']['content'].strip()
        
        # 移除可能的 markdown 代码块标记
        if content.startswith('```'):
            content = re.sub(r'^```(?:json)?\n', '', content)
            content = re.sub(r'\n```$', '', content)
        
        # 解析 JSON
        paper_data = json.loads(content)
        return paper_data
        
    except requests.exceptions.RequestException as e:
        print(f"  ✗ API 调用失败: {e}")
        raise
    except json.JSONDecodeError as e:
        print(f"  ✗ JSON 解析失败: {e}")
        print(f"  返回内容: {content[:200]}...")
        raise


def convert_markdown_files(input_dir: str, output_dir: str, api_key: str, target_years: List[int] = None):
    """
    转换目录下的所有 Markdown 文件
    每个文件生成一个独立的 JSON 文件
    
    Args:
        target_years: 指定要转换的年份列表，None表示转换所有年份
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 获取所有 _clean.md 文件
    all_md_files = list(input_path.glob("*_clean.md"))
    
    # 过滤指定年份
    if target_years:
        md_files = [f for f in all_md_files if extract_year_from_filename(f.name) in target_years]
        md_files = sorted(md_files, key=lambda f: extract_year_from_filename(f.name))
        print(f"🎯 目标年份: {target_years}")
    else:
        md_files = sorted(all_md_files, key=lambda f: extract_year_from_filename(f.name))
    
    print(f"📂 找到 {len(md_files)} 个 Markdown 文件")
    print(f"🤖 使用 DeepSeek API 进行结构化转换")
    print(f"📁 输出目录: {output_dir}\n")
    
    all_papers = []
    success_count = 0
    
    for md_file in md_files:
        year = extract_year_from_filename(md_file.name)
        print(f"\n{'='*70}")
        print(f"📄 处理: {md_file.name} ({year}年)")
        print(f"{'='*70}")
        
        try:
            # 读取 Markdown 文件
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            print(f"  📖 文件大小: {len(content)} 字符")
            
            # 调用 DeepSeek API
            print(f"  🤖 调用 DeepSeek API...")
            paper_data = call_deepseek_api(content, year, api_key)
            
            # 统计信息
            total_questions = sum(len(section['questions']) for section in paper_data['sections'])
            total_images = sum(
                len(q.get('images', [])) 
                for section in paper_data['sections'] 
                for q in section['questions']
            )
            
            # 生成输出文件名
            province = paper_data.get('province', '广东')
            filename = f"{province}_高数_{year}.json"
            output_file = output_path / filename
            
            # 保存 JSON 文件
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(paper_data, f, ensure_ascii=False, indent=2)
            
            file_size = output_file.stat().st_size / 1024  # KB
            
            print(f"  ✅ 成功转换")
            print(f"     - 章节: {len(paper_data['sections'])} 个")
            print(f"     - 题目: {total_questions} 道")
            print(f"     - 图片: {total_images} 张")
            print(f"     - 文件: {filename} ({file_size:.1f}KB)")
            
            all_papers.append(paper_data)
            success_count += 1
            
        except Exception as e:
            print(f"  ❌ 转换失败: {e}")
            continue
    
    # 生成索引文件
    print(f"\n{'='*70}")
    print(f"📋 生成索引文件...")
    print(f"{'='*70}")
    
    index_data = {
        "description": "广东专升本高等数学真题索引",
        "generated_at": datetime.now().isoformat(),
        "method": "DeepSeek API",
        "total_files": len(all_papers),
        "files": []
    }
    
    for paper in sorted(all_papers, key=lambda p: p['year'], reverse=True):
        total_questions = sum(len(s['questions']) for s in paper['sections'])
        total_images = sum(len(q.get('images', [])) for s in paper['sections'] for q in s['questions'])
        
        filename = f"{paper['province']}_高数_{paper['year']}.json"
        index_data["files"].append({
            "filename": filename,
            "year": paper['year'],
            "province": paper['province'],
            "subject": paper['subject'],
            "exam_type": paper['exam_type'],
            "total_sections": len(paper['sections']),
            "total_questions": total_questions,
            "total_images": total_images
        })
    
    index_file = output_path / "index.json"
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    print(f"  ✅ 索引文件: {index_file}")
    
    # 最终统计
    print(f"\n{'='*70}")
    print(f"🎉 转换完成！")
    print(f"{'='*70}")
    print(f"  成功: {success_count}/{len(md_files)} 个文件")
    print(f"  总题目: {sum(sum(len(s['questions']) for s in p['sections']) for p in all_papers)} 道")
    print(f"  总图片: {sum(sum(len(q.get('images', [])) for s in p['sections'] for q in s['questions']) for p in all_papers)} 张")
    print(f"{'='*70}\n")


if __name__ == '__main__':
    import sys
    
    # 配置
    input_directory = "/Users/zengchanghuan/Documents/广东专升本真题/真题/广东省_高等数学_真题"
    output_directory = "/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/data/papers"
    
    # 获取 API Key（优先从命令行参数，其次从环境变量）
    if len(sys.argv) > 1:
        api_key = sys.argv[1]
        print("✓ 使用命令行参数的 API Key")
    else:
        api_key = os.environ.get('DEEPSEEK_API_KEY')
        if api_key:
            print("✓ 使用环境变量 DEEPSEEK_API_KEY")
        else:
            # 尝试从 apps/paper2bank-v2/.env.local 读取
            env_file = Path(__file__).parent.parent / "apps/paper2bank-v2/.env.local"
            if env_file.exists():
                with open(env_file, 'r') as f:
                    for line in f:
                        if line.startswith('DEEPSEEK_API_KEY='):
                            api_key = line.split('=', 1)[1].strip().strip('"\'')
                            print(f"✓ 使用 .env.local 中的 API Key")
                            break
    
    if not api_key:
        print("\n❌ 错误: 未找到 DEEPSEEK_API_KEY")
        print("\n使用方法：")
        print("  1. 命令行传参: python3 md_to_json_deepseek.py 'sk-xxxxx'")
        print("  2. 环境变量:   export DEEPSEEK_API_KEY='sk-xxxxx'")
        print("  3. .env.local: 在 apps/paper2bank-v2/.env.local 中添加")
        exit(1)
    
    print("="*70)
    print("  🤖 DeepSeek API 驱动的试卷结构化转换")
    print("="*70)
    print()
    
    # 只转换最近3年（2021-2023）
    target_years = [2021, 2022, 2023]
    print(f"📅 本次只转换最近3年: {target_years}\n")
    
    convert_markdown_files(input_directory, output_directory, api_key, target_years)

