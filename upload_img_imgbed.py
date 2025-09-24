import requests
import sys
import os
import json

def upload_image_to_imgbed(image_path, custom_name=None):
    """
    上传图片到图床
    
    Args:
        image_path (str): 图片文件路径
        custom_name (str): 自定义文件名
    
    Returns:
        dict: 包含上传结果的字典
    """
    
    # 检查文件是否存在
    if not os.path.exists(image_path):
        return {
            "success": False,
            "error": f"文件不存在: {image_path}"
        }
    
    # 获取文件名
    filename = os.path.basename(image_path)
    if custom_name:
        # 保持原文件扩展名
        ext = os.path.splitext(filename)[1]
        filename = custom_name + ext
    
    try:
        # 根据文件扩展名确定MIME类型
        ext = os.path.splitext(filename)[1].lower()
        mime_type = 'image/jpeg'  # 默认值
        if ext == '.png':
            mime_type = 'image/png'
        elif ext == '.jpg' or ext == '.jpeg':
            mime_type = 'image/jpeg'
        elif ext == '.gif':
            mime_type = 'image/gif'
        elif ext == '.webp':
            mime_type = 'image/webp'
        
        # 准备上传的文件和数据
        with open(image_path, 'rb') as f:
            files = {
                'file': (filename, f, mime_type)
            }
            
            # 添加必需的表单数据
            data = {
                'fileName': filename,
                'uid': 'heyunshenys@163.com'  # 根据Java代码示例添加的token
            }
            
            # 尝试第一个图床API
            try:
                response = requests.post(
                    'https://playground.z.wiki/img/api/upload',
                    files=files,
                    data=data,
                    timeout=30
                )
                
                # 如果第一个API失败，尝试备用API
                if response.status_code != 200:
                    # 重新打开文件用于第二次尝试
                    f.seek(0)
                    files_backup = {
                        'smfile': (filename, f, mime_type)
                    }
                    response = requests.post(
                        'https://sm.ms/api/v2/upload',
                        files=files_backup,
                        timeout=30
                    )
            except requests.exceptions.RequestException:
                # 如果第一个API完全失败，尝试备用API
                f.seek(0)
                files_backup = {
                    'smfile': (filename, f, mime_type)
                }
                response = requests.post(
                    'https://sm.ms/api/v2/upload',
                    files=files_backup,
                    timeout=30
                )
            
            # 检查响应状态
            if response.status_code == 200:
                try:
                    result = response.json()
                    
                    # 处理不同API的响应格式
                    image_url = ""
                    if 'url' in result:
                        # playground.z.wiki格式
                        image_url = result.get('url', '')
                    elif 'data' in result and isinstance(result['data'], dict):
                        # sm.ms格式
                        image_url = result['data'].get('url', '')
                    elif isinstance(result, dict) and 'success' in result:
                        # 其他格式
                        if result.get('success') and 'data' in result:
                            image_url = result['data'].get('url', '')
                    
                    return {
                        "success": True,
                        "data": result,
                        "url": image_url,
                        "message": "上传成功"
                    }
                except json.JSONDecodeError:
                    return {
                        "success": True,
                        "data": response.text,
                        "url": response.text,
                        "message": "上传成功"
                    }
            else:
                return {
                    "success": False,
                    "error": f"上传失败，状态码: {response.status_code}",
                    "response": response.text
                }
                
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"网络请求失败: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"上传过程中发生错误: {str(e)}"
        }

def main():
    """
    命令行入口函数
    """
    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "请提供图片文件路径"
        }))
        sys.exit(1)
    
    image_path = sys.argv[1]
    custom_name = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = upload_image_to_imgbed(image_path, custom_name)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()