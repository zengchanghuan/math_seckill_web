# 题库元数据标注系统

## 概述

为题库中的每道题目自动生成并持久化元数据，包括知识点、难度、预估用时等，支持智能抽题和个性化训练。

## 核心功能

### 1. 知识点枚举表 (43个核心概念)

基于广东专升本考纲的15个必考知识点 + 常考点整理：

```typescript
// lib/questionBank/conceptTags.ts
export const CONCEPT_TAGS = {
  // 函数与极限 (6)
  'func-basic': '函数基本性质',
  'func-composite': '复合函数',
  'limit-calculation': '极限计算(六种方法)', // 必考1
  'limit-special': '特殊极限',
  'limit-continuous': '连续性',
  'limit-asymptote': '渐近线',
  
  // 导数与微分 (9)
  'deriv-definition': '导数定义',
  'deriv-calculation': '导数与微分计算', // 必考2
  'deriv-chain': '链式法则',
  'deriv-implicit': '隐函数求导公式', // 必考4
  'deriv-parametric': '参数方程求导',
  'deriv-higher': '高阶导数',
  'deriv-tangent': '切线方程', // 必考5
  'differential': '微分',
  'multi-partial-calc': '偏导数与全微分计算', // 必考3
  
  // 导数应用 (5)
  'deriv-monotone-extreme': '单调区间与极值', // 必考6
  'deriv-concave-inflection': '凹凸区间与拐点', // 必考7
  'deriv-curve': '曲线渐近线',
  'deriv-optimization': '实际应用优化',
  'multi-extreme': '多元函数极值',
  
  // 不定积分 (5) - 必考8/9
  'integ-primitive': '原函数与不定积分', // 必考8
  'integ-substitution': '换元积分法', // 必考9
  'integ-parts': '分部积分法', // 必考9
  'integ-by-diff': '凑微分法', // 必考9
  'integ-rational': '有理函数积分',
  
  // 定积分 (6) - 必考10/11
  'integ-definite': '定积分计算', // 必考10
  'integ-piecewise': '分段函数定积分', // 必考10
  'integ-symmetry': '定积分对称性(偶倍奇零)', // 必考10
  'integ-area': '平面图形面积', // 必考11
  'integ-volume': '旋转体体积', // 必考11
  'integ-arc-length': '弧长', // 必考11
  
  // 二重积分 (4) - 必考12/13
  'multi-double-integral': '二重积分计算', // 必考13
  'multi-integral-order': '二次积分换序', // 必考12
  'multi-polar-coord': '极坐标二重积分', // 必考13
  'multi-coord-transform': '坐标变换', // 必考12
  
  // 微分方程 (5) - 必考14
  'de-separable': '可分离变量型', // 必考14
  'de-homogeneous': '一阶齐次微分方程', // 必考14
  'de-linear': '一阶线性微分方程', // 必考14
  'de-second-order': '二阶齐次微分方程', // 必考14
  'de-application': '微分方程应用',
  
  // 级数 (3) - 必考15
  'series-convergence': '级数判敛', // 必考15
  'series-comparison': '级数比较判别法', // 必考15
  'series-ratio': '级数比值/根值判别法', // 必考15
};
```

### 2. Question ID 规范

**格式**: `{省份}-{年份}-{试卷}-{题号}`

**示例**:
- `GD-2024-S1-Q01` (广东2024年第1套第1题)
- `JS-2023-S1-Q15` (江苏2023年第1套第15题)
- `HEN-2024-S1-Q08` (河南2024年第1套第8题)
- `HUN-2024-S1-Q12` (湖南2024年第1套第12题)

**省份码对照表**:
| 省份 | 省份码 | 省份 | 省份码 |
|------|--------|------|--------|
| 广东 | GD | 江苏 | JS |
| 浙江 | ZJ | 山东 | SD |
| 河南 | HEN | 四川 | SC |
| 湖北 | HUB | 湖南 | HUN |
| 福建 | FJ | 安徽 | AH |
| 江西 | JX | 其他 | XX |

### 3. 元数据结构

```typescript
interface QuestionMetadata {
  questionId: string;           // GD-2024-S1-Q01
  conceptTags: ConceptTag[];    // 1-3个核心知识点
  prereqTags: ConceptTag[];     // 0-3个先修知识点
  difficulty: 1 | 2 | 3 | 4 | 5; // 难度等级
  timeEstimateSec: number;      // 预估用时(秒)
  skills: string[];             // ['计算', '理解', '应用']
  confidence: number;           // 标注置信度 0-1
  needsReview: boolean;         // 是否需要人工复审
  
  // 一致性校验
  annotationVersion: number;
  annotatedAt: number;
  consistencyCheck: {
    attempt1: any;
    attempt2: any;
    consistent: boolean;
  };
}
```

### 4. JSON扩展结构

**原始JSON保持不变，仅在每个question中新增`metadata`字段**:

