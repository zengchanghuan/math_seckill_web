# 题库管理服务 (Question Bank Service)

## 功能说明

提供题库数据的持久化存储和API访问，支持：
- 真题数据导入
- 按年份、省份、题型查询
- 题目详情获取
- 图片信息管理

## 快速启动

### 1. 创建虚拟环境

```bash
cd services/question_bank
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 根据需要修改 .env 文件
```

### 4. 初始化数据库

```bash
python -m alembic upgrade head
```

### 5. 导入题库数据

```bash
python scripts/import_data.py
```

### 6. 启动服务

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8300 --reload
```

服务将运行在 `http://localhost:8300`

## API 文档

启动服务后访问：
- Swagger UI: http://localhost:8300/docs
- ReDoc: http://localhost:8300/redoc

## 主要接口

### 题库统计
- `GET /api/papers/stats` - 获取题库统计信息

### 试卷列表
- `GET /api/papers` - 获取试卷列表（支持筛选）
- `GET /api/papers/{year}` - 获取指定年份试卷

### 题目查询
- `GET /api/questions` - 查询题目（支持多种筛选条件）
- `GET /api/questions/{question_id}` - 获取题目详情

### 数据管理
- `POST /api/admin/import` - 导入题库数据（管理员）
- `DELETE /api/admin/papers/{year}` - 删除指定年份数据（管理员）


