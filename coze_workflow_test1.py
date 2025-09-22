"""
This example describes how to use the workflow interface to stream chat.
"""

import os
# Our official coze sdk for Python [cozepy](https://github.com/coze-dev/coze-py)
from cozepy import COZE_CN_BASE_URL

# Get an access_token through personal access token or oauth.
coze_api_token = 'cztei_qXlDNBw1ms9Rts3ESW1LCMLInXRiUao7TYGpqgplpaga4lZBFJHx8U3mj6UaOL3g4'
# The default access is api.coze.com, but if you need to access api.coze.cn,
# please use base_url to configure the api endpoint to access
coze_api_base = COZE_CN_BASE_URL

from cozepy import Coze, TokenAuth, Stream, WorkflowEvent, WorkflowEventType  # noqa

# Init the Coze client through the access_token.
coze = Coze(auth=TokenAuth(token=coze_api_token), base_url=coze_api_base)

# Create a workflow instance in Coze, copy the last number from the web link as the workflow's ID.
workflow_id = '7552952898411642915'


# The stream interface will return an iterator of WorkflowEvent. Developers should iterate
# through this iterator to obtain WorkflowEvent and handle them separately according to
# the type of WorkflowEvent.
def handle_workflow_iterator(stream: Stream[WorkflowEvent]):
    result_data = {
        "success": False,
        "message": "",
        "imageUrl": "",
        "output": ""
    }
    
    for event in stream:
        if event.event == WorkflowEventType.MESSAGE:
            print("got message", event.message)
            # 收集消息内容
            if event.message and hasattr(event.message, 'content'):
                result_data["output"] += str(event.message.content) + "\n"
            
            # 尝试从消息中提取图片URL
            if event.message and hasattr(event.message, 'content'):
                content = str(event.message.content)
                # 查找可能的图片URL模式
                import re
                url_patterns = [
                    r'https?://[^\s]+\.(?:jpg|jpeg|png|gif|webp)',
                    r'https?://[^\s]+/[^\s]*image[^\s]*',
                    r'https?://[^\s]+\.coze[^\s]*',
                    r'https?://[^\s]+'
                ]
                
                for pattern in url_patterns:
                    urls = re.findall(pattern, content, re.IGNORECASE)
                    if urls:
                        result_data["imageUrl"] = urls[0]
                        break
                        
        elif event.event == WorkflowEventType.ERROR:
            print("got error", event.error)
            result_data["success"] = False
            result_data["message"] = f"工作流执行错误: {event.error}"
            return result_data
        elif event.event == WorkflowEventType.INTERRUPT:
            handle_workflow_iterator(
                coze.workflows.runs.resume(
                    workflow_id=workflow_id,
                    event_id=event.interrupt.interrupt_data.event_id,
                    resume_data="hey",
                    interrupt_type=event.interrupt.interrupt_data.type,
                )
            )
    
    # 如果没有找到图片URL，使用默认的占位符
    if not result_data["imageUrl"]:
        result_data["imageUrl"] = "/static/generated-outfit.jpg"
    
    result_data["success"] = True
    result_data["message"] = "搭配生成成功"
    return result_data


def generate_outfit_with_prompt(user_prompt: str, character_name: str = "", additional_params: dict = None):
    """
    使用指定的prompt生成搭配
    
    Args:
        user_prompt: 用户输入的prompt文本
        character_name: 角色名称
        additional_params: 额外的参数
    """
    # 构建完整的prompt
    full_prompt = user_prompt
    if character_name:
        full_prompt += f"\n角色：{character_name}"
    
    # 根据文档格式构建parameters参数
    parameters = {
        "prompt": full_prompt
    }
    
    # 如果有额外参数，添加到parameters中
    if additional_params:
        parameters.update(additional_params)
    
    print(f"开始生成搭配，使用prompt: {full_prompt}")
    
    try:
        result = handle_workflow_iterator(
            coze.workflows.runs.stream(
                workflow_id=workflow_id,
                parameters=parameters,
            )
        )
        return result
    except Exception as e:
        print(f"生成搭配时出错: {e}")
        return {
            "success": False, 
            "error": str(e),
            "message": f"生成搭配时出错: {str(e)}",
            "imageUrl": "",
            "output": ""
        }

# 主函数，支持命令行参数
if __name__ == "__main__":
    import sys
    import json
    import os
    
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
        default_prompt = "生成一个足球场"
        
        result = generate_outfit_with_prompt(default_prompt)
        print(json.dumps(result, ensure_ascii=False))