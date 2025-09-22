# OOTD 动态Prompt传递功能演示指南

## 功能概述

✅ **已完成**：从前端页面动态传递Prompt到Python脚本的完整功能链路

## 当前运行状态

### 1. 前端应用
- **状态**: ✅ 运行中
- **地址**: http://localhost:5173
- **页面**: http://localhost:5173/#/pages/outfit-detail/outfit-detail

### 2. 后端API服务器
- **状态**: ✅ 运行中
- **地址**: http://localhost:3001
- **健康检查**: http://localhost:3001/api/health

### 3. Python脚本
- **状态**: ✅ 可用
- **文件**: test_coze_workflow.py (测试版本)
- **功能**: 接收动态Prompt并模拟处理

## 功能演示步骤

### 步骤1: 访问页面
1. 打开浏览器访问: http://localhost:5173/#/pages/outfit-detail/outfit-detail
2. 页面显示搭配详情界面

### 步骤2: 选择角色
1. 点击页面底部的角色头像
2. 在弹出的角色选择弹窗中选择不同角色（Cindy、JANY、Mary等）
3. 观察选中角色的变化

### 步骤3: 测试动态Prompt生成
1. 点击"试同款"按钮
2. 系统会自动：
   - 根据当前时间生成时段信息（上午/下午/晚上/深夜）
   - 根据当前日期生成季节信息（春/夏/秋/冬）
   - 结合选中的角色名称
   - 构建个性化的Prompt

### 步骤4: 观察处理流程
1. 前端发送请求到后端API
2. 后端接收请求并调用Python脚本
3. Python脚本处理Prompt并返回结果
4. 前端显示处理结果

## 动态Prompt示例

当前选择角色为"Cindy"，时间为下午，季节为冬季时，生成的Prompt为：

```
请为Cindy生成一套时尚搭配。要求：
1. 风格：现代简约，适合Cindy的个人特色
2. 季节：冬季，适合当前季节穿着
3. 时间：下午，适合当前时段的活动
4. 色彩：协调统一，突出个人魅力
5. 场合：适合日常工作和休闲活动
6. 请生成高质量的搭配效果图，包含上衣、下装、鞋子等完整搭配
7. 搭配风格要符合当下流行趋势，同时保持实用性
8. 考虑Cindy的身材特点，选择最适合的版型和款式
9. 提供具体的搭配建议和穿搭技巧
10. 生成的搭配要有创新性，避免过于常见的组合
```

## 技术验证

### API测试
可以直接测试API端点：

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/generate-outfit" -Method POST -ContentType "application/json" -Body '{"prompt":"请为Mary生成一套优雅的职场搭配","character_name":"Mary"}'
```

### Python脚本测试
可以直接测试Python脚本：

```bash
python test_coze_workflow.py --file test_params.json
```

## 监控和调试

### 1. 前端控制台
- 打开浏览器开发者工具
- 查看Console标签页的日志输出
- 观察Network标签页的API请求

### 2. 后端服务器日志
- 查看运行node server.js的终端
- 观察API请求处理日志

### 3. Python脚本输出
- Python脚本的详细输出会显示在后端服务器日志中
- 包含Prompt内容、处理过程和结果

## 切换到真实Coze API

当需要使用真实的Coze workflow时：

1. 确保coze_workflow_test1.py中的API配置正确
2. 安装必要的Python依赖：`pip install cozepy`
3. 修改server.js中的pythonScript变量：
   ```javascript
   const pythonScript = 'coze_workflow_test1.py'; // 改为真实脚本
   ```
4. 重启后端服务器

## 故障排除

### 常见问题
1. **前端页面无法访问**: 检查前端开发服务器是否运行
2. **API调用失败**: 检查后端服务器是否运行在3001端口
3. **Python脚本错误**: 查看后端服务器日志中的详细错误信息

### 检查服务状态
```powershell
# 检查端口占用
netstat -an | findstr :5173  # 前端端口
netstat -an | findstr :3001  # 后端端口

# 测试API健康状态
Invoke-RestMethod -Uri "http://localhost:3001/api/health"
```

## 功能特色

✅ **动态Prompt生成**: 根据时间、季节、角色自动生成个性化Prompt  
✅ **参数传递**: 通过文件方式安全传递复杂参数到Python脚本  
✅ **错误处理**: 完整的错误处理和回退机制  
✅ **实时响应**: 前后端实时通信，用户体验流畅  
✅ **可扩展性**: 易于扩展更多个性化参数和逻辑  

## 下一步扩展

1. **增加更多动态参数**: 天气、用户偏好、流行趋势等
2. **优化Prompt模板**: 更智能的Prompt构建逻辑
3. **结果展示**: 更丰富的搭配结果展示界面
4. **用户个性化**: 保存用户偏好和历史记录