```json
{
  "meta": {
    "year": 2024,
    "province": "广东",
    "total_questions": 25,
    "annotated_at": 1703299200000,
    "annotation_version": 1
  },
  "paper": {
    "sections": [
      {
        "section_name": "选择题",
        "questions": [
          {
            "question_num": 1,
            "content": "...",
            "answer": "...",
            "images": [...],
            "metadata": {
              "questionId": "GD-2024-S1-Q01",
              "conceptTags": ["limit-basic", "deriv-chain"],
              "prereqTags": ["func-basic"],
              "difficulty": 3,
              "timeEstimateSec": 120,
              "skills": ["计算", "推理"],
              "confidence": 0.95,
              "needsReview": false,
              "annotationVersion": 1,
              "annotatedAt": 1703299200000,
              "consistencyCheck": {...}
            }
          }
        ]
      }
    ]
  }
}
```

## 使用流程

### Step 1: 启动开发服务器

```bash
npm run dev
```

### Step 2: 标注题库

```bash
# 标注2024年题库
python scripts/annotate_question_bank.py --year 2024

# 自定义批次大小（默认5题/批）
python scripts/annotate_question_bank.py --year 2024 --batch-size 3
```

**标注流程**:
1. 读取 `public/papers/广东_高数_2024.json`
2. 对每道题调用DeepSeek API两次（温度0.1和0.15）
3. 进行一致性校验
4. 将元数据写回JSON（自动备份原文件）

### Step 3: 查询题库

#### 前端调用示例

```typescript
// 通用查询
const response = await fetch('/api/question-bank/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'query',
    params: {
      conceptTags: ['limit-basic', 'deriv-chain'],
      difficulty: [2, 4],
      questionType: 'choice',
      excludeIds: ['GD-2024-S1-Q01'],
      limit: 10,
      orderBy: 'random'
    }
  })
});

// Day训练抽题
const response = await fetch('/api/question-bank/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'day-training',
    params: {
      weaknessConcepts: ['limit-basic', 'deriv-chain'],
      targetDifficulty: [2, 3],
      questionCount: 10,
      excludeIds: ['GD-2024-S1-Q01'],
      preferRealExam: true
    }
  })
});

// 获取统计
const response = await fetch('/api/question-bank/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'stats'
  })
});
```

## 关键约束

### 1. DeepSeek标注一致性校验

- **两次低温度调用**: temperature=0.1 和 0.15
- **一致性判定**:
  - 核心知识点至少50%重合
  - 难度相差≤1
  - 用时相差≤30%
- **不一致处理**: `needsReview=true`，需人工复审

### 2. 缓存机制

- 所有标注结果持久化到JSON
- 运行时抽题**零Token消耗**
- 标注版本化：修改prompt时递增`ANNOTATION_VERSION`

### 3. 查询性能

- 内存索引：按知识点、难度、题型建立Map
- 支持多维度组合过滤
- Fisher-Yates洗牌算法保证随机性

## API接口

### POST /api/question-bank/annotate

**单题标注**:
```json
{
  "mode": "single",
  "questions": [{
    "questionNum": 1,
    "content": "...",
    "answer": "...",
    "sectionName": "选择题"
  }],
  "meta": {
    "year": 2024,
    "province": "广东"
  }
}
```

**批量标注**:
```json
{
  "mode": "batch",
  "questions": [...],
  "meta": {...}
}
```

### POST /api/question-bank/query

**通用查询**:
```json
{
  "mode": "query",
  "params": {
    "conceptTags": ["limit-basic"],
    "difficulty": [2, 4],
    "limit": 10
  }
}
```

**Day训练抽题**:
```json
{
  "mode": "day-training",
  "params": {
    "weaknessConcepts": ["limit-basic"],
    "targetDifficulty": [2, 3],
    "questionCount": 10
  }
}
```

**统计信息**:
```json
{
  "mode": "stats"
}
```

## 文件清单

```
lib/questionBank/
├── conceptTags.ts          # 知识点枚举表
├── types.ts                # 类型定义
├── annotationService.ts    # DeepSeek标注服务
└── queryEngine.ts          # 查询引擎

app/api/question-bank/
├── annotate/route.ts       # 标注API
└── query/route.ts          # 查询API

scripts/
└── annotate_question_bank.py  # 批量标注脚本
```

## 后续优化

1. **IndexedDB存储**: 题库量大时移到客户端数据库
2. **增量标注**: 只标注新增题目
3. **人工复审界面**: 处理`needsReview=true`的题目
4. **统计看板**: 可视化题库分布
5. **A/B测试**: 优化prompt版本

## 注意事项

⚠️ **第一次标注会消耗大量Token**（每题约2次API调用）  
⚠️ **建议分批标注**，避免API限流  
⚠️ **自动备份原JSON**，标注前会创建`.backup.json`



