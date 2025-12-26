"""
题库管理服务主应用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.database import init_db
from app.routers import questions, admin

load_dotenv()

# 创建FastAPI应用
app = FastAPI(
    title="题库管理服务",
    description="提供试题数据的持久化存储和API访问",
    version="1.0.0"
)

# CORS配置
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(questions.router)
app.include_router(admin.router)


@app.on_event("startup")
async def startup_event():
    """应用启动时初始化数据库"""
    print("🚀 初始化数据库...")
    init_db()
    print("✅ 数据库初始化完成")


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "题库管理服务",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8300))
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True
    )




