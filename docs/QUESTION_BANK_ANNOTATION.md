# 题库元数据标注系统 (v2.0)

## 🎯 核心升级

引入 **ConceptConfig** 结构，为每个知识点增加：
- **aliases** (触发词/同义词)：提高 AI 识别准确率
- **notes** (判定口径)：统一标注标准
- **module** (所属模块)：支持知识图谱分层

---

## 📚 知识点体系 (41个核心概念)

### 模块1：函数与极限 (5个)
- `func-basic`: 函数基本性质 [触发词: 定义域, 值域, 奇偶性...]
- `func-composite`: 复合函数
- `limit-calculation`: 极限计算(六种方法) **(必考)** [触发词: 洛必达, 等价无穷小...]
- `limit-special`: 特殊极限
- `limit-continuous`: 连续性

### 模块2：导数与微分 - 规则层 (8个)
- `deriv-definition`: 导数定义
- `deriv-calculation`: 导数与微分计算 **(必考)**
- `deriv-chain`: 链式法则
- `deriv-implicit`: 隐函数求导公式 **(必考)**
- `deriv-parametric`: 参数方程求导
- `deriv-higher`: 高阶导数
- `deriv-tangent`: 切线方程 **(必考)**
- `multi-partial-calc`: 偏导数与全微分计算 **(必考)**

### 模块3：导数应用 - 应用层 (5个)
- `deriv-monotone-extreme`: 单调区间与极值 **(必考)**
- `deriv-concave-inflection`: 凹凸区间与拐点 **(必考)**
- `func-asymptote`: 渐近线(水平/垂直/斜)
- `deriv-optimization`: 实际应用优化
- `multi-extreme`: 多元函数极值

### 模块4：积分 (11个)
- `integ-primitive`: 原函数与不定积分 **(必考)**
- `integ-substitution`: 换元积分法 **(必考)**
- `integ-parts`: 分部积分法 **(必考)**
- `integ-by-diff`: 凑微分法 **(必考)**
- `integ-rational`: 有理函数积分
- `integ-definite`: 定积分计算 **(必考)**
- `integ-piecewise`: 分段函数定积分 **(必考)**
- `integ-symmetry`: 定积分对称性 **(必考)**
- `integ-area`: 平面图形面积 **(必考)**
- `integ-volume`: 旋转体体积 **(必考)**
- `integ-arc-length`: 弧长 **(必考)**

### 模块5：多元函数与二重积分 (4个)
- `multi-double-integral`: 二重积分计算 **(必考)**
- `multi-integral-order`: 二次积分换序 **(必考)**
- `multi-polar-coord`: 极坐标二重积分 **(必考)**
- `multi-coord-transform`: 坐标变换 **(必考)**

### 模块6：微分方程 (5个)
- `de-separable`: 可分离变量型 **(必考)**
- `de-homogeneous`: 一阶齐次微分方程 **(必考)**
- `de-linear`: 一阶线性微分方程 **(必考)**
- `de-second-order`: 二阶齐次微分方程 **(必考)**
- `de-application`: 微分方程应用

### 模块7：级数 (3个)
- `series-convergence`: 级数判敛 **(必考)**
- `series-comparison`: 级数比较判别法 **(必考)**
- `series-ratio`: 级数比值/根值判别法 **(必考)**

---

## 🔧 AI Prompt 优化

不再只给 Key: Label，而是生成更详细的指令：

```
limit-calculation: 极限计算(六种方法) [触发词: 洛必达, 等价无穷小, 泰勒公式, 两个重要极限, 有理化, 夹逼准则]
   (判定: 所有直接求极限的计算题，包括各种未定式)
```

**优势**：
1. **消除歧义**：通过 aliases 和 notes 明确边界
2. **提高一致性**：AI 有了明确的判定标准
3. **增强召回**：同义词帮助 AI 识别隐式考点

---

## 📊 使用方式

### 标注
```bash
python scripts/annotate_question_bank.py --year 2024
```

### 查询
代码会自动适配新的结构，查询逻辑不变。

### 扩展
只需在 `lib/questionBank/conceptTags.ts` 中添加新的配置对象即可。
