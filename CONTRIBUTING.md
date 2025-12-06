# 贡献指南

感谢你对数学秒杀网页端项目的关注！我们欢迎所有形式的贡献。

## 开发流程

### 1. Fork 和克隆仓库

```bash
# Fork 仓库到你的 GitHub 账户
# 然后克隆你的 fork
git clone git@github.com:yourusername/math_seckill_web.git
cd math_seckill_web
```

### 2. 安装依赖

```bash
npm install
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 4. 开发

- 编写代码
- 确保代码通过 lint 检查：`npm run lint`
- 确保类型检查通过：`npm run type-check`
- 测试你的更改

### 5. 提交代码

```bash
git add .
git commit -m "描述你的更改"
```

提交信息格式：
- `feat: 添加新功能`
- `fix: 修复 bug`
- `docs: 更新文档`
- `style: 代码格式调整`
- `refactor: 代码重构`
- `test: 添加测试`
- `chore: 构建/工具链相关`

### 6. 推送并创建 Pull Request

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

## 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码（如果配置了）
- 组件使用函数式组件和 Hooks
- 使用有意义的变量和函数名

## 项目结构

```
math_seckill_web/
├── app/              # Next.js 页面
├── components/       # 可复用组件
├── lib/             # 工具库和 API
├── types/           # TypeScript 类型定义
└── public/          # 静态资源
```

## 问题报告

如果发现 bug 或有功能建议，请创建 Issue：
- Bug 报告：使用 bug report 模板
- 功能请求：使用 feature request 模板

## 许可证

通过贡献代码，你同意你的贡献将在与项目相同的许可证下发布。

---

再次感谢你的贡献！🎉
