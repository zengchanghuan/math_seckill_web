# 填空题转选择题系统

## 功能概述

将高等数学填空题自动转换为4选1的单选题，使用DeepSeek AI生成合理的干扰项。

## 核心特性

### 1. 智能命题
- ✅ 自动生成3个"看起来合理"的干扰项
- ✅ 干扰项基于典型错误：漏系数、符号错、公式误用等
- ✅ 避免等价答案（如 π/6 与 30°）
- ✅ 优先使用可输入表达式（避免LaTeX）

### 2. 严格验证
- ✅ 唯一正确性检查
- ✅ 选项等价性检测（字符串归一化、数值比较）
- ✅ 常见等价形式识别（角度、根号、分数）
- ✅ 生成详细验证报告

### 3. 自检机制
- ✅ DeepSeek自带唯一性检查策略
- ✅ 每个干扰项标注错误类型
- ✅ 等价风险提示
- ✅ 前端二次验证

## 使用方式

### 方式1：API调用

```typescript
// POST /api/convert-to-choice
const response = await fetch('/api/convert-to-choice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stem: '已知 $y = \\ln(x + 1)$，则 $dy = $ ____',
    answer: '$\\frac{1}{x + 1} dx$',
    solution: '$dy = y\' dx = \\frac{1}{x + 1} dx$',
    knowledge: ['微分运算', '基本微分公式']
  })
});

const { result } = await response.json();
```

### 方式2：Web工具页面

访问：`http://localhost:3000/tools/convert-choice`

1. 输入填空题信息
2. 点击"转换为选择题"
3. 查看生成的选项和验证报告

## API响应格式

```typescript
{
  "type": "single_choice",
  "stem": "已知 y = ln(x + 1)，则 dy = (    )",
  "options": [
    {"key":"A","text":"1/(x+1) dx","error_type":"correct"},
    {"key":"B","text":"1/x dx","error_type":"漏掉+1"},
    {"key":"C","text":"1/(x+1)","error_type":"漏掉dx"},
    {"key":"D","text":"-1/(x+1) dx","error_type":"符号错误"}
  ],
  "correct_key": "A",
  "correct_text": "1/(x+1) dx",
  "normalize_answer": "1/(x+1)dx",
  "distractor_rationales": [
    {"key":"A","why_wrong_or_right":"正确答案"},
    {"key":"B","why_wrong_or_right":"忘记链式法则的内函数导数"},
    {"key":"C","why_wrong_or_right":"只求导数，忘记乘dx"},
    {"key":"D","why_wrong_or_right":"符号弄反"}
  ],
  "uniqueness_check": {
    "strategy": "避免等价写法 + 数学归一化检查",
    "equivalence_risks": ["分数/小数混淆", "dx位置"],
    "passed": true
  }
}
```

## 验证报告

系统会自动生成验证报告，检查：

1. **选项等价性**
   - 字符串归一化比较
   - 数值近似比较
   - 常见等价形式检测

2. **干扰项合理性**
   - 是否标注错误类型
   - 是否过于明显

3. **唯一性检查**
   - DeepSeek自检是否通过
   - 等价风险是否存在

## 典型错误类型库

系统识别以下典型错误：

- **漏系数**：忘记常数倍数
- **符号错**：正负号弄反
- **代换错**：变量替换错误
- **公式误用**：套用错误公式
- **三角恒等变形错**：三角函数转换错误
- **分母漏项**：分母中漏掉变量
- **求导错误**：导数法则用错
- **积分错误**：积分公式用错

## 文件结构

```
app/
├── api/
│   └── convert-to-choice/
│       └── route.ts          # API路由
├── tools/
│   └── convert-choice/
│       └── page.tsx          # Web工具页面
lib/
└── assessment/
    └── choiceValidator.ts    # 验证工具
types/
└── index.ts                  # 类型定义
```

## 环境变量

```env
DEEPSEEK_API_KEY=your_api_key_here
```

## 注意事项

1. **API调用限制**：DeepSeek API有频率限制，建议添加缓存
2. **验证报告**：始终检查验证报告，确保选项质量
3. **人工审核**：AI生成的题目建议人工审核后再使用
4. **LaTeX处理**：输入可以包含LaTeX，但输出优先使用普通表达式

## 示例

### 输入
```
题干: 已知 $f(x) = e^{2x}$，则 $f'(x) = $ ____
答案: $2e^{2x}$
知识点: 复合函数求导
```

### 输出
```
题干: 已知 f(x) = e^(2x)，则 f'(x) = (    )
选项:
A. 2e^(2x)      ✓ 正确
B. e^(2x)       漏系数2
C. 2e^x         指数错误
D. e^(2x+1)     加法错误
```

## 未来优化

- [ ] 添加题目难度评估
- [ ] 支持批量转换
- [ ] 添加题目缓存机制
- [ ] 支持自定义干扰项策略
- [ ] 集成到测评系统题库

