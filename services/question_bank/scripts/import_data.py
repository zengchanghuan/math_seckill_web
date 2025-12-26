#!/usr/bin/env python3
"""
题库数据导入脚本
从JSON文件导入题库数据到数据库
"""
import sys
import os

# 添加项目根目录到路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db
from app.routers.admin import import_data
from app.models.schemas import ImportRequest
import asyncio


async def main():
    """主函数"""
    # 初始化数据库
    print("📊 初始化数据库...")
    init_db()
    
    # 数据文件路径
    data_path = "/Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web/data/广东省_高等数学_真题.json"
    
    if not os.path.exists(data_path):
        print(f"❌ 数据文件不存在: {data_path}")
        return
    
    print(f"📂 准备导入数据: {data_path}")
    
    # 创建数据库会话
    db = SessionLocal()
    
    try:
        # 创建导入请求
        request = ImportRequest(
            data_path=data_path,
            overwrite=True  # 覆盖已存在的数据
        )
        
        print("⏳ 开始导入数据...")
        result = await import_data(request, db)
        
        print(f"\n{'='*60}")
        print(f"✅ 导入成功！")
        print(f"{'='*60}")
        print(f"📄 导入试卷数: {result.papers_imported}")
        print(f"❓ 导入题目数: {result.questions_imported}")
        print(f"🖼️  导入图片数: {result.images_imported}")
        print(f"{'='*60}")
        
    except Exception as e:
        print(f"❌ 导入失败: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())




