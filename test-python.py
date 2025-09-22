#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json

def test_python_script():
    """测试Python脚本参数传递功能"""
    
    print("=== Python脚本参数测试 ===")
    print(f"参数数量: {len(sys.argv)}")
    print(f"所有参数: {sys.argv}")
    
    if len(sys.argv) > 1:
        try:
            # 尝试解析JSON参数
            if sys.argv[1].startswith('{'):
                params = json.loads(sys.argv[1])
                print(f"解析的JSON参数: {params}")
                
                prompt = params.get('prompt', '')
                character_name = params.get('character_name', '')
                
                print(f"Prompt: {prompt}")
                print(f"角色名称: {character_name}")
                
                # 模拟成功响应
                result = {
                    "success": True,
                    "message": f"成功接收到{character_name}的搭配请求",
                    "prompt_length": len(prompt)
                }
                print(json.dumps(result, ensure_ascii=False))
                
            else:
                # 简单文本参数
                prompt = sys.argv[1]
                character_name = sys.argv[2] if len(sys.argv) > 2 else ""
                
                print(f"文本Prompt: {prompt}")
                print(f"角色名称: {character_name}")
                
                result = {
                    "success": True,
                    "message": f"成功接收到文本参数",
                    "prompt_length": len(prompt)
                }
                print(json.dumps(result, ensure_ascii=False))
                
        except Exception as e:
            error_result = {
                "success": False,
                "error": str(e)
            }
            print(json.dumps(error_result, ensure_ascii=False))
    else:
        print("没有接收到参数，使用默认测试")
        result = {
            "success": True,
            "message": "默认测试成功"
        }
        print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    test_python_script()