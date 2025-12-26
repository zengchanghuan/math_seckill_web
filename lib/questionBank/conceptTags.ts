/**
 * 专升本高数核心知识点配置表
 * 总计41个知识点，包含同义词和判定口径，用于增强Prompt效果
 */

export interface ConceptConfig {
  label: string;      // 展示名
  aliases: string[];  // 触发词/同义词 (用于Prompt)
  notes: string;      // 判定口径 (用于Prompt)
  module: string;     // 所属模块
}

export const CONCEPT_TAGS: Record<string, ConceptConfig> = {
  // ========== 模块1：函数与极限 ==========
  'func-basic': {
    label: '函数基本性质',
    aliases: ['定义域', '值域', '奇偶性', '周期性', '有界性', '反函数'],
    notes: '涉及函数基本概念、性质判断或简单函数关系的题目',
    module: '函数与极限'
  },
  'func-composite': {
    label: '复合函数',
    aliases: ['复合分解', 'f[g(x)]', '内外层函数'],
    notes: '涉及复合函数的定义、分解或复合运算的题目',
    module: '函数与极限'
  },
  'limit-calculation': {
    label: '极限计算(六种方法)',
    aliases: ['洛必达', '等价无穷小', '泰勒公式', '两个重要极限', '有理化', '夹逼准则', '0/0', '∞/∞', '1^∞'],
    notes: '所有直接求极限的计算题，包括各种未定式',
    module: '函数与极限'
  },
  'limit-special': {
    label: '特殊极限',
    aliases: ['左右极限', '分段函数极限', '无穷大与无穷小', '极限存在性'],
    notes: '涉及单侧极限、极限存在条件或无穷小阶的比较',
    module: '函数与极限'
  },
  'limit-continuous': {
    label: '连续性',
    aliases: ['间断点', '第一类间断点', '第二类间断点', '可去', '跳跃', '连续函数性质'],
    notes: '判断函数连续性、分类间断点或闭区间连续性质',
    module: '函数与极限'
  },

  // ========== 模块2：导数与微分 - 规则层 ==========
  'deriv-definition': {
    label: '导数定义',
    aliases: ['导数定义式', '变化率', '切线斜率定义', '左右导数', '可导性'],
    notes: '利用导数定义求极限或判断可导性的题目',
    module: '导数与微分'
  },
  'deriv-calculation': {
    label: '导数与微分计算',
    aliases: ['求导', '微分', 'dy', '基本公式', '四则运算', '求导法则'],
    notes: '基础求导、求微分题目，包括直接求导和微分形式',
    module: '导数与微分'
  },
  'deriv-chain': {
    label: '链式法则',
    aliases: ['复合求导', '中间变量', '由外向内'],
    notes: '复合函数求导的核心方法，通常与其他规则结合',
    module: '导数与微分'
  },
  'deriv-implicit': {
    label: '隐函数求导公式',
    aliases: ['F(x,y)=0', '方程两边求导', '隐函数存在定理'],
    notes: '由方程确定的函数的求导问题',
    module: '导数与微分'
  },
  'deriv-parametric': {
    label: '参数方程求导',
    aliases: ['x=x(t)', 'y=y(t)', 'dy/dx', '参数消元'],
    notes: '由参数方程确定的函数的求导问题',
    module: '导数与微分'
  },
  'deriv-higher': {
    label: '高阶导数',
    aliases: ['二阶导数', 'n阶导数', '莱布尼茨公式'],
    notes: '求二阶及以上导数，或寻找n阶导数规律',
    module: '导数与微分'
  },
  'deriv-tangent': {
    label: '切线方程',
    aliases: ['法线方程', '切点', '斜率k', '几何意义'],
    notes: '求曲线在某点的切线或法线方程',
    module: '导数与微分'
  },
  'multi-partial-calc': {
    label: '偏导数与全微分计算',
    aliases: ['∂z/∂x', '∂z/∂y', 'dz', '混合偏导', '全微分'],
    notes: '多元函数的偏导数计算或全微分求解',
    module: '导数与微分'
  },

  // ========== 模块3：导数应用 - 应用层 ==========
  'deriv-monotone-extreme': {
    label: '单调区间与极值',
    aliases: ['单调性', '增减区间', '极值点', '极大值', '极小值', '驻点', '一阶导符号'],
    notes: '利用一阶导数研究函数的单调性和极值',
    module: '导数应用'
  },
  'deriv-concave-inflection': {
    label: '凹凸区间与拐点',
    aliases: ['凹凸性', '拐点', '二阶导符号', '曲线弯曲方向'],
    notes: '利用二阶导数研究曲线的凹凸性和拐点',
    module: '导数应用'
  },
  'func-asymptote': {
    label: '渐近线(水平/垂直/斜)',
    aliases: ['水平渐近线', '垂直渐近线', '斜渐近线', '无穷远性态'],
    notes: '求曲线的所有类型渐近线',
    module: '导数应用'
  },
  'deriv-optimization': {
    label: '实际应用优化',
    aliases: ['最值应用', '最大利润', '最小成本', '最大面积', '物理应用'],
    notes: '将实际问题转化为函数最值问题求解',
    module: '导数应用'
  },
  'multi-extreme': {
    label: '多元函数极值',
    aliases: ['二元极值', '驻点', '海森矩阵', '条件极值', '拉格朗日乘数法'],
    notes: '求多元函数的无条件极值或条件极值',
    module: '导数应用'
  },

  // ========== 模块4：积分 - 不定积分 ==========
  'integ-primitive': {
    label: '原函数与不定积分',
    aliases: ['原函数定义', '不定积分性质', '导数逆运算'],
    notes: '涉及原函数概念、不定积分基本性质的题目',
    module: '积分'
  },
  'integ-substitution': {
    label: '换元积分法',
    aliases: ['第一换元', '第二换元', '凑微分', '根式代换', '三角代换'],
    notes: '使用变量代换法求积分（注：凑微分有时单列）',
    module: '积分'
  },
  'integ-parts': {
    label: '分部积分法',
    aliases: ['反对幂三指', 'udv', 'uv-vdu'],
    notes: '乘积形式函数的积分，使用分部积分公式',
    module: '积分'
  },
  'integ-by-diff': {
    label: '凑微分法',
    aliases: ['第一类换元', '微分形式不变性', 'd(g(x))'],
    notes: '明显的凑微分形式求解（如∫2x e^(x^2) dx）',
    module: '积分'
  },
  'integ-rational': {
    label: '有理函数积分',
    aliases: ['部分分式分解', '真分式', '假分式'],
    notes: '有理分式函数的积分方法',
    module: '积分'
  },

  // ========== 模块4：积分 - 定积分 ==========
  'integ-definite': {
    label: '定积分计算',
    aliases: ['牛顿-莱布尼茨公式', '积分上限函数', '变限积分求导'],
    notes: '基础定积分计算，包括变限积分求导',
    module: '积分'
  },
  'integ-piecewise': {
    label: '分段函数定积分',
    aliases: ['分段积分', '绝对值积分', '区间可加性'],
    notes: '被积函数含绝对值或分段定义的定积分',
    module: '积分'
  },
  'integ-symmetry': {
    label: '定积分对称性(偶倍奇零)',
    aliases: ['奇偶性', '周期性', '对称区间', '几何意义'],
    notes: '利用奇偶性、周期性或几何意义简化定积分',
    module: '积分'
  },
  'integ-area': {
    label: '平面图形面积',
    aliases: ['曲边梯形', '围成面积', '定积分几何应用'],
    notes: '利用定积分计算平面图形的面积',
    module: '积分'
  },
  'integ-volume': {
    label: '旋转体体积',
    aliases: ['绕x轴旋转', '绕y轴旋转', '体积公式'],
    notes: '利用定积分计算旋转体的体积',
    module: '积分'
  },
  'integ-arc-length': {
    label: '弧长',
    aliases: ['曲线长度', '弧长公式'],
    notes: '计算平面曲线的弧长',
    module: '积分'
  },

  // ========== 模块5：多元函数与二重积分 ==========
  'multi-double-integral': {
    label: '二重积分计算',
    aliases: ['直角坐标计算', 'X型区域', 'Y型区域', '先X后Y'],
    notes: '直角坐标系下的二重积分计算',
    module: '多元函数与二重积分'
  },
  'multi-integral-order': {
    label: '二次积分换序',
    aliases: ['交换积分次序', '改变积分顺序', '画图确定区域'],
    notes: '不计算积分值，仅考察交换积分次序',
    module: '多元函数与二重积分'
  },
  'multi-polar-coord': {
    label: '极坐标二重积分',
    aliases: ['极坐标变换', 'rdrdθ', '圆形区域'],
    notes: '利用极坐标计算二重积分',
    module: '多元函数与二重积分'
  },
  'multi-coord-transform': {
    label: '坐标变换',
    aliases: ['平移变换', '旋转变换', '雅可比行列式'],
    notes: '二重积分的一般坐标变换（较少见，通常指极坐标）',
    module: '多元函数与二重积分'
  },

  // ========== 模块6：微分方程 ==========
  'de-separable': {
    label: '可分离变量型',
    aliases: ['分离变量', 'dy/g(y)=f(x)dx', '两边积分'],
    notes: '可分离变量的一阶微分方程求解',
    module: '微分方程'
  },
  'de-homogeneous': {
    label: '一阶齐次微分方程',
    aliases: ['y/x代换', '齐次形式', 'u=y/x'],
    notes: '形如dy/dx = f(y/x)的方程求解',
    module: '微分方程'
  },
  'de-linear': {
    label: '一阶线性微分方程',
    aliases: ['通解公式', '常数变易法', '伯努利方程'],
    notes: '一阶线性微分方程（y\'+P(x)y=Q(x)）求解',
    module: '微分方程'
  },
  'de-second-order': {
    label: '二阶齐次微分方程',
    aliases: ['特征方程', '特征根', '通解结构', '常系数'],
    notes: '二阶常系数齐次线性微分方程求解',
    module: '微分方程'
  },
  'de-application': {
    label: '微分方程应用',
    aliases: ['物理应用', '几何应用', '增长模型', '冷却定律'],
    notes: '建立微分方程模型解决实际问题',
    module: '微分方程'
  },

  // ========== 模块7：级数 ==========
  'series-convergence': {
    label: '级数判敛',
    aliases: ['收敛', '发散', '级数性质', 'P级数', '几何级数'],
    notes: '判断常数项级数的敛散性',
    module: '级数'
  },
  'series-comparison': {
    label: '级数比较判别法',
    aliases: ['比较审敛法', '极限形式', '大收小收'],
    notes: '利用比较判别法判断正项级数敛散性',
    module: '级数'
  },
  'series-ratio': {
    label: '级数比值/根值判别法',
    aliases: ['达朗贝尔', '柯西判别法', 'an+1/an'],
    notes: '利用比值法或根值法判断正项级数敛散性',
    module: '级数'
  }
};

export type ConceptTag = keyof typeof CONCEPT_TAGS;

/**
 * 知识点先修关系映射
 * (保持原有逻辑，key不变)
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
  'func-asymptote': ['limit-calculation'],

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
 * Question ID 规范
 * ... (保持不变)
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
    '江苏省': 'JS',
    '浙江': 'ZJ',
    '浙江省': 'ZJ',
    '山东': 'SD',
    '山东省': 'SD',
    '河南': 'HEN',
    '河南省': 'HEN',
    '四川': 'SC',
    '四川省': 'SC',
    '湖北': 'HUB',
    '湖北省': 'HUB',
    '湖南': 'HUN',
    '湖南省': 'HUN',
    '福建': 'FJ',
    '福建省': 'FJ',
    '安徽': 'AH',
    '安徽省': 'AH',
    '江西': 'JX',
    '江西省': 'JX',
  };

  const provinceCode = provinceMap[province] || 'XX';
  const paperCode = `S${paperNum}`;
  const questionCode = `Q${questionNum.toString().padStart(2, '0')}`;

  return `${provinceCode}-${year}-${paperCode}-${questionCode}`;
}

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
