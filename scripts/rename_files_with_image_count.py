#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一命名文件并追加图片数量
"""

import os
import re
from pathlib import Path
from typing import Tuple

def count_images_in_file(file_path: Path) -> int:
    """统计文件中的图片数量"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        # 匹配 Markdown 图片语法: ![...](...) 
        images = re.findall(r'!\[.*?\]\(.*?\)', content)
        return len(images)
    except Exception as e:
        print(f"❌ 读取文件失败 {file_path}: {e}")
        return 0

def extract_year_and_info(filename: str) -> Tuple[str, str]:
    """从文件名中提取年份和基本信息"""
    # 移除已有的图片数量标记
    filename = re.sub(r'_\d+图', '', filename)
    filename = re.sub(r'_\d+张图', '', filename)
    filename = re.sub(r'_md', '', filename)
    filename = filename.replace('.md', '')
    
    # 提取年份
    year_match = re.search(r'(\d{4})年', filename)
    if year_match:
        year = year_match.group(1)
        return year, filename
    return None, filename

def generate_standard_filename(year: str, image_count: int) -> str:
    """生成标准文件名: YYYY年广东专升本高等数学试题_N图.md"""
    return f"{year}年广东专升本高等数学试题_{image_count}图.md"

def process_directory(directory: str):
    """处理目录中的所有文件"""
    dir_path = Path(directory)
    
    if not dir_path.exists():
        print(f"❌ 目录不存在: {directory}")
        return
    
    # 获取所有 .md 文件
    md_files = sorted(dir_path.glob("*.md"))
    
    if not md_files:
        print(f"❌ 目录中没有找到 .md 文件: {directory}")
        return
    
    print(f"\n📂 处理目录: {directory}")
    print(f"找到 {len(md_files)} 个文件\n")
    
    rename_map = []
    
    for md_file in md_files:
        print(f"📄 检查: {md_file.name}")
        
        # 统计图片数量
        image_count = count_images_in_file(md_file)
        print(f"   图片数量: {image_count}")
        
        # 提取年份
        year, _ = extract_year_and_info(md_file.name)
        
        if not year:
            print(f"   ⚠️  无法提取年份，跳过")
            continue
        
        # 生成新文件名
        new_filename = generate_standard_filename(year, image_count)
        new_path = md_file.parent / new_filename
        
        # 检查是否需要重命名
        if md_file.name == new_filename:
            print(f"   ✓ 文件名已正确: {new_filename}\n")
        else:
            print(f"   → 将重命名为: {new_filename}\n")
            rename_map.append((md_file, new_path))
    
    # 执行重命名
    if rename_map:
        print("\n" + "="*60)
        print(f"准备重命名 {len(rename_map)} 个文件")
        print("="*60)
        
        for old_path, new_path in rename_map:
            try:
                # 如果目标文件已存在，先备份
                if new_path.exists():
                    backup_path = new_path.parent / f"{new_path.stem}_backup{new_path.suffix}"
                    print(f"⚠️  目标文件已存在，备份到: {backup_path.name}")
                    new_path.rename(backup_path)
                
                old_path.rename(new_path)
                print(f"✅ {old_path.name}")
                print(f"   → {new_path.name}")
            except Exception as e:
                print(f"❌ 重命名失败 {old_path.name}: {e}")
        
        print("\n" + "="*60)
        print("✅ 重命名完成！")
        print("="*60)
    else:
        print("\n✅ 所有文件名已符合规范，无需重命名")
    
    # 显示最终列表
    print("\n📋 最终文件列表:")
    final_files = sorted(dir_path.glob("*.md"))
    for f in final_files:
        print(f"   {f.name}")

if __name__ == '__main__':
    import sys
    
    # 处理多个目录
    directories = [
        "/Users/zengchanghuan/Documents/广东专升本真题/2003-2018",
        "/Users/zengchanghuan/Documents/广东专升本真题/真题"
    ]
    
    # 如果命令行指定了目录，使用指定的
    if len(sys.argv) > 1:
        directories = sys.argv[1:]
    
    for directory in directories:
        process_directory(directory)
        print("\n")

