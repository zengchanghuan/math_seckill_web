#!/usr/bin/env python3
"""
数学答案验证工具 - 针对广东专升本高数真题
使用 SymPy 验算积分、极限、导数等数学问题
"""

import re
import json
import sympy
from sympy import symbols, simplify
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

# 定义常用符号
x, y, z, t, n = symbols('x y z t n', real=True)

class MathVerifier:
    """数学答案验证器"""
    
    def __init__(self):
        self.transformations = (standard_transformations + (implicit_multiplication_application,))
    
    def clean_latex(self, latex_str):
        """清理LaTeX字符串，转换为SymPy可识别的格式"""
        # 移除 $ 符号
        s = latex_str.replace('$', '').strip()
        
        # 替换常见LaTeX命令
        replacements = {
            r'\\mathrm{d}': '',
            r'\\,': ' ',
            r'\\sin': 'sin',
            r'\\cos': 'cos',
            r'\\tan': 'tan',
            r'\\ln': 'log',
            r'\\log': 'log',
            r'\\sqrt': 'sqrt',
            r'\\pi': 'pi',
            r'π': 'pi',
            r'\\infty': 'oo',
            r'\\frac': '/',
            r'{': '(',
            r'}': ')',
            r'\\left': '',
            r'\\right': '',
            r'\\big': '',
            r'\\Big': '',
            r'\\bigg': '',
            r'\\Bigg': '',
        }
        
        for old, new in replacements.items():
            s = s.replace(old, new)
        
        return s
    
    def extract_answer_value(self, answer_text):
        """从答案文本中提取数值"""
        # 尝试找到 = 后面的内容
        match = re.search(r'=\s*([^。，,\s]+)', answer_text)
        if match:
            return match.group(1)
        
        # 尝试找到最后的数值
        match = re.search(r'([πpi\d\.\-\+/]+)\s*[。，,]?\s*$', answer_text)
        if match:
            return match.group(1)
        
        return None
    
    def verify_integral_problem(self, question, deepseek_solution, correct_answer):
        """
        验证积分题
        
        示例题目: 设 2x 是 f(x) 的一个原函数，则 ∫[0 to π/2] [f(x) - sin x]dx
        """
        try:
            # 从DeepSeek的解析中提取计算过程
            # 寻找关键信息：f(x) = ?
            
            # 案例：设 2x 是 f(x) 的一个原函数
            # 那么 f(x) = (2x)' = 2
            
            # 提取 DeepSeek 给出的答案
            deepseek_answer = self.extract_answer_value(deepseek_solution)
            
            if not deepseek_answer:
                return {
                    'verified': False,
                    'reason': '无法从DeepSeek解析中提取答案'
                }
            
            # 清理并比较答案
            deepseek_clean = self.clean_latex(deepseek_answer)
            correct_clean = self.clean_latex(correct_answer)
            
            try:
                deepseek_val = parse_expr(deepseek_clean, transformations=self.transformations)
                correct_val = parse_expr(correct_clean, transformations=self.transformations)
                
                # 简化并比较
                diff = simplify(deepseek_val - correct_val)
                
                if diff == 0:
                    return {
                        'verified': True,
                        'method': 'symbolic_comparison',
                        'deepseek_answer': str(deepseek_val),
                        'correct_answer': str(correct_val)
                    }
                else:
                    # 尝试数值比较
                    try:
                        deepseek_num = float(deepseek_val.evalf())
                        correct_num = float(correct_val.evalf())
                        
                        if abs(deepseek_num - correct_num) < 1e-6:
                            return {
                                'verified': True,
                                'method': 'numerical_comparison',
                                'deepseek_answer': deepseek_num,
                                'correct_answer': correct_num
                            }
                    except:
                        pass
                    
                    return {
                        'verified': False,
                        'reason': '答案不匹配',
                        'deepseek_answer': str(deepseek_val),
                        'correct_answer': str(correct_val),
                        'difference': str(diff)
                    }
                    
            except Exception as e:
                return {
                    'verified': False,
                    'reason': f'解析失败: {str(e)}',
                    'deepseek_answer': deepseek_clean,
                    'correct_answer': correct_clean
                }
                
        except Exception as e:
            return {
                'verified': False,
                'reason': f'验证过程出错: {str(e)}'
            }
    
    def verify_choice_problem(self, question, deepseek_solution, correct_answer):
        """验证选择题"""
        # 提取选择题答案（A/B/C/D）
        deepseek_choice = re.search(r'答案[为是：:]*\s*([A-D])', deepseek_solution)
        correct_choice = re.search(r'^([A-D])', correct_answer.strip())
        
        if deepseek_choice and correct_choice:
            is_correct = deepseek_choice.group(1) == correct_choice.group(1)
            return {
                'verified': is_correct,
                'method': 'choice_comparison',
                'deepseek_answer': deepseek_choice.group(1),
                'correct_answer': correct_choice.group(1)
            }
        
        return {
            'verified': False,
            'reason': '无法提取选择题答案'
        }
    
    def verify(self, question, deepseek_solution, correct_answer):
        """
        主验证函数
        
        Args:
            question: 题目文本
            deepseek_solution: DeepSeek返回的解析
            correct_answer: 正确答案
        
        Returns:
            验证结果字典
        """
        # 判断题目类型
        if re.search(r'[A-D][\.、]', question):
            # 选择题
            return self.verify_choice_problem(question, deepseek_solution, correct_answer)
        elif '∫' in question or '\\int' in question:
            # 积分题
            return self.verify_integral_problem(question, deepseek_solution, correct_answer)
        else:
            # 其他类型，简单比较答案
            deepseek_ans = self.extract_answer_value(deepseek_solution)
            if deepseek_ans:
                return self.verify_integral_problem(question, deepseek_solution, correct_answer)
            else:
                return {
                    'verified': None,
                    'reason': '题目类型暂不支持自动验证'
                }

def main():
    """测试"""
    verifier = MathVerifier()
    
    # 测试案例1: 2023年第4题
    question = "设 2x 是 f(x) 的一个原函数，则 ∫[0 to π/2] [f(x) - sin x]dx = ()\nA. π - 1\nB. π + 1"
    deepseek_solution = "【精析】由题意知 $2x$ 是 $f(x)$ 的一个原函数，因此 $f(x) = (2x)' = 2$。于是所求积分为 $\\int_{0}^{\\frac{\\pi}{2}} [f(x) - \\sin x] \\, dx = \\int_{0}^{\\frac{\\pi}{2}} (2 - \\sin x) \\, dx$。计算得 $\\int_{0}^{\\frac{\\pi}{2}} 2 \\, dx = 2x \\big|_{0}^{\\frac{\\pi}{2}} = \\pi$，而 $\\int_{0}^{\\frac{\\pi}{2}} \\sin x \\, dx = -\\cos x \\big|_{0}^{\\frac{\\pi}{2}} = -\\left(0 - 1\\right) = 1$。因此原积分 $= \\pi - 1$，故正确答案为 A。"
    correct_answer = "A"
    
    result = verifier.verify(question, deepseek_solution, correct_answer)
    print("测试案例1 - 2023年第4题:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 测试案例2: 数值答案
    question2 = "计算 ∫[0 to 1] x²dx"
    solution2 = "【解析】= 1/3"
    answer2 = "1/3"
    
    result2 = verifier.verify(question2, solution2, answer2)
    print("\n测试案例2 - 数值答案:")
    print(json.dumps(result2, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()

