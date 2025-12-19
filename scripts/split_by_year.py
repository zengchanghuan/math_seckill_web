#!/usr/bin/env python3
"""
按年份拆分历年试卷Markdown文件，并合并同一年份的所有内容
"""
import re
from pathlib import Path
import sys
from collections import defaultdict

def split_by_year(input_path: Path, output_dir: Path):
    """
    按年份拆分Markdown文件，并合并同一年份的所有内容
    """
    # 读取文件
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 查找所有年份标记行（包含"试题"或"招生考试"但不包含"答案"或"参考"）
    year_sections = []
    for i, line in enumerate(lines):
        # 匹配包含年份且包含"试题"或"招生考试"的行，但排除答案行
        if re.search(r'(20\d{2})年', line):
            if ('试题' in line or '招生考试' in line) and '答案' not in line and '参考' not in line:
                year_match = re.search(r'(20\d{2})年', line)
                if year_match:
                    year = year_match.group(1)
                    year_sections.append((i, year, line.strip()))
    
    if not year_sections:
        print("❌ 未找到年份标记")
        return
    
    print(f"✅ 找到 {len(year_sections)} 个年份章节")
    
    # 按年份分组内容
    year_contents = defaultdict(list)
    
    for i, (line_idx, year, title) in enumerate(year_sections):
        # 确定结束位置（下一个年份试题的开始，或文件末尾）
        if i < len(year_sections) - 1:
            end_line_idx = year_sections[i + 1][0]
        else:
            end_line_idx = len(lines)
        
        # 提取该章节的内容
        section_content = ''.join(lines[line_idx:end_line_idx]).strip()
        
        # 添加到对应年份
        year_contents[year].append(section_content)
    
    # 创建输出目录
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"\n开始拆分并合并...")
    
    # 按年份写入文件
    for year in sorted(year_contents.keys()):
        # 合并同一年份的所有章节
        sections = year_contents[year]
        if len(sections) > 1:
            # 如果有多个章节，用分隔线连接
            merged_content = '\n\n---\n\n'.join(sections)
            print(f"   📄 {year}年 → 合并了 {len(sections)} 个章节")
        else:
            merged_content = sections[0]
            print(f"   📄 {year}年 → 单个章节")
        
        # 生成输出文件名
        output_file = output_dir / f"{year}年广东专插本考试《高等数学》试题_clean.md"
        
        # 写入文件
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(merged_content)
        
        # 统计行数
        line_count = merged_content.count('\n') + 1
        
        print(f"      → {output_file.name} ({line_count} 行)")
    
    print(f"\n✅ 拆分完成，共生成 {len(year_contents)} 个文件")
    print(f"   输出目录: {output_dir}")

def main():
    if len(sys.argv) < 2:
        print("用法: python split_by_year.py <input.md> [output_dir]")
        print("示例: python split_by_year.py 历年试卷.md ./output")
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    
    if not input_path.exists():
        print(f"❌ 错误：文件不存在 {input_path}")
        sys.exit(1)
    
    # 默认输出目录
    if len(sys.argv) >= 3:
        output_dir = Path(sys.argv[2])
    else:
        output_dir = input_path.parent / "按年份拆分"
    
    split_by_year(input_path, output_dir)

if __name__ == "__main__":
    main()
