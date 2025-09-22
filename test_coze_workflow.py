#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
import os
import time

def generate_outfit_with_prompt(user_prompt: str, character_name: str = "", additional_params: dict = None):
    """
    模拟生成搭配功能（测试版本）
    
    Args:
        user_prompt: 用户输入的prompt文本
        character_name: 角色名称
        additional_params: 额外的参数
    """
    # 构建完整的prompt
    full_prompt = user_prompt
    if character_name:
        full_prompt += f"\n角色：{character_name}"
    
    print(f"开始生成搭配，使用prompt: {full_prompt}")
    print(f"角色名称: {character_name}")
    
    # 模拟处理时间
    time.sleep(1)
    
    try:
        # 模拟成功的搭配生成
        print("正在调用Coze workflow...")
        print("生成搭配中...")
        print("搭配生成完成！")
        
        # 模拟生成的图片URL
        mock_image_url = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&q=80"
        
        return {
            "success": True, 
            "message": f"为{character_name}成功生成搭配",
            "imageUrl": mock_image_url,
            "output": f"为{character_name}生成的时尚搭配已完成",
            "prompt_length": len(user_prompt),
            "character": character_name
        }
    except Exception as e:
        print(f"生成搭配时出错: {e}")
        return {
            "success": False, 
            "error": str(e),
            "message": "搭配生成失败",
            "imageUrl": "",
            "output": ""
        }

# 主函数，支持命令行参数
if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == '--file' and len(sys.argv) > 2:
            # 从文件读取参数
            try:
                file_path = sys.argv[2]
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        params = json.load(f)
                    
                    user_prompt = params.get('prompt', '')
                    character_name = params.get('character_name', '')
                    additional_params = params.get('additional_params', {})
                    
                    result = generate_outfit_with_prompt(user_prompt, character_name, additional_params)
                    print(json.dumps(result, ensure_ascii=False))
                    
                    # 清理临时文件
                    try:
                        os.remove(file_path)
                    except:
                        pass
                else:
                    print(json.dumps({"success": False, "error": f"参数文件不存在: {file_path}"}, ensure_ascii=False))
            except Exception as e:
                print(json.dumps({"success": False, "error": f"读取参数文件失败: {str(e)}"}, ensure_ascii=False))
        elif sys.argv[1].startswith('{'):
            # JSON格式参数
            try:
                params = json.loads(sys.argv[1])
                user_prompt = params.get('prompt', '')
                character_name = params.get('character_name', '')
                additional_params = params.get('additional_params', {})
                
                result = generate_outfit_with_prompt(user_prompt, character_name, additional_params)
                print(json.dumps(result, ensure_ascii=False))
            except json.JSONDecodeError:
                print(json.dumps({"success": False, "error": "Invalid JSON format"}, ensure_ascii=False))
        else:
            # 简单文本参数
            user_prompt = sys.argv[1]
            character_name = sys.argv[2] if len(sys.argv) > 2 else ""
            
            result = generate_outfit_with_prompt(user_prompt, character_name)
            print(json.dumps(result, ensure_ascii=False))
    else:
        # 默认示例prompt（用于测试）
        default_prompt = """请为用户生成一套时尚搭配。要求：
1. 风格：现代简约，适合日常穿搭
2. 季节：当前季节适宜
3. 色彩：协调统一，突出个人特色
4. 场合：适合日常工作和休闲
5. 请生成高质量的搭配效果图，包含上衣、下装、鞋子等完整搭配
6. 搭配风格要符合当下流行趋势，同时保持实用性"""
        
        result = generate_outfit_with_prompt(default_prompt)
        print(json.dumps(result, ensure_ascii=False))