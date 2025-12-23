#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用DeepSeek API批量转换MD为JSON
"""

import json
import os
import re
from pathlib import Path
import requests
import time

DEEPSEEK_API_KEY = "sk-78c5eab3420c4135bc14691c936d6bad"

def call_deepseek_convert(md_content: str, year: int) -> dict:
    """调用DeepSeek API转换MD为JSON"""
    
    prompt = f"""请将以下{year}年广东专升本高等数学试题的Markdown内容精确转换为JSON格式。

重要要求：
1. 严格按照下面的JSON结构输出
2. 保留所有LaTeX数学公式（保持$...$或$$...$$格式不变）
3. 保留所有图片信息（Markdown格式：![alt](url)），放入images数组
4. 题目content字段包含题干和所有选项（每行一个选项）
5. answer字段包含答案和解析（如果有精析标记，保留完整格式）
6. 只输出JSON，不要任何解释文字

JSON结构：
{{
  "meta": {{
    "province": "广东省",
    "subject": "高等数学",
    "year": {year},
    "exam_type": "专升本",
    "total_sections": 4,
    "total_questions": 20,
    "total_images": 0
  }},
  "paper": {{
    "year": {year},
    "province": "广东省",
    "subject": "高等数学",
    "exam_type": "专升本",
    "sections": [
      {{
        "section_number": "一",
        "section_name": "单项选择题",
        "questions": [
          {{
            "question_number": 1,
            "content": "题目内容\\nA. 选项A\\nB. 选项B\\nC. 选项C\\nD. 选项D",
            "answer": "C\\n【精析】解析内容",
            "images": []
          }}
        ]
      }}
    ]
  }}
}}

Markdown内容：
{md_content}

请输出JSON："""

    try:
        response = requests.post(
            'https://api.deepseek.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'deepseek-chat',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.1,
                'max_tokens': 8000
            },
            timeout=300
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            # 移除可能的markdown代码块标记
            content = re.sub(r'^```json\s*', '', content)
            content = re.sub(r'^```\s*', '', content)
            content = re.sub(r'\s*```$', '', content)
            content = content.strip()
            return json.loads(content)
        else:
            print(f"   ❌ API错误: {response.status_code}")
            print(f"   {response.text[:200]}")
            return None
    except json.JSONDecodeError as e:
        print(f"   ❌ JSON解析失败: {e}")
        return None
    except Exception as e:
        print(f"   ❌ 调用失败: {e}")
        return None

def convert_all_with_deepseek():
    """使用DeepSeek转换所有文件"""
    input_dir = Path("/Users/zengchanghuan/Documents/广东专升本真题/2003-2018")
    output_dir = Path("/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/public/papers")
    
    # 确保输出目录存在
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 只转换缺失的年份
    missing_years = [2003, 2004, 2008, 2010, 2012, 2013, 2014, 2016, 2017]
    
    print(f"📂 准备转换 {len(missing_years)} 个缺失的年份")
    print(f"🤖 使用 DeepSeek API 进行转换\n")
    
    success_count = 0
    failed_files = []
    
    for idx, year in enumerate(missing_years, 1):
        output_file = output_dir / f"广东_高数_{year}.json"
        
        # 查找对应的MD文件
        md_files = list(input_dir.glob(f"{year}年*.md"))
        if not md_files:
            print(f"⚠️  跳过 {year}年：未找到MD文件")
            continue
        
        md_file = md_files[0]
        
        try:
            print(f"📄 [{idx}/{len(missing_years)}] 处理 {year}年...")
            
            # 读取MD文件
            with open(md_file, 'r', encoding='utf-8') as f:
                md_content = f.read()
            
            # 限制内容长度
            if len(md_content) > 25000:
                print(f"   ⚠️  内容较长（{len(md_content)}字符），可能需要较长时间")
            
            # 调用DeepSeek转换
            print(f"   ⏳ 调用DeepSeek API...")
            data = call_deepseek_convert(md_content, year)
            
            if data and 'meta' in data and 'paper' in data:
                # 保存JSON
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                print(f"   ✅ 成功: {data['meta']['total_questions']}题, {data['meta']['total_images']}图")
                print(f"   💾 {output_file.name}\n")
                success_count += 1
            else:
                print(f"   ❌ 转换失败：返回数据格式不正确\n")
                failed_files.append(year)
            
            # 延迟避免API限流
            time.sleep(2)
            
        except Exception as e:
            print(f"   ❌ 失败: {e}\n")
            failed_files.append(year)
    
    print("=" * 60)
    print(f"✅ 转换完成！")
    print(f"   成功: {success_count}/{len(missing_years)}")
    if failed_files:
        print(f"   失败的年份: {', '.join(map(str, failed_files))}")
    print("=" * 60)

if __name__ == '__main__':
    convert_all_with_deepseek()

