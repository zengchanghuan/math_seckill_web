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

def call_deepseek_convert(md_content: str, year: int) -> dict:
    """调用DeepSeek API转换MD为JSON"""
    
    prompt = f"""请将以下{year}年广东专升本高等数学试题的Markdown内容转换为JSON格式。

要求：
1. 严格按照提供的JSON结构输出
2. 保留所有LaTeX数学公式（用$...$或$$...$$包裹）
3. 保留所有图片信息（Markdown格式：![alt](url)）
4. 题目content字段包含题干和选项
5. answer字段包含答案和解析
6. 不要添加任何额外说明，只输出JSON

JSON结构示例：
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
            "answer": "A\\n【精析】解析内容",
            "images": []
          }}
        ]
      }}
    ]
  }}
}}

Markdown内容：
{md_content}

请输出JSON（不要markdown代码块标记）："""

    try:
        response = requests.post(
            'https://api.deepseek.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {os.getenv("DEEPSEEK_API_KEY")}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'deepseek-chat',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.1,
                'max_tokens': 8000
            },
            timeout=120
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            # 移除可能的markdown代码块标记
            content = re.sub(r'^```json\s*', '', content)
            content = re.sub(r'\s*```$', '', content)
            return json.loads(content)
        else:
            print(f"   API错误: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"   调用失败: {e}")
        return None

def convert_with_deepseek():
    """使用DeepSeek转换"""
    input_dir = Path("/Users/zengchanghuan/Documents/广东专升本真题/2003-2018")
    output_dir = Path("/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/public/papers")
    
    # 确保输出目录存在
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 需要转换的年份（之前失败的）
    need_convert_years = [2003, 2004, 2008, 2010, 2012, 2013, 2014, 2016, 2017]
    
    print(f"📂 准备转换 {len(need_convert_years)} 个年份\n")
    
    success_count = 0
    for year in need_convert_years:
        md_file = input_dir / f"{year}年广东专升本高等数学试题_*图.md"
        md_files = list(input_dir.glob(f"{year}年*.md"))
        
        if not md_files:
            print(f"⚠️  未找到 {year} 年文件")
            continue
        
        md_file = md_files[0]
        
        try:
            print(f"📄 处理 {year}年...")
            
            # 读取MD文件
            with open(md_file, 'r', encoding='utf-8') as f:
                md_content = f.read()
            
            # 调用DeepSeek转换
            print(f"   ⏳ 调用DeepSeek API...")
            data = call_deepseek_convert(md_content, year)
            
            if data:
                # 保存JSON
                output_file = output_dir / f"广东_高数_{year}.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                
                print(f"   ✅ 成功: {data['meta']['total_questions']}题, {data['meta']['total_images']}图")
                print(f"   💾 保存至: {output_file.name}\n")
                success_count += 1
            else:
                print(f"   ❌ 转换失败\n")
            
            # 延迟避免API限流
            time.sleep(2)
            
        except Exception as e:
            print(f"   ❌ 失败: {e}\n")
    
    print("=" * 60)
    print(f"✅ 转换完成！成功: {success_count}/{len(need_convert_years)}")
    print("=" * 60)

if __name__ == '__main__':
    # 检查API Key
    if not os.getenv("DEEPSEEK_API_KEY"):
        print("❌ 未设置 DEEPSEEK_API_KEY 环境变量")
        print("请设置: export DEEPSEEK_API_KEY='your_api_key'")
        exit(1)
    
    convert_with_deepseek()

