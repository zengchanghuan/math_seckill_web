# 题库元数据标注系统 - 快速开始

## 🚀 5分钟快速验证

### Step 1: 启动开发服务器

```bash
cd /Users/zengchanghuan/Desktop/workspace/flutter/math_seckill_web
npm run dev
```

等待服务器启动完成（通常在 http://localhost:3000）

---

### Step 2: 测试单题标注

在**新终端**运行：

```bash
python scripts/test_annotation.py
```

**预期结果**：
```json
{
  "questionId": "GD-2024-S1-Q01",
  "conceptTags": ["deriv-basic"],
  "prereqTags": ["func-basic"],
  "difficulty": 2,
  "timeEstimateSec": 60,
  "skills": ["计算"],
  "confidence": 0.95,
  "needsReview": false,
  "consistencyCheck": {
    "consistent": true
  }
}
```

✅ 如果看到以上输出，说明标注系统正常工作！

---

### Step 3: 批量标注题库（可选）

⚠️ **注意**：这会消耗大量Token（每题约2次DeepSeek调用）

```bash
# 标注2024年题库（假设有25题，约需5分钟）
python scripts/annotate_question_bank.py --year 2024 --batch-size 3

# 或者先标注前5题测试
# 手动编辑脚本添加limit参数
```

**自动功能**：
- ✅ 备份原JSON到 `.backup.json`
- ✅ 跳过已标注题目
- ✅ 显示实时进度
- ✅ 保存到原JSON文件

---

## 📊 验证标注结果

### 方法1: 查看JSON文件

```bash
cat public/papers/广东_高数_2024.json | jq '.paper.sections[0].questions[0].metadata'
```

### 方法2: 调用查询API

在浏览器Console或新建测试页面：

```javascript
// 获取统计信息
fetch('/api/question-bank/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: 'stats' })
})
.then(r => r.json())
.then(console.log);

// 查询"极限"相关的中等难度题目
fetch('/api/question-bank/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'query',
    params: {
      conceptTags: ['limit-basic'],
      difficulty: [2, 4],
      limit: 5
    }
  })
})
.then(r => r.json())
.then(console.log);
```

---

## 🎯 接入Day训练页

修改 `data/assessmentSets.ts`:

```typescript
import { questionBank } from '@/lib/questionBank/queryEngine';

/**
 * 获取Day N的训练题目（智能抽题）
 */
export async function getDayItems(
  planId: string,
  day: number,
  userWeakness: ConceptTag[]
): Promise<string[]> {
  const questions = questionBank.queryForDayTraining({
    weaknessConcepts: userWeakness,
    targetDifficulty: [2, 3],
    questionCount: 10,
    excludeIds: [], // 从localStorage读取已做题目
    preferRealExam: true
  });

  return questions.map(q => q.metadata.questionId);
}
```

---

## 🔍 知识点枚举表

30个核心概念，覆盖专升本高数：

| 分类 | 知识点 |
|------|--------|
| **函数与极限** | func-basic, func-composite, limit-basic, limit-special, limit-continuous, limit-asymptote |
| **导数与微分** | deriv-definition, deriv-basic, deriv-chain, deriv-implicit, deriv-parametric, deriv-higher, differential |
| **导数应用** | deriv-monotone, deriv-extreme, deriv-concave, deriv-curve, deriv-optimization |
| **积分** | integ-indefinite, integ-substitution, integ-parts, integ-rational, integ-definite, integ-improper, integ-application, integ-geometry |
| **微分方程** | de-first-order, de-second-order, de-application |
| **多元函数** | multi-partial, multi-extreme, multi-double-integral, multi-application |
| **级数** | series-number, series-power |

---

## ⚠️ 常见问题

### Q1: DeepSeek API超时
**A**: 减小批次大小 `--batch-size 2` 或增加timeout时间

### Q2: 标注一致性低
**A**: 检查 `needsReview=true` 的题目，可能需要人工复审

### Q3: 题库查询返回空
**A**: 确保已完成标注，检查 `metadata` 字段是否存在

### Q4: Question ID重复
**A**: 检查 `generateQuestionId` 的参数，确保年份/题号正确

---

## 📈 后续集成建议

1. **测评报告页**：根据用户薄弱点推荐知识点
2. **Day训练页**：调用 `queryForDayTraining` 智能抽题
3. **统计看板**：展示题库知识点分布
4. **人工复审**：筛选 `needsReview=true` 的题目

---

## 🎉 完成！

现在你可以：
- ✅ 自动标注题库元数据
- ✅ 按知识点/难度/题型智能抽题
- ✅ 零运行时Token消耗
- ✅ 支持Day训练个性化路线

详细文档见: `docs/QUESTION_BANK_ANNOTATION.md`

