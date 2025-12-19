#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
在Markdown文件标题后添加图片数量信息
"""

import re
import os
from pathlib import Path


def count_images_in_md(file_path):
    """统计MD文件中的图片数量"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 匹配 ![...](...)  格式的图片
    image_pattern = r'!\[([^\]]*)\]\(([^)]+)\)'
    images = re.findall(image_pattern, content)
    return len(images)


def add_image_count_to_title(file_path):
    """在文件标题后添加图片数量"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 统计图片数量
    content = ''.join(lines)
    image_count = len(re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', content))
    
    # 找到第二个标题行（# 高等数学）
    modified = False
    new_lines = []
    title_count = 0
    
    for i, line in enumerate(lines):
        if line.startswith('# ') and not line.startswith('## '):
            title_count += 1
            # 在第二个一级标题后添加图片数量
            if title_count == 2:
                # 移除可能已存在的图片数量信息
                line = re.sub(r'\s*\(共\d+张图片?\)', '', line.rstrip())
                # 添加新的图片数量
                if image_count > 0:
                    line = line.rstrip() + f' (共{image_count}张图片)\n'
                else:
                    line = line.rstrip() + ' (无图片)\n'
                modified = True
        new_lines.append(line)
    
    if modified:
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        return True, image_count
    return False, image_count


def process_directory(directory):
    """处理目录下的所有_clean.md文件"""
    directory = Path(directory)
    md_files = sorted(directory.glob("*_clean.md"), 
                     key=lambda f: int(re.search(r'(\d{4})年', f.name).group(1)) if re.search(r'(\d{4})年', f.name) else 0)
    
    print("="*70)
    print("  📝 为Markdown文件添加图片数量信息")
    print("="*70)
    print()
    
    total_files = 0
    total_images = 0
    
    for md_file in md_files:
        modified, image_count = add_image_count_to_title(md_file)
        if modified:
            total_files += 1
            total_images += image_count
            status = "✅" if image_count > 0 else "⚪"
            print(f"{status} {md_file.name:60s} - {image_count:2d}张图片")
    
    print()
    print("="*70)
    print(f"✅ 完成！共处理 {total_files} 个文件，总计 {total_images} 张图片")
    print("="*70)


if __name__ == '__main__':
    input_directory = "/Users/zengchanghuan/Documents/广东专升本真题/真题/广东省_高等数学_真题"
    process_directory(input_directory)

