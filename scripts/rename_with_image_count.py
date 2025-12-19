#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重命名Markdown文件，在文件名中添加图片数量
格式：2023年广东专插本考试《高等数学》试题_clean_1张图.md
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


def rename_files_with_image_count(directory):
    """重命名文件，在文件名中添加图片数量"""
    directory = Path(directory)
    md_files = sorted(directory.glob("*_clean.md"), 
                     key=lambda f: int(re.search(r'(\d{4})年', f.name).group(1)) if re.search(r'(\d{4})年', f.name) else 0)
    
    print("="*80)
    print("  📝 重命名Markdown文件，添加图片数量到文件名")
    print("="*80)
    print()
    
    total_files = 0
    total_images = 0
    
    for md_file in md_files:
        # 统计图片数量
        image_count = count_images_in_md(md_file)
        
        # 生成新文件名
        # 原文件名：2023年广东普通专升本考试《高等数学》试题_clean.md
        # 新文件名：2023年广东普通专升本考试《高等数学》试题_clean_1张图.md
        old_name = md_file.name
        
        # 如果文件名已经包含图片数量信息，先移除
        old_name_clean = re.sub(r'_clean_\d+张图', '_clean', old_name)
        old_name_clean = re.sub(r'_clean_无图', '_clean', old_name_clean)
        
        # 在 _clean 后面添加图片数量
        if image_count > 0:
            new_name = old_name_clean.replace('_clean.md', f'_clean_{image_count}张图.md')
        else:
            new_name = old_name_clean.replace('_clean.md', f'_clean_0张图.md')
        
        # 重命名
        new_path = md_file.parent / new_name
        
        if old_name != new_name:
            md_file.rename(new_path)
            total_files += 1
            total_images += image_count
            
            status = "✅" if image_count > 0 else "⚪"
            print(f"{status} {old_name}")
            print(f"   → {new_name}")
            print()
    
    print("="*80)
    print(f"✅ 完成！共重命名 {total_files} 个文件，总计 {total_images} 张图片")
    print("="*80)


if __name__ == '__main__':
    input_directory = "/Users/zengchanghuan/Documents/广东专升本真题/真题/广东省_高等数学_真题"
    rename_files_with_image_count(input_directory)

