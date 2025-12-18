# paper2bank-v2（恢复版：DeepSeek vs Qwen）

## 本地启动

### 启动 Next.js（paper2bank-v2）

```bash
cd apps/paper2bank-v2
cp env.example .env.local
# 填入 DASHSCOPE_API_KEY、DEEPSEEK_API_KEY
npm run dev
```

打开：`http://localhost:3010/extractor`

## 说明

- **OCR**：Qwen-VL（DashScope）多模态 API
- **解题**：DeepSeek 一次输出结构化 JSON（plan + candidate）
- **备选解题**：Qwen 文本模型（qwen-plus）
- **对比展示**：DeepSeek vs Qwen；若一致，Final 区域仅展示 DeepSeek（但仍保留 Qwen 记录）


