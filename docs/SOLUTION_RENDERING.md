# 数学解析排版优化方案

## 📐 设计目标

打造一个**阅读舒适、层次清晰、公式优雅**的数学解析页面，让学生能够快速扫读理解题解思路。

---

## 🎨 实现的核心功能

### 1. **限制行宽 + 居中布局**
```tsx
// SolutionPanel.tsx
<div className="max-w-3xl mx-auto">  // 最大宽度 48rem (768px)
  <div className="px-6 py-5 md:px-8 md:py-6">  // 移动端/桌面端自适应内边距
    {/* 内容 */}
  </div>
</div>
```

**效果**：
- 桌面端：内容宽度限制在 768px，左右自动留白
- 移动端：自适应屏幕宽度，保持合适的内边距
- 文字不会过长，提升可读性

---

### 2. **分层结构设计**

#### 标题层级
```tsx
{/* 【精析】徽标 */}
<span className="inline-flex items-center px-3 py-1.5 
  bg-gradient-to-r from-primary-500 to-primary-600 
  text-white rounded-md text-sm font-semibold shadow-sm">
  精析
</span>

{/* 参考解答标题 */}
<h3 className="text-lg font-bold text-blue-700">
  📖 参考解答
</h3>
```

#### 小题编号识别
```tsx
// FormattedSolution.tsx 自动识别 (1)(2) 或 （1）（2）
const hasSubQuestions = /[（(]\d+[）)]/.test(content);

// 渲染为带编号的分块
<div className="pl-6 relative border-l-2 border-primary-200">
  <div className="absolute -left-[1px] top-0 
    bg-primary-100 text-primary-700 px-2 py-0.5 rounded-r">
    (1)
  </div>
  <div className="pt-7">
    {/* 小题内容 */}
  </div>
</div>
```

**效果**：
- (1)(2) 编号以醒目的标签形式显示在左侧
- 每个小题有独立的缩进和边框
- 编号左对齐，正文对齐

---

### 3. **智能公式渲染**

#### 判断逻辑
```typescript
// MathText.tsx - shouldBeDisplayMode()
const shouldBeDisplayMode = (latex: string): boolean => {
  // 规则1: 多个等号（≥2个等号）
  const equalsCount = (latex.match(/=/g) || []).length;
  if (equalsCount >= 2) return true;
  
  // 规则2: 包含积分/求和/乘积
  if (/\\int|\\sum|\\prod/.test(latex)) return true;
  
  // 规则3: 复杂分式（嵌套或长分式）
  const fracMatch = latex.match(/\\frac/g);
  if (fracMatch && fracMatch.length >= 2) return true;
  if (/\\frac\{[^}]{15,}\}/.test(latex)) return true;
  
  // 规则4: 长公式（>60字符）
  if (latex.length > 60) return true;
  
  // 规则5: 对齐环境
  if (/\\begin\{(align|aligned|gather)\}/.test(latex)) return true;
  
  return false;
};
```

#### 规则详解

| 规则 | 触发条件 | 示例 | 原因 |
|------|----------|------|------|
| **多等号** | `=` 出现 ≥2 次 | `a = b = c` | 多步推导应独立显示 |
| **积分/求和** | 包含 `\int` `\sum` `\prod` | `∫₀¹ f(x)dx` | 上下限需要空间 |
| **复杂分式** | ≥2个 `\frac` 或长分子/分母 | `\frac{x+1}{y-2} + \frac{a}{b}` | 嵌套分式行内太挤 |
| **长公式** | LaTeX 长度 > 60 字符 | 长积分/连乘积 | 避免溢出和折行 |
| **对齐环境** | 包含 `align/aligned` | 多行对齐公式 | 必须块级显示 |

**实际效果**：
- `$f(x) = 2x + 1$` → **行内显示**
- `$\int_0^1 f(x)dx = 1$` → **块级显示** (有积分)
- `$a = b = c$` → **块级显示** (多等号)

---

### 4. **排版细节**

#### 字体和间距
```css
/* globals.css */
.prose {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', ...;
  font-size: 16px;       /* 基础字号 */
  line-height: 1.8;      /* 行高 1.8 */
  color: #374151;        /* 柔和的黑色 */
}

.prose p {
  margin-bottom: 0.875em;  /* 段落间距 14px (16px * 0.875) */
}
```

#### KaTeX 块级公式
```css
.katex-display {
  margin: 1em 0;         /* 上下间距 16px */
  padding: 0.5em 0;      /* 内边距 8px */
  overflow-x: auto;      /* 长公式可横向滚动 */
}
```

---

## 📱 响应式适配

### 桌面端（≥768px）
- 内容宽度：768px
- 左右留白：自动
- 内边距：px-8 py-6 (32px / 24px)

### 移动端（<768px）
- 内容宽度：100%
- 左右留白：无
- 内边距：px-6 py-5 (24px / 20px)

---

## 🔧 使用方式

### 1. 在解析面板中使用
```tsx
import FormattedSolution from '@/components/FormattedSolution';

<FormattedSolution content={solutionText} />
```

### 2. 启用智能公式判断
```tsx
import MathText from '@/components/MathText';

<MathText content={text} enhanced={true} />
```

### 3. 普通文本渲染
```tsx
<MathText content={text} />  // enhanced 默认为 false
```

---

## 🎯 优化效果对比

### 优化前
```
【精析】(1) f'(x)=ae^x-1，令f'(x)=0得x=-lna。当x<-lna时f'(x)<0，f(x)单调递减；当x>-lna时f'(x)>0，f(x)单调递增。(2)由(1)知...
```
- ❌ 文字公式挤在一起
- ❌ 小题编号不清晰
- ❌ 缺少视觉层次

### 优化后
```
【精析】

(1)  f'(x) = ae^x - 1，令 f'(x)=0 得 x = -ln a。
    当 x < -ln a 时 f'(x) < 0，f(x) 单调递减；
    当 x > -ln a 时 f'(x) > 0，f(x) 单调递增。

(2)  由(1)知 f(x) 在 x = -ln a 处取极小值 f(-ln a) = 1 + ln a + a。
    若 1 + ln a + a > 0，则 f(x) ≥ f(-ln a) > 0 恒成立，
    故 f(x)=0 无实根。
```
- ✅ 编号醒目，左侧标签
- ✅ 分段清晰，带缩进边框
- ✅ 公式自动换行，长公式块级显示
- ✅ 层次分明，易于扫读

---

## 📊 性能优化

- ✅ 公式懒渲染（KaTeX）
- ✅ 图片懒加载（`loading="lazy"`）
- ✅ 避免不必要的重渲染
- ✅ CSS 按需加载

---

## 🚀 未来优化方向

1. **代码高亮**：为代码块添加语法高亮
2. **公式编号**：为重要公式自动编号
3. **跳转锚点**：点击 (1)(2) 可快速定位
4. **打印优化**：优化打印样式
5. **可访问性**：添加 ARIA 标签，支持屏幕阅读器

