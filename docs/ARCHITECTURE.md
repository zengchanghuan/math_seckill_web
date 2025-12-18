# 架构文档

## 项目概述

数学秒杀网页端是一个基于 Next.js 14 构建的现代化 Web 应用，提供智能刷题、个性化推荐和学习画像分析功能。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **数学公式**: KaTeX
- **图标**: Lucide React

## 项目结构

```
math_seckill_web/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── drill/              # 刷题页面
│   ├── recommendation/     # 推荐页面
│   ├── profile/            # 画像页面
│   └── settings/           # 设置页面
├── components/             # 可复用组件
│   ├── Layout.tsx          # 布局组件（导航栏）
│   └── MathText.tsx        # 数学公式渲染组件
├── lib/                    # 工具库
│   ├── api/               # API 客户端
│   │   └── client.ts      # Axios 封装
│   └── store/             # 状态管理
│       └── appStore.ts     # 应用配置状态
├── types/                  # TypeScript 类型定义
│   └── index.ts           # 数据模型类型
└── public/                # 静态资源
```

## 数据流

### API 调用流程

```
组件 → API Client → 后端 API → 响应处理 → 状态更新 → UI 更新
```

### 状态管理

- **Zustand Store**: 管理应用配置（学生ID、服务器地址、主题等）
- **组件状态**: 使用 React Hooks 管理局部状态
- **服务端状态**: 通过 API Client 直接获取，不缓存

## 核心功能

### 1. 刷题功能

- 题目筛选（主题、难度）
- 答题交互（选择题、填空题）
- 答案提交和反馈
- 解析展示

### 2. 智能推荐

- 三种推荐模式：
  - 薄弱知识点模式
  - 综合训练模式
  - 考前冲刺模式
- 基于学习画像的个性化推荐

### 3. 学习画像

- 预测考试分数
- 知识点掌握度分析
- 难度正确率统计
- 薄弱点识别

### 4. 设置管理

- 学生ID配置
- 服务器地址配置
- 主题切换
- 离线模式

## API 集成

### API Client 设计

- 单例模式
- 自动处理错误
- 请求/响应拦截器
- 配置持久化

### 主要接口

- `GET /api/questions/stats` - 题库统计
- `GET /api/questions/{questionId}` - 获取题目
- `POST /api/answers/submit` - 提交答案
- `GET /api/student/{studentId}/profile` - 学生画像
- `POST /api/student/recommend` - 个性化推荐

## 样式系统

### Tailwind CSS

- 使用 Tailwind 工具类
- 支持深色模式（`dark:` 前缀）
- 响应式设计（移动优先）

### 主题配置

- 主色调：蓝色（primary）
- 支持浅色/深色主题切换
- 配置在 `tailwind.config.ts`

## 性能优化

### Next.js 优化

- 自动代码分割
- 图片优化
- 字体优化
- 静态生成（如适用）

### 前端优化

- 组件懒加载
- 数学公式按需渲染
- 状态管理优化

## 部署

### 构建

```bash
npm run build
```

### 部署平台

- **Vercel**（推荐）：自动部署，零配置
- **Netlify**：类似 Vercel
- **自建服务器**：使用 `npm start`

## 开发规范

### 代码风格

- 使用 Prettier 格式化
- 遵循 ESLint 规则
- TypeScript 严格模式

### 提交规范

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

## 未来规划

- [ ] 添加单元测试
- [ ] 添加 E2E 测试
- [ ] 实现离线缓存
- [ ] 添加 PWA 支持
- [ ] 性能监控
- [ ] 错误追踪
