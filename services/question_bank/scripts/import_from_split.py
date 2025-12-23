#!/usr/bin/env python3
"""
题库数据导入脚本（支持按年份拆分的文件）
可以导入单个年份或批量导入所有年份
"""
import sys
import os
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db
from app.routers.admin import import_data
from app.models.schemas import ImportRequest
import asyncio
import json


async def import_single_year(year: int, db: Session, overwrite: bool = False):
    """导入单个年份的数据"""
    data_dir = Path("/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/data/papers")
    data_file = data_dir / f"广东_高数_{year}.json"
    
    if not data_file.exists():
        print(f"❌ 文件不存在: {data_file}")
        return False
    
    print(f"\n📂 导入 {year}年 数据...")
    
    try:
        # 读取单年份文件
        with open(data_file, 'r', encoding='utf-8') as f:
            year_data = json.load(f)
        
        # 转换为批量导入格式
        batch_data = {
            "meta": year_data["meta"],
            "papers": [year_data["paper"]]
        }
        
        # 临时保存为完整格式文件
        temp_file = data_dir / f"temp_{year}.json"
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(batch_data, f, ensure_ascii=False)
        
        # 导入
        request = ImportRequest(
            data_path=str(temp_file),
            overwrite=overwrite
        )
        result = await import_data(request, db)
        
        # 删除临时文件
        temp_file.unlink()
        
        print(f"  ✓ {year}年: {result.questions_imported}题, {result.images_imported}图")
        return True
        
    except Exception as e:
        print(f"  ✗ {year}年导入失败: {e}")
        return False


async def import_all_years(db: Session, overwrite: bool = False, years: list = None):
    """批量导入所有年份或指定年份"""
    data_dir = Path("/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/data/papers")
    
    # 读取索引文件
    index_file = data_dir / "index.json"
    if not index_file.exists():
        print(f"❌ 索引文件不存在: {index_file}")
        return
    
    with open(index_file, 'r', encoding='utf-8') as f:
        index_data = json.load(f)
    
    # 筛选要导入的年份
    if years:
        files_to_import = [f for f in index_data['files'] if f['year'] in years]
    else:
        files_to_import = index_data['files']
    
    print(f"📊 准备导入 {len(files_to_import)} 个年份")
    print(f"{'='*60}")
    
    success_count = 0
    fail_count = 0
    total_questions = 0
    total_images = 0
    
    for file_info in files_to_import:
        year = file_info['year']
        success = await import_single_year(year, db, overwrite)
        
        if success:
            success_count += 1
            total_questions += file_info['total_questions']
            total_images += file_info['total_images']
        else:
            fail_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ 导入完成！")
    print(f"{'='*60}")
    print(f"成功: {success_count} 年份")
    print(f"失败: {fail_count} 年份")
    print(f"题目: {total_questions} 道")
    print(f"图片: {total_images} 张")
    print(f"{'='*60}")


async def main():
    """主函数"""
    print("="*60)
    print("  📚 题库数据导入工具")
    print("="*60)
    
    # 初始化数据库
    print("\n🗄️  初始化数据库...")
    init_db()
    
    # 创建数据库会话
    db = SessionLocal()
    
    try:
        # 检查命令行参数
        if len(sys.argv) > 1:
            # 导入指定年份
            years = [int(y) for y in sys.argv[1:]]
            print(f"\n🎯 导入指定年份: {years}")
            await import_all_years(db, overwrite=True, years=years)
        else:
            # 导入所有年份
            print(f"\n🎯 导入所有年份")
            await import_all_years(db, overwrite=True)
        
    except Exception as e:
        print(f"\n❌ 导入失败: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    # 使用示例:
    # python3 scripts/import_from_split.py          # 导入所有年份
    # python3 scripts/import_from_split.py 2023    # 只导入2023年
    # python3 scripts/import_from_split.py 2021 2022 2023  # 导入多个年份
    
    asyncio.run(main())


