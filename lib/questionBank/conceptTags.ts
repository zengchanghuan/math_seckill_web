/**
 * 专升本高数核心知识点枚举表
 * 覆盖常考知识点，用于题目标注和智能抽题
 */

export const CONCEPT_TAGS = {
  // 函数与极限 (6个)
  'func-basic': '函数基本性质',
  'func-composite': '复合函数',
  'limit-basic': '极限基本运算',
  'limit-special': '特殊极限',
  'limit-continuous': '连续性',
  'limit-asymptote': '渐近线',

  // 导数与微分 (7个)
  'deriv-definition': '导数定义',
  'deriv-basic': '基本导数公式',
  'deriv-chain': '链式法则',
  'deriv-implicit': '隐函数求导',
  'deriv-parametric': '参数方程求导',
  'deriv-higher': '高阶导数',
  'differential': '微分',

  // 导数应用 (5个)
  'deriv-monotone': '单调性',
  'deriv-extreme': '极值与最值',
  'deriv-concave': '凹凸性与拐点',
  'deriv-curve': '曲线渐近线',
  'deriv-optimization': '实际应用优化',

  // 积分 (8个)
  'integ-indefinite': '不定积分基本',
  'integ-substitution': '换元积分法',
  'integ-parts': '分部积分法',
  'integ-rational': '有理函数积分',
  'integ-definite': '定积分计算',
  'integ-improper': '广义积分',
  'integ-application': '积分应用',
  'integ-geometry': '几何应用',

  // 微分方程 (3个)
  'de-first-order': '一阶微分方程',
  'de-second-order': '二阶微分方程',
  'de-application': '微分方程应用',

  // 多元函数 (4个)
  'multi-partial': '偏导数',
  'multi-extreme': '多元函数极值',
  'multi-double-integral': '二重积分',
  'multi-application': '多元函数应用',

  // 级数 (2个)
  'series-number': '数项级数',
  'series-power': '幂级数',
} as const;

export type ConceptTag = keyof typeof CONCEPT_TAGS;

/**
 * 知识点先修关系映射
 */
export const CONCEPT_PREREQ_MAP: Partial<Record<ConceptTag, ConceptTag[]>> = {
  'func-composite': ['func-basic'],
  'limit-special': ['limit-basic'],
  'deriv-chain': ['deriv-basic', 'func-composite'],
  'deriv-implicit': ['deriv-chain'],
  'deriv-parametric': ['deriv-chain'],
  'deriv-higher': ['deriv-basic'],
  'deriv-extreme': ['deriv-monotone'],
  'deriv-concave': ['deriv-higher'],
  'integ-substitution': ['integ-indefinite'],
  'integ-parts': ['integ-indefinite'],
  'integ-rational': ['integ-substitution'],
  'integ-definite': ['integ-indefinite'],
  'integ-improper': ['integ-definite'],
  'de-second-order': ['de-first-order'],
  'multi-extreme': ['multi-partial'],
  'multi-double-integral': ['integ-definite', 'multi-partial'],
  'series-power': ['series-number'],
};

/**
 * 题型映射（从section_name到标准题型）
 */
export const SECTION_TYPE_MAP: Record<string, 'choice' | 'fill' | 'solution'> = {
  '选择题': 'choice',
  '单项选择题': 'choice',
  '单选题': 'choice',
  '填空题': 'fill',
  '计算题': 'solution',
  '应用题': 'solution',
  '证明题': 'solution',
  '综合题': 'solution',
  '解答题': 'solution',
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
    '广东': 'GD',
    '广东省': 'GD',
    '江苏': 'JS',
    '浙江': 'ZJ',
    '山东': 'SD',
    '河南': 'HN',
    '四川': 'SC',
    '湖北': 'HB',
    '湖南': 'HN2',
    '福建': 'FJ',
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

