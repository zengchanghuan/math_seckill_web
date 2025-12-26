#!/usr/bin/env python3
"""
测试标注系统：标注单个题目验证流程
"""

import requests
import json

API_BASE = "http://localhost:3000/api/question-bank"

def test_single_annotation():
    """测试单题标注"""
    print("[Test] 测试单题标注...")
    
    test_question = {
        "mode": "single",
        "questions": [{
            "questionNum": 1,
            "content": "设函数 f(x) = x^2 + 2x + 1，求 f'(x)。",
            "answer": "f'(x) = 2x + 2",
            "sectionName": "填空题"
        }],
        "meta": {
            "year": 2024,
            "province": "广东"
        }
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/annotate",
            json=test_question,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                metadata = result['metadata']
                print("\n[Success] 标注结果:")
                print(json.dumps(metadata, ensure_ascii=False, indent=2))
                
                print("\n[Analysis]")
                print(f"  - Question ID: {metadata['questionId']}")
                print(f"  - 知识点: {metadata['conceptTags']}")
                print(f"  - 先修: {metadata['prereqTags']}")
                print(f"  - 难度: {metadata['difficulty']}/5")
                print(f"  - 预估用时: {metadata['timeEstimateSec']}秒")
                print(f"  - 能力: {metadata['skills']}")
                print(f"  - 置信度: {metadata['confidence']}")
                print(f"  - 需复审: {metadata['needsReview']}")
                print(f"  - 一致性: {metadata['consistencyCheck']['consistent']}")
            else:
                print(f"[Error] {result.get('error')}")
        else:
            print(f"[Error] HTTP {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"[Error] {e}")

def test_query():
    """测试查询功能"""
    print("\n[Test] 测试题库查询...")
    
    query_request = {
        "mode": "query",
        "params": {
            "conceptTags": ["deriv-basic"],
            "difficulty": [2, 4],
            "limit": 5,
            "orderBy": "random"
        }
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/query",
            json=query_request,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print(f"[Success] 查询到 {result['count']} 道题")
                for q in result['questions'][:3]:
                    print(f"\n题目: {q['metadata']['questionId']}")
                    print(f"  知识点: {q['metadata']['conceptTags']}")
                    print(f"  难度: {q['metadata']['difficulty']}")
            else:
                print(f"[Error] {result.get('error')}")
        else:
            print(f"[Error] HTTP {response.status_code}")
    
    except Exception as e:
        print(f"[Error] {e}")

def test_stats():
    """测试统计功能"""
    print("\n[Test] 获取题库统计...")
    
    try:
        response = requests.post(
            f"{API_BASE}/query",
            json={"mode": "stats"},
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                stats = result['stats']
                print(f"\n[Success] 题库统计:")
                print(f"  总题数: {stats['totalQuestions']}")
                print(f"  知识点分布: {json.dumps(stats['conceptStats'], ensure_ascii=False, indent=2)}")
                print(f"  难度分布: {stats['difficultyStats']}")
                print(f"  题型分布: {stats['typeStats']}")
            else:
                print(f"[Error] {result.get('error')}")
        else:
            print(f"[Error] HTTP {response.status_code}")
    
    except Exception as e:
        print(f"[Error] {e}")

if __name__ == '__main__':
    print("=" * 60)
    print("题库标注系统测试")
    print("=" * 60)
    print("\n请确保开发服务器已启动: npm run dev\n")
    
    input("按回车开始测试...")
    
    test_single_annotation()
    # test_query()
    # test_stats()
    
    print("\n[Done] 测试完成")



