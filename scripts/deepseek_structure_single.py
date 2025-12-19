#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用 DeepSeek API 结构化Markdown试卷为JSON
"""

import json
import os
import requests
from pathlib import Path


def call_deepseek_for_structuring(markdown_content, year, api_key):
    """
    调用 DeepSeek API 将 Markdown 转换为结构化 JSON
    """
    
    system_prompt = """你是一个专业的试卷结构化解析助手。你需要将广东专升本高等数学试卷的 Markdown 格式转换为 JSON 格式。

**重要规则：**
1. ⚠️ 文件中可能包含广告内容（如培训机构信息、联系方式、网址等），必须完全去除
2. ✅ 保留所有图片标记 ![alt](url)，不要丢失
3. ✅ 保留所有 LaTeX 公式（$...$ 和 $$...$$）
4. ✅ 题目content字段必须包含完整题干和所有选项（A/B/C/D），每行一个选项
5. ✅ 章节名称要完整（如"单项选择题"而不是"单"）
6. ✅ 答案和解析分开存储在answer字段
7. ❌ 去除所有广告、联系方式、页码等无关内容

**输出 JSON 格式：**
```json
{
  "province": "广东",
  "subject": "高等数学",
  "year": 2020,
  "exam_type": "专升本",
  "sections": [
    {
      "section_number": "一",
      "section_name": "单项选择题",
      "questions": [
        {
          "question_number": 1,
          "content": "题目题干内容\nA. 选项A\nB. 选项B\nC. 选项C\nD. 选项D",
          "answer": "答案内容和解析",
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

直接返回 JSON，不要包含任何其他文字或markdown标记。"""

    user_prompt = f"""请将下面的试卷 Markdown 内容转换为结构化 JSON。

**年份：** {year}

**注意事项：**
1. 去除所有广告内容（培训机构、联系方式、网址、页码等）
2. 保留所有题目、答案、解析
3. 保留所有图片信息
4. 保留所有LaTeX公式

**Markdown内容：**
{markdown_content}

请直接返回JSON格式，确保：
- content字段包含题干和完整选项（每行一个）
- 图片信息完整保留
- 无广告内容
"""

    try:
        print("  🤖 正在调用 DeepSeek API...")
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
            timeout=180
        )
        
        if response.status_code != 200:
            print(f"  ✗ API 返回状态码: {response.status_code}")
            print(f"  ✗ 错误详情: {response.text}")
            return None
        
        result = response.json()
        
        # 提取返回的 JSON 内容
        content = result['choices'][0]['message']['content'].strip()
        
        # 移除可能的 markdown 代码块标记
        if content.startswith('```'):
            content = content.split('\n', 1)[1] if '\n' in content else content
            if content.endswith('```'):
                content = content.rsplit('\n', 1)[0] if '\n' in content else content
        
        # 解析 JSON
        paper_data = json.loads(content)
        
        print(f"  ✅ API 调用成功")
        return paper_data
        
    except requests.exceptions.RequestException as e:
        print(f"  ✗ API 调用失败: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"  ✗ JSON 解析失败: {e}")
        print(f"  返回内容前200字符: {content[:200]}...")
        return None


def process_single_file(input_file, output_dir, api_key):
    """处理单个文件"""
    input_path = Path(input_file)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 提取年份
    import re
    year_match = re.search(r'(\d{4})年', input_path.name)
    year = int(year_match.group(1)) if year_match else 0
    
    print("="*70)
    print(f"  📚 DeepSeek API 驱动的试卷结构化转换")
    print("="*70)
    print(f"\n📄 处理文件: {input_path.name}")
    print(f"📅 年份: {year}年")
    print()
    
    # 读取文件
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
        print(f"  📖 文件大小: {len(markdown_content)} 字符")
        
        # 调用 DeepSeek API
        paper_data = call_deepseek_for_structuring(markdown_content, year, api_key)
        
        if paper_data:
            # 统计信息
            total_questions = sum(len(section['questions']) for section in paper_data['sections'])
            total_images = sum(
                len(q.get('images', [])) 
                for section in paper_data['sections'] 
                for q in section['questions']
            )
            
            # 包装为导入脚本期望的格式
            output_data = {
                "meta": {
                    "province": paper_data.get('province', '广东'),
                    "subject": paper_data.get('subject', '高等数学'),
                    "year": paper_data.get('year', year),
                    "exam_type": paper_data.get('exam_type', '专升本'),
                    "total_sections": len(paper_data['sections']),
                    "total_questions": total_questions,
                    "total_images": total_images
                },
                "paper": paper_data
            }
            
            # 保存文件
            filename = f"广东_高数_{year}.json"
            output_file = output_path / filename
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)
            
            file_size = output_file.stat().st_size / 1024
            
            print()
            print("  ✅ 转换成功！")
            print(f"     - 章节: {len(paper_data['sections'])} 个")
            print(f"     - 题目: {total_questions} 道")
            print(f"     - 图片: {total_images} 张")
            print(f"     - 输出: {filename} ({file_size:.1f}KB)")
            print()
            print("="*70)
            
            return True
        else:
            print("\n  ❌ 转换失败")
            return False
            
    except Exception as e:
        print(f"\n  ❌ 处理失败: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    import sys
    
    # 配置
    input_file = "/Users/zengchanghuan/Documents/广东专升本真题/真题/2020年广东专插本考试《高等数学》试题.md"
    output_dir = "/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/data/papers"
    
    # 获取 API Key
    api_key = os.environ.get('DEEPSEEK_API_KEY')
    if not api_key:
        # 尝试从 .env.local 读取
        env_file = Path(__file__).parent.parent / "apps/paper2bank-v2/.env.local"
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if line.startswith('DEEPSEEK_API_KEY='):
                        api_key = line.split('=', 1)[1].strip().strip('"\'')
                        break
    
    if not api_key:
        print("\n❌ 错误: 未找到 DEEPSEEK_API_KEY")
        print("\n使用方法：")
        print("  1. 环境变量:   export DEEPSEEK_API_KEY='sk-xxxxx'")
        print("  2. .env.local: 在 apps/paper2bank-v2/.env.local 中添加")
        sys.exit(1)
    
    print(f"\n✓ 找到 API Key: {api_key[:15]}...")
    
    # 处理文件
    success = process_single_file(input_file, output_dir, api_key)
    
    if success:
        print("\n✨ 完成！JSON文件已生成")
    else:
        print("\n❌ 处理失败")
        sys.exit(1)

