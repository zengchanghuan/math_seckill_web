#!/usr/bin/env python3
"""
扫描所有题目的答案解析，检测 LaTeX 错误
"""

import json
import os
import re
from pathlib import Path

def detect_latex_errors(content):
    """检测 LaTeX 代码中的常见错误"""
    errors = []
    
    # 检测错误1: \left|\limits 语法错误
    if re.search(r'\\left\|\\limits', content):
        errors.append('\\left|\\limits')
    
    # 检测错误2: \right|\limits 语法错误
    if re.search(r'\\right\|\\limits', content):
        errors.append('\\right|\\limits')
    
    # 检测错误3: 不匹配的括号
    left_count = len(re.findall(r'\\left[(\[{|]', content))
    right_count = len(re.findall(r'\\right[)\]}|]', content))
    if left_count != right_count:
        errors.append(f'括号不匹配 (left:{left_count}, right:{right_count})')
    
    # 检测错误4: 重复的 \limits
    if re.search(r'\\lim\\limits\\limits|\\int\\limits\\limits', content):
        errors.append('重复的\\limits')
    
    return errors

def scan_json_file(filepath):
    """扫描单个 JSON 文件"""
    problems = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    paper_name = data.get('meta', {}).get('title', os.path.basename(filepath))
    
    for section in data['paper']['sections']:
        section_name = section['section_name']
        
        for question in section['questions']:
            q_num = question['question_number']
            answer = question.get('answer', '')
            
            if answer:
                errors = detect_latex_errors(answer)
                if errors:
                    problems.append({
                        'file': os.path.basename(filepath),
                        'paper': paper_name,
                        'section': section_name,
                        'question_num': q_num,
                        'errors': errors,
                        'answer_preview': answer[:100] + '...' if len(answer) > 100 else answer
                    })
    
    return problems

def main():
    """主函数"""
    papers_dir = Path(__file__).parent.parent / 'public' / 'papers'
    
    if not papers_dir.exists():
        print(f"❌ 目录不存在: {papers_dir}")
        return
    
    print("🔍 开始扫描所有题目...")
    print(f"📁 扫描目录: {papers_dir}")
    print()
    
    all_problems = []
    json_files = list(papers_dir.glob('*.json'))
    
    for json_file in json_files:
        problems = scan_json_file(json_file)
        all_problems.extend(problems)
    
    print(f"✅ 扫描完成！共检查 {len(json_files)} 个文件")
    print()
    
    if all_problems:
        print(f"⚠️  发现 {len(all_problems)} 个问题：")
        print("=" * 80)
        
        for i, problem in enumerate(all_problems, 1):
            print(f"\n{i}. {problem['file']} - {problem['paper']}")
            print(f"   {problem['section']} 第 {problem['question_num']} 题")
            print(f"   错误类型: {', '.join(problem['errors'])}")
            print(f"   内容预览: {problem['answer_preview']}")
        
        print("\n" + "=" * 80)
        print(f"\n📊 统计:")
        print(f"   - 有问题的文件: {len(set(p['file'] for p in all_problems))}")
        print(f"   - 总问题数: {len(all_problems)}")
        
        # 保存报告
        report_file = Path(__file__).parent / 'latex_errors_report.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(all_problems, f, ensure_ascii=False, indent=2)
        print(f"\n💾 详细报告已保存至: {report_file}")
    else:
        print("✅ 未发现任何 LaTeX 错误！")

if __name__ == '__main__':
    main()

