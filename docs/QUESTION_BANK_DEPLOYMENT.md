# 题库数据持久化完成 ✅

## 📊 数据概览

已成功将**广东专升本高等数学真题（2003-2023）**持久化到服务器数据库：

- **试卷总数**: 21份
- **题目总数**: 760道
- **图片总数**: 20张
- **年份跨度**: 2003-2023 (21年)
- **数据库**: SQLite
- **服务端口**: 8300

## 🏗️ 架构说明

### 数据流

```
Markdown文件 → JSON转换 → 数据库导入 → API服务 → 前端应用
     ↓              ↓             ↓           ↓          ↓
  scripts/     data/        question_bank  REST API   Next.js
  md_to_json   *.json          service      /api/*      app
```

### 目录结构

```
math_seckill_web/
├── data/                                    # 数据文件
│   └── 广东省_高等数学_真题.json            # 转换后的JSON数据
├── scripts/                                 # 工具脚本
│   ├── md_to_json.py                       # Markdown转JSON
│   ├── denoise_md.py                       # Markdown去噪
│   └── split_by_year.py                    # 按年份拆分
└── services/                               # 后端服务
    └── question_bank/                      # 题库服务
        ├── app/                            # 应用代码
        │   ├── models/                     # 数据模型
        │   │   ├── database.py            # SQLAlchemy模型
        │   │   └── schemas.py             # Pydantic模型
        │   ├── routers/                   # API路由
        │   │   ├── questions.py           # 题库查询API
        │   │   └── admin.py               # 管理API
        │   ├── database.py                # 数据库连接
        │   └── main.py                    # 主应用
        ├── scripts/                       # 服务脚本
        │   └── import_data.py            # 数据导入脚本
        ├── requirements.txt              # Python依赖
        └── question_bank.db              # SQLite数据库文件
```

## 🚀 服务使用

### 1. 启动服务

```bash
cd services/question_bank
source .venv/bin/activate
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8300 --reload
```

### 2. API端点

**基础信息**
- `GET /` - 服务信息
- `GET /health` - 健康检查
- `GET /docs` - API文档 (Swagger UI)

**题库查询**
- `GET /api/papers/stats` - 获取统计信息
- `GET /api/papers` - 获取试卷列表（支持筛选）
- `GET /api/papers/{year}` - 获取指定年份试卷
- `GET /api/questions` - 搜索题目
- `GET /api/questions/{id}` - 获取题目详情

**数据管理（管理员）**
- `POST /api/admin/import` - 导入数据
- `DELETE /api/admin/papers/{year}` - 删除试卷
- `POST /api/admin/reset` - 重置数据库

### 3. 使用示例

```bash
# 获取统计信息
curl http://localhost:8300/api/papers/stats

# 获取2023年试卷
curl http://localhost:8300/api/papers/2023

# 搜索包含"极限"的题目
curl "http://localhost:8300/api/questions?keyword=极限&limit=5"

# 获取试卷列表（最近5年）
curl "http://localhost:8300/api/papers?limit=5"
```

## 📊 数据库表结构

### papers (试卷表)
- id: 主键
- year: 年份
- province: 省份
- subject: 科目
- exam_type: 考试类型
- created_at: 创建时间
- updated_at: 更新时间

### sections (章节表)
- id: 主键
- paper_id: 试卷ID (外键)
- section_number: 章节号 (一、二、三...)
- section_name: 章节名 (单项选择题、填空题...)
- order_index: 排序索引

### questions (题目表)
- id: 主键
- section_id: 章节ID (外键)
- question_number: 题号
- content: 题目内容 (Markdown)
- answer: 答案解析 (Markdown)
- created_at: 创建时间

### question_images (图片表)
- id: 主键
- question_id: 题目ID (外键)
- alt_text: 图片描述
- url: 图片URL
- position: 位置标记
- caption: 图片说明
- question_ref: 关联题号

## 🔄 数据更新流程

### 添加新年份试卷

1. 将Markdown文件放到指定目录
2. 运行转换脚本:
   ```bash
   python3 scripts/md_to_json.py
   ```
3. 运行导入脚本:
   ```bash
   cd services/question_bank
   source .venv/bin/activate
   python3 scripts/import_data.py
   ```

### 更新现有数据

修改`scripts/import_data.py`中的`overwrite`参数为`True`，然后重新导入。

## 🎯 下一步计划

- [ ] 集成到前端Next.js应用
- [ ] 添加用户答题记录功能
- [ ] 实现错题本功能
- [ ] 添加题目标签和分类
- [ ] 支持全文搜索
- [ ] 添加数据备份功能
- [ ] 支持PostgreSQL/MySQL数据库
- [ ] 添加认证和权限控制

## 📝 注意事项

1. **图片URL**: 当前图片托管在MinerU CDN，需要网络访问
2. **数据库**: 生产环境建议使用PostgreSQL替代SQLite
3. **备份**: 定期备份`question_bank.db`文件
4. **性能**: 对于大量数据，考虑添加索引和缓存
5. **安全**: 管理员API需要添加认证机制

## 🔗 相关文档

- [FastAPI文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy文档](https://www.sqlalchemy.org/)
- [Pydantic文档](https://docs.pydantic.dev/)

---

**创建时间**: 2025-12-19  
**服务状态**: ✅ 运行中 (http://localhost:8300)  
**数据版本**: 2003-2023 广东专升本高等数学真题




