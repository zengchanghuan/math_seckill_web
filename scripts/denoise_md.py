#!/usr/bin/env python3
"""
OCR Markdown 快速去噪工具
纯行级规则过滤，不调用任何模型
"""
import re
import json
import sys
from pathlib import Path
from typing import List, Dict, Tuple

# 关键词黑名单
KEYWORD_BLACKLIST = [
    "考试信息网", "培训电话", "微信", "QQ", "公众号", "咨询", "报名", "联系",
    "gzzkgk", "www.gzzkgk.cn"
]

# 电话号码正则
PHONE_PATTERNS = [
    r'\b0\d{2,3}[- ]?\d{7,8}\b',  # 座机
    r'\b1[3-9]\d{9}\b'              # 手机
]

# 单独页码行正则（整行只有数字和空白）
STANDALONE_PAGE_NUM = r'^\s*\d{1,3}\s*$'

# 图片行正则
IMAGE_LINE = r'^\s*!\[.*\]\(.*\)\s*$'

# LaTeX/数学标记（用于保护）
MATH_MARKERS = [
    r'\$.*\$',  # $...$
    r'\\int', r'\\lim', r'\\frac', r'\\sum', r'\\prod',
    r'\bdx\b', r'\bdy\b', r'\\partial', r'\\infty'
]

class NoiseDetector:
    def __init__(self):
        self.keyword_pattern = re.compile('|'.join(KEYWORD_BLACKLIST), re.IGNORECASE)
        self.phone_patterns = [re.compile(p) for p in PHONE_PATTERNS]
        self.page_num_pattern = re.compile(STANDALONE_PAGE_NUM)
        self.image_pattern = re.compile(IMAGE_LINE)
        self.math_patterns = [re.compile(p) for p in MATH_MARKERS]
        
    def is_image_line(self, line: str) -> bool:
        """检查是否为图片行"""
        return bool(self.image_pattern.match(line))
    
    def has_math_content(self, line: str) -> bool:
        """检查是否包含数学公式"""
        return any(pattern.search(line) for pattern in self.math_patterns)
    
    def detect_noise(self, line: str) -> Tuple[bool, List[str]]:
        """
        检测一行是否为噪声
        返回：(是否为噪声, 命中的规则列表)
        """
        # 保护规则：图片行必须保留
        if self.is_image_line(line):
            return False, []
        
        rules_hit = []
        
        # 规则1: 关键词黑名单
        if self.keyword_pattern.search(line):
            rules_hit.append("keyword_blacklist")
        
        # 规则2: 电话号码
        for i, phone_pattern in enumerate(self.phone_patterns):
            if phone_pattern.search(line):
                rules_hit.append(f"phone_pattern_{i}")
        
        # 规则3: 单独页码行
        if self.page_num_pattern.match(line):
            # 但如果这行也包含数学内容，保护它
            if not self.has_math_content(line):
                rules_hit.append("standalone_page_number")
        
        # 保护规则：如果有数学内容且没有联系方式关键词，移除某些规则
        if self.has_math_content(line) and "keyword_blacklist" not in rules_hit:
            # 保留这行，即使可能匹配到页码规则
            if "standalone_page_number" in rules_hit:
                rules_hit.remove("standalone_page_number")
        
        return len(rules_hit) > 0, rules_hit

def denoise_markdown(input_path: Path, output_path: Path, report_path: Path):
    """
    对Markdown文件进行去噪处理
    """
    detector = NoiseDetector()
    
    # 读取输入文件
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    clean_lines = []
    noise_report = []
    
    for line_no, line in enumerate(lines, start=1):
        is_noise, rules_hit = detector.detect_noise(line)
        
        if is_noise:
            noise_report.append({
                "line_no": line_no,
                "raw_text": line.rstrip('\n'),
                "reason": "noise_detected",
                "rules_hit": rules_hit
            })
        else:
            clean_lines.append(line)
    
    # 写入清洁文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(clean_lines)
    
    # 写入报告
    report = {
        "input_file": str(input_path),
        "output_file": str(output_path),
        "total_lines": len(lines),
        "clean_lines": len(clean_lines),
        "noise_lines": len(noise_report),
        "noise_ratio": f"{len(noise_report)/len(lines)*100:.2f}%",
        "details": noise_report
    }
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    # 打印摘要
    print(f"✅ 去噪完成")
    print(f"   输入：{input_path}")
    print(f"   输出：{output_path}")
    print(f"   报告：{report_path}")
    print(f"   总行数：{len(lines)}")
    print(f"   保留行数：{len(clean_lines)}")
    print(f"   移除行数：{len(noise_report)} ({report['noise_ratio']})")

def main():
    if len(sys.argv) < 2:
        print("用法: python denoise_md.py <input.md> [output.md] [report.json]")
        print("示例: python denoise_md.py ocr.md clean.md noise_report.json")
        sys.exit(1)
    
    input_path = Path(sys.argv[1])
    
    if not input_path.exists():
        print(f"❌ 错误：文件不存在 {input_path}")
        sys.exit(1)
    
    # 默认输出路径
    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])
    else:
        output_path = input_path.parent / f"{input_path.stem}_clean{input_path.suffix}"
    
    if len(sys.argv) >= 4:
        report_path = Path(sys.argv[3])
    else:
        report_path = input_path.parent / f"{input_path.stem}_noise_report.json"
    
    denoise_markdown(input_path, output_path, report_path)

if __name__ == "__main__":
    main()


