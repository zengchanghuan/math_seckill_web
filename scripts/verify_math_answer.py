#!/usr/bin/env python3
"""
数学答案验证工具
使用 SymPy 验算积分、极限、导数等数学问题
"""

import re
import sympy as sp
from sympy import symbols, integrate, limit, diff, simplify, latex
from sympy.parsing.latex import parse_latex
import json

# 定义常用符号
x, y, z, t, n = symbols('x y z t n', real=True)
a, b, c, k = symbols('a b c k', real=True)

def extract_integral_info(question_text):
    """
    从题目中提取积分信息
    返回: (被积函数, 积分变量, 下限, 上限)
    """
    # 匹配 ∫[a to b] f(x)dx 或 \\int_{a}^{b} f(x) dx
    pattern1 = r'\\int_\{([^}]+)\}\^\{([^}]+)\}\s*(.+?)\s*d([xyznt])'
    pattern2 = r'∫\[(.+?)\s+to\s+(.+?)\]\s*(.+?)\s*d([xyznt])'
    
    match = re.search(pattern1, question_text) or re.search(pattern2, question_text)
    
    if match:
        lower, upper, func, var = match.groups()
        return {
            'type': 'integral',
            'function': func,
            'variable': var,
            'lower_limit': lower,
            'upper_limit': upper
        }
    return None

def extract_limit_info(question_text):
    """
    从题目中提取极限信息
    """
    # 匹配 lim_{x->a} f(x) 或 \\lim_{x \\to a}
    pattern = r'\\lim_\{([xyztn])\s*\\to\s*([^}]+)\}\s*(.+?)(?:\s|$|=)'
    
    match = re.search(pattern, question_text)
    
    if match:
        var, point, func = match.groups()
        return {
            'type': 'limit',
            'function': func,
            'variable': var,
            'point': point
        }
    return None

def extract_derivative_info(question_text):
    """
    从题目中提取导数信息
    """
    # 匹配求导相关的文本
    if '导数' in question_text or '微分' in question_text or "f'(x)" in question_text:
        # 尝试提取函数
        pattern = r'f\(([xyznt])\)\s*=\s*(.+?)(?:\s|$|,|，)'
        match = re.search(pattern, question_text)
        if match:
            var, func = match.groups()
            return {
                'type': 'derivative',
                'function': func,
                'variable': var
            }
    return None

def parse_answer(answer_text):
    """
    从答案文本中提取数值或表达式
    """
    # 尝试匹配数值答案
    patterns = [
        r'=\s*([^。，,\s]+)',  # 等号后面的内容
        r'答案[为是：:]\s*([A-D])',  # 选择题答案
        r'([π\d\./\-\+]+)',  # 数值表达式
    ]
    
    for pattern in patterns:
        match = re.search(pattern, answer_text)
        if match:
            return match.group(1)
    
    return answer_text.strip()

def verify_integral(integral_info, expected_answer):
    """
    验证定积分答案
    """
    try:
        func_str = integral_info['function']
        var_str = integral_info['variable']
        lower = integral_info['lower_limit']
        upper = integral_info['upper_limit']
        
        # 将变量字符串转换为SymPy符号
        var = symbols(var_str)
        
        # 尝试解析LaTeX表达式（如果失败则尝试其他方法）
        try:
            func = parse_latex(func_str)
        except:
            # 简单替换常见符号
            func_str_clean = func_str.replace('\\sin', 'sin').replace('\\cos', 'cos')
            func_str_clean = func_str_clean.replace('\\frac', '/')
            func = sp.sympify(func_str_clean)
        
        # 计算积分
        result = integrate(func, (var, sp.sympify(lower), sp.sympify(upper)))
        result_simplified = simplify(result)
        
        # 比较结果
        expected = sp.sympify(expected_answer.replace('π', 'pi'))
        difference = simplify(result_simplified - expected)
        
        is_correct = difference == 0 or abs(float(difference)) < 1e-6
        
        return {
            'is_correct': is_correct,
            'calculated': str(result_simplified),
            'expected': str(expected),
            'difference': str(difference),
            'method': 'sympy_integral'
        }
    except Exception as e:
        return {
            'is_correct': None,
            'error': str(e),
            'method': 'sympy_integral'
        }

def verify_limit(limit_info, expected_answer):
    """
    验证极限答案
    """
    try:
        func_str = limit_info['function']
        var_str = limit_info['variable']
        point = limit_info['point']
        
        var = symbols(var_str)
        
        try:
            func = parse_latex(func_str)
        except:
            func = sp.sympify(func_str)
        
        # 计算极限
        result = limit(func, var, sp.sympify(point))
        result_simplified = simplify(result)
        
        expected = sp.sympify(expected_answer.replace('e', 'E'))
        is_correct = simplify(result_simplified - expected) == 0
        
        return {
            'is_correct': is_correct,
            'calculated': str(result_simplified),
            'expected': str(expected),
            'method': 'sympy_limit'
        }
    except Exception as e:
        return {
            'is_correct': None,
            'error': str(e),
            'method': 'sympy_limit'
        }

def verify_answer(question_text, answer_text, expected_answer):
    """
    主验证函数
    """
    # 尝试识别题目类型并验证
    
    # 1. 尝试积分
    integral_info = extract_integral_info(question_text)
    if integral_info:
        return verify_integral(integral_info, expected_answer)
    
    # 2. 尝试极限
    limit_info = extract_limit_info(question_text)
    if limit_info:
        return verify_limit(limit_info, expected_answer)
    
    # 3. 其他类型暂不支持
    return {
        'is_correct': None,
        'message': '题目类型不支持自动验证',
        'method': 'none'
    }

def main():
    """测试函数"""
    # 测试案例1: 2023年第4题
    question = "设 2x 是 f(x) 的一个原函数，则 ∫[0 to π/2] [f(x) - sin x]dx = ()"
    answer = "π - 1"
    
    result = verify_answer(question, "", answer)
    print("测试案例1:")
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    main()




