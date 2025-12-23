# LaTeX 积分上下限显示修复 - 对比说明

## 修复前 vs 修复后对比

### 问题示例：2023年第4题

**题干文本：**
```
设 $2x$ 是 $f(x)$ 的一个原函数，则 $\int_0^{\frac{\pi}{2}}[f(x) - \sin x]dx = $ ()
```

---

## ❌ 修复前（问题现象）

### LaTeX 处理：
```latex
\int\limits_0^{\frac{\pi}{2}}[f(x) - \sin x]dx
```

### 渲染效果：
```
设 2x 是 f(x) 的一个原函数，则 ∫[f(x) - sin x]dx = ()
                                    ⁽ᵖⁱ/²⁾
                                     ₀
```

### 问题：
1. **行高被撑开**：积分号的上下限垂直堆叠，导致整行高度异常增加
2. **基线不对齐**：积分符号与中文基线错位
3. **视觉别扭**：行内公式使用了 display 样式

### 原因分析：
```typescript
// lib/latexUtils.ts (旧代码)
.replace(/\\int(?![a-zA-Z])/g, '\\int\\limits');
//                                      ^^^^^^^ 
// 强制添加 \limits，导致行内也上下堆叠
```

---

## ✅ 修复后（正常显示）

### LaTeX 处理（行内）：
```latex
\int_0^{\tfrac{\pi}{2}}[f(x) - \sin x]dx
```
（注意：行内不添加 `\limits`，分数使用 `\tfrac` 更紧凑）

### 渲染效果：
```
设 2x 是 f(x) 的一个原函数，则 ∫₀^(π/2)[f(x) - sin x]dx = ()
```

### 改进：
1. **行高正常**：积分上下标在右侧，不撑开行高
2. **基线对齐**：与中文自然对齐
3. **紧凑美观**：使用 `\tfrac` 让分数更紧凑

### 核心修复代码：

#### 1. `lib/latexUtils.ts`
```typescript
export function fixLatexLimits(latex: string, isInline: boolean = true): string {
  let result = latex;
  
  // 极限、求和：始终添加 \limits
  result = result
    .replace(/\\lim(?![a-zA-Z])/g, '\\lim\\limits')
    .replace(/\\sum(?![a-zA-Z])/g, '\\sum\\limits');
  
  // 积分：只在块级公式中添加 \limits
  if (!isInline) {
    result = result.replace(/\\int(?![a-zA-Z])/g, '\\int\\limits');
  }
  // ✅ 行内积分：保持默认（上下标在右侧）
  
  // 行内分数优化
  if (isInline) {
    result = result.replace(/\\frac(?=\{[^{}]{1,10}\}\{[^{}]{1,10}\})/g, '\\tfrac');
  }
  
  return result;
}
```

#### 2. `components/MathText.tsx`
```typescript
const processedContent = fixLatexLimits(part.content, !part.display);
//                                                     ^^^^^^^^^^^^
//                                                     关键：传递 isInline 参数
return part.display ? (
  <BlockMath key={index} math={processedContent} />  // 块级：\int\limits
) : (
  <InlineMath key={index} math={processedContent} /> // 行内：\int（不加limits）
);
```

#### 3. `app/globals.css`
```css
/* 行内公式基线对齐 */
.katex {
  vertical-align: baseline;
}

/* 积分号微调 */
.katex .mop {
  vertical-align: -0.2em;
}

/* 块级公式减小间距 */
.katex-display {
  margin: 0.5em 0;
}
```

---

## 块级公式仍保持 display 样式

如果使用 `$$...$$` 包裹（块级公式）：

```latex
$$
\int_0^{\frac{\pi}{2}}[f(x) - \sin x]dx
$$
```

渲染效果：
```
        π/2
         ∫  [f(x) - sin x]dx
        0
```
（上下限在积分号上下 ✓）

---

## 验收标准对照

| 标准 | 状态 |
|------|------|
| 1️⃣ 行内公式积分上下限在右侧/下侧 | ✅ 完成 |
| 2️⃣ 整行不被异常撑高 | ✅ 完成 |
| 3️⃣ 基线与中文对齐自然 | ✅ 完成 |
| 4️⃣ 块级公式保持 display 样式 | ✅ 完成 |
| 5️⃣ 上限 π/2 紧凑显示 | ✅ 完成（使用 \tfrac）|

---

## 其他题目测试

### 极限（始终上下堆叠 ✓）
```
$\lim_{x\to 0}(2^x +1) = 2$
```
渲染：lim (2ˣ + 1) = 2
     x→0

### 求和（始终上下堆叠 ✓）
```
$\sum_{n=1}^{\infty}u_n$
```
渲染：  ∞
      Σ  uₙ
     n=1

---

## 总结

✅ **核心修复**：区分行内/块级，行内积分不添加 `\limits`
✅ **附加优化**：行内分数使用 `\tfrac`，CSS 微调基线
✅ **兼容性**：不影响其他题目和块级公式

修复文件：
- `lib/latexUtils.ts`
- `components/MathText.tsx`
- `app/globals.css`
- `app/practice/[paperId]/components/QuestionArea.tsx`


