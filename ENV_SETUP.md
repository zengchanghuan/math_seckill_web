# 环境变量配置说明

## DeepSeek API Key 设置

所有使用DeepSeek API的功能（AI转换、题目标注、自动解答）都需要配置API Key。

### 1. 获取API Key

访问 https://platform.deepseek.com/api_keys 注册并获取API Key

### 2. 配置环境变量

#### 方式A: 本地开发（Next.js）

创建 `.env.local` 文件（此文件已在 .gitignore 中）：

\`\`\`bash
# .env.local
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
\`\`\`

然后重启开发服务器：

\`\`\`bash
npm run dev
\`\`\`

#### 方式B: Python脚本

设置环境变量后运行：

\`\`\`bash
export DEEPSEEK_API_KEY=sk-your-actual-api-key-here
python scripts/test_annotation.py
\`\`\`

或在命令前临时设置：

\`\`\`bash
DEEPSEEK_API_KEY=sk-xxx python scripts/annotate_question_bank.py --year 2024
\`\`\`

#### 方式C: 生产环境（Vercel）

在Vercel项目设置中添加环境变量：

1. 进入项目 Settings → Environment Variables
2. 添加变量名：\`DEEPSEEK_API_KEY\`
3. 添加值：你的API Key
4. 选择环境：Production / Preview / Development
5. 保存并重新部署

### 3. 验证配置

运行测试脚本验证：

\`\`\`bash
# Next.js API测试
npm run dev
# 访问 http://localhost:3000 后在控制台测试

# Python脚本测试
DEEPSEEK_API_KEY=sk-xxx python scripts/test_annotation.py
\`\`\`

### 4. 安全注意事项

⚠️ **重要**:
- ❌ 绝对不要将 \`.env.local\` 提交到Git
- ❌ 绝对不要在代码中硬编码API Key
- ✅ 始终从环境变量读取
- ✅ 定期轮换API Key
- ✅ 为不同环境使用不同的Key

### 5. 错误排查

如果看到错误：\`Missing DEEPSEEK_API_KEY\`

**Next.js API**:
1. 确认 \`.env.local\` 文件存在且包含正确的Key
2. 重启开发服务器（\`npm run dev\`）
3. 检查文件名是否正确（\`.env.local\` 不是 \`.env\`）

**Python脚本**:
1. 确认环境变量已设置：\`echo $DEEPSEEK_API_KEY\`
2. 确保在运行脚本前已export
3. 或使用临时变量：\`DEEPSEEK_API_KEY=sk-xxx python script.py\`

### 6. 相关文件

已移除硬编码API Key的文件：
- \`lib/questionBank/annotationService.ts\` ✅
- \`app/api/convert-to-choice/route.ts\` ✅
- \`app/api/fix-solution/route.ts\` ✅
- \`scripts/solve_2024_questions.py\` ✅
- \`scripts/solve_2024_part1.py\` ✅

所有文件现在都从环境变量读取，缺失时会抛出明确的错误提示。
