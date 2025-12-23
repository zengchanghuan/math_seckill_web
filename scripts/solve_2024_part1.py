#!/usr/bin/env python3
"""
2024年真题解答 - 简化版（逐题调用）
"""

import requests
import json
import time

API_KEY = "sk-78c5eab3420c4135bc14691c936d6bad"
API_URL = "https://api.deepseek.com/v1/chat/completions"

def solve_question(q_num, q_text):
    """解答单个题目"""
    print(f"\n第{q_num}题:")
    
    prompt = f"""请解答以下题目，要求：
1. 给出详细解题步骤
2. 使用LaTeX公式（用$包裹）
3. 明确给出答案
4. 格式：【解析】步骤...答案：X

{q_text}
"""
    
    try:
        response = requests.post(
            API_URL,
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
            json={
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "你是专业的高等数学教师。"},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 2000
            },
            timeout=30
        )
        
        if response.status_code == 200:
            solution = response.json()['choices'][0]['message']['content']
            print(f"✓ 完成")
            return solution
        else:
            print(f"✗ API错误: {response.status_code}")
            return None
    except Exception as e:
        print(f"✗ 异常: {e}")
        return None

# 题目列表（前10题）
questions = {
    1: "1. $\\lim_{x \\rightarrow 0} \\frac{\\sin 3x}{x} = $\nA. 3  B. 1  C. -1  D. -3",
    2: "2. f(x) = x² - cos x, 则f'$(\\frac{\\pi}{2}) = $\nA. $\\pi - 1$  B. $\\pi$  C. $\\pi + 1$  D. $2\\pi$",
    3: "3. 当 $x \\rightarrow 0$ 时，$ax$ 与 $4x^{3} - 3x^{2} + 2x$ 是等价无穷小，则 $a = $\nA. 1  B. 2  C. 3  D. 4",
    4: "4. 设 $I_1 = \\int_0^1 e^x dx$, $I_2 = \\int_0^1 e^{2x} dx$, $I_3 = \\int_0^1 e^{3x} dx$\nA. $I_1 > I_2 > I_3$  B. $I_1 > I_3 > I_2$  C. $I_3 > I_1 > I_2$  D. $I_3 > I_2 > I_1$",
    5: "5. 改换二次积分次序：$I = \\int_0^1 dy \\int_{\\sqrt[3]{y}}^{\\sqrt{y}} f(x,y)dx$\nA. $\\int_0^1 dx \\int_{\\sqrt{x}}^{\\sqrt[3]{x}} f(x,y)dy$\nC. $\\int_0^1 dx \\int_{x^3}^{x^2} f(x,y)dy$\nD. $\\int_0^1 dx \\int_{x^2}^{x^3} f(x,y)dy$",
    6: "6. 已知 $y = x^{4}$，则 $y'' = $",
    7: "7. 已知 $y = \\ln(x + 1)$，则 $dy = $",
    8: "8. $\\sum_{n=1}^{\\infty} a_n$ 收敛，则 $\\lim_{n \\to \\infty} (a_n + 2)(a_n - 1) = $",
    9: "9. $x = \\sin t, y = \\cos 2t$ 在 $t = \\frac{\\pi}{4}$ 处切线斜率",
    10: "10. $f(t) = \\lim_{n \\to \\infty} (1 + \\frac{1}{n})^{2nt}$, $g(x) = \\int_0^x f''(t)dt$，求 $\\int_0^1 g(x)dx$",
}

results = {}
for q_num in range(1, 11):
    solution = solve_question(q_num, questions[q_num])
    if solution:
        results[q_num] = solution
    time.sleep(1.5)  # 避免限流

# 保存
with open('/tmp/2024_part1.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\n✅ 完成！已保存到 /tmp/2024_part1.json")


