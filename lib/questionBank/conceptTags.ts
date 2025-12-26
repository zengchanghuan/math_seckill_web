/**
 * 专升本高数核心知识点枚举表
 * 基于广东专升本考纲的15个必考知识点整理
 * 总计43个知识点，分7大模块，适合知识图谱分层展示
 */

export const CONCEPT_TAGS = {
  // ========== 模块1：函数与极限 (6个) ==========
  'func-basic': '函数基本性质',
  'func-composite': '复合函数',
  'limit-calculation': '极限计算(六种方法)', // 必考1
  'limit-special': '特殊极限',
  'limit-continuous': '连续性',
  'limit-asymptote': '渐近线',

  // ========== 模块2：导数与微分 - 规则层 (9个) ==========
  'deriv-definition': '导数定义',
  'deriv-calculation': '导数与微分计算', // 必考2
  'deriv-chain': '链式法则',
  'deriv-implicit': '隐函数求导公式', // 必考4
  'deriv-parametric': '参数方程求导',
  'deriv-higher': '高阶导数',
  'deriv-tangent': '切线方程', // 必考5
  differential: '微分',
  'multi-partial-calc': '偏导数与全微分计算', // 必考3

  // ========== 模块3：导数应用 - 应用层 (5个) ==========
  'deriv-monotone-extreme': '单调区间与极值', // 必考6
  'deriv-concave-inflection': '凹凸区间与拐点', // 必考7
  'deriv-curve': '曲线渐近线',
  'deriv-optimization': '实际应用优化',
  'multi-extreme': '多元函数极值',

  // ========== 模块4：积分 (11个) ==========
  // 不定积分 (5个)
  'integ-primitive': '原函数与不定积分', // 必考8
  'integ-substitution': '换元积分法', // 必考9
  'integ-parts': '分部积分法', // 必考9
  'integ-by-diff': '凑微分法', // 必考9
  'integ-rational': '有理函数积分',
  // 定积分 (6个)
  'integ-definite': '定积分计算', // 必考10
  'integ-piecewise': '分段函数定积分', // 必考10
  'integ-symmetry': '定积分对称性(偶倍奇零)', // 必考10
  'integ-area': '平面图形面积', // 必考11
  'integ-volume': '旋转体体积', // 必考11
  'integ-arc-length': '弧长', // 必考11

  // ========== 模块5：多元函数与二重积分 (4个) ==========
  'multi-double-integral': '二重积分计算', // 必考13
  'multi-integral-order': '二次积分换序', // 必考12
  'multi-polar-coord': '极坐标二重积分', // 必考13
  'multi-coord-transform': '坐标变换', // 必考12

  // ========== 模块6：微分方程 (5个) ==========
  'de-separable': '可分离变量型', // 必考14
  'de-homogeneous': '一阶齐次微分方程', // 必考14
  'de-linear': '一阶线性微分方程', // 必考14
  'de-second-order': '二阶齐次微分方程', // 必考14
  'de-application': '微分方程应用',

  // ========== 模块7：级数 (3个) ==========
  'series-convergence': '级数判敛', // 必考15
  'series-comparison': '级数比较判别法', // 必考15
  'series-ratio': '级数比值/根值判别法', // 必考15
} as const;

export type ConceptTag = keyof typeof CONCEPT_TAGS;

/**
 * 知识点先修关系映射
 * 基于广东专升本考纲的前置知识体系
 */
export const CONCEPT_PREREQ_MAP: Partial<Record<ConceptTag, ConceptTag[]>> = {
  // 极限相关
  'func-composite': ['func-basic'],
  'limit-special': ['limit-calculation'],

  // 导数相关
  'deriv-chain': ['deriv-calculation', 'func-composite'],
  'deriv-implicit': ['deriv-chain'],
  'deriv-parametric': ['deriv-chain'],
  'deriv-tangent': ['deriv-calculation'],
  'deriv-higher': ['deriv-calculation'],
  'multi-partial-calc': ['deriv-calculation'],

  // 导数应用
  'deriv-monotone-extreme': ['deriv-calculation'],
  'deriv-concave-inflection': ['deriv-higher'],
  'multi-extreme': ['multi-partial-calc'],

  // 不定积分
  'integ-substitution': ['integ-primitive'],
  'integ-parts': ['integ-primitive'],
  'integ-by-diff': ['integ-primitive'],
  'integ-rational': ['integ-substitution'],

  // 定积分
  'integ-definite': ['integ-primitive'],
  'integ-piecewise': ['integ-definite'],
  'integ-symmetry': ['integ-definite'],
  'integ-area': ['integ-definite'],
  'integ-volume': ['integ-definite'],
  'integ-arc-length': ['integ-definite'],

  // 二重积分
  'multi-double-integral': ['integ-definite', 'multi-partial-calc'],
  'multi-integral-order': ['multi-double-integral'],
  'multi-polar-coord': ['multi-double-integral'],
  'multi-coord-transform': ['multi-double-integral'],

  // 微分方程
  'de-homogeneous': ['de-separable'],
  'de-linear': ['de-separable'],
  'de-second-order': ['de-linear'],

  // 级数
  'series-comparison': ['series-convergence'],
  'series-ratio': ['series-convergence'],
};

/**
 * 题型映射（从section_name到标准题型）
 */
export const SECTION_TYPE_MAP: Record<string, 'choice' | 'fill' | 'solution'> =
  {
    选择题: 'choice',
    单项选择题: 'choice',
    单选题: 'choice',
    填空题: 'fill',
    计算题: 'solution',
    应用题: 'solution',
    证明题: 'solution',
    综合题: 'solution',
    解答题: 'solution',
  };

/**
 * Question ID 规范
 * 格式: {省份缩写}-{年份}-{试卷编号}-{题号}
 * 示例: GD-2024-S1-Q01
 */
export function generateQuestionId(
  province: string,
  year: number,
  paperNum: number,
  questionNum: number
): string {
  const provinceMap: Record<string, string> = {
    广东: 'GD',
    广东省: 'GD',
    江苏: 'JS',
    江苏省: 'JS',
    浙江: 'ZJ',
    浙江省: 'ZJ',
    山东: 'SD',
    山东省: 'SD',
    河南: 'HEN', // Henan
    河南省: 'HEN',
    四川: 'SC',
    四川省: 'SC',
    湖北: 'HUB', // Hubei
    湖北省: 'HUB',
    湖南: 'HUN', // Hunan
    湖南省: 'HUN',
    福建: 'FJ',
    福建省: 'FJ',
    安徽: 'AH',
    安徽省: 'AH',
    江西: 'JX',
    江西省: 'JX',
  };

  const provinceCode = provinceMap[province] || 'XX';
  const paperCode = `S${paperNum}`;
  const questionCode = `Q${questionNum.toString().padStart(2, '0')}`;

  return `${provinceCode}-${year}-${paperCode}-${questionCode}`;
}

/**
 * 解析Question ID
 */
export function parseQuestionId(questionId: string): {
  province: string;
  year: number;
  paperNum: number;
  questionNum: number;
} | null {
  const match = questionId.match(/^([A-Z]+)-(\d{4})-S(\d+)-Q(\d+)$/);
  if (!match) return null;

  return {
    province: match[1],
    year: parseInt(match[2]),
    paperNum: parseInt(match[3]),
    questionNum: parseInt(match[4]),
  };
}
