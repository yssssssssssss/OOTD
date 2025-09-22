# OOTD API 使用说明

## 功能概述

本项目实现了从前端页面动态传递Prompt到Python脚本的功能，用户点击"试同款"按钮时，会根据当前选择的角色、时间、季节等信息动态构建Prompt，并传递给Coze workflow进行处理。

## 架构说明

```
前端页面 (outfit-detail.vue) 
    ↓ 
API调用 (cozeApi.ts)
    ↓
后端服务器 (server.js)
    ↓
Python脚本 (coze_workflow_test1.py)
    ↓
Coze Workflow API
```

## 文件说明

### 1. 前端文件

- **`src/pages/outfit-detail/outfit-detail.vue`**: 搭配详情页面
  - 包含动态Prompt构建逻辑
  - 根据当前时间、季节、角色信息生成个性化Prompt

- **`src/utils/cozeApi.ts`**: API调用工具
  - 处理前端到后端的API请求
  - 包含错误处理和回退机制

### 2. 后端文件

- **`server.js`**: Node.js API服务器
  - 监听端口3001
  - 处理`/api/generate-outfit`接口
  - 调用Python脚本并返回结果

- **`coze_workflow_test1.py`**: Python脚本
  - 接收命令行参数或JSON参数
  - 调用Coze workflow API
  - 支持动态Prompt传递

### 3. 配置文件

- **`server-package.json`**: 后端依赖配置
- **`start-server.bat`**: Windows启动脚本

## 使用方法

### 1. 启动后端服务器

方法一：使用批处理文件（推荐）
```bash
# 双击运行
start-server.bat
```

方法二：手动启动
```bash
# 安装依赖
npm install express cors

# 启动服务器
node server.js
```

### 2. 启动前端应用

```bash
# 在项目根目录
npm run dev:h5
```

### 3. 测试功能

1. 访问前端应用：`http://localhost:5173`
2. 进入搭配详情页面：`http://localhost:5173/#/pages/outfit-detail/outfit-detail`
3. 选择不同的角色
4. 点击"试同款"按钮
5. 查看控制台输出和API调用结果

## API接口

### POST /api/generate-outfit

**请求参数：**
```json
{
  "prompt": "动态生成的Prompt文本",
  "character_name": "角色名称",
  "additional_params": {}
}
```

**响应格式：**
```json
{
  "success": true,
  "message": "搭配生成成功",
  "imageUrl": "/static/generated-outfit.jpg",
  "output": "Python脚本完整输出"
}
```

## 动态Prompt生成

系统会根据以下信息动态生成Prompt：

1. **角色信息**：当前选择的角色名称
2. **时间信息**：当前时段（上午/下午/晚上/深夜）
3. **季节信息**：当前季节（春/夏/秋/冬）
4. **个性化要求**：根据角色特点定制的搭配要求

### 示例Prompt

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

## 故障排除

### 1. 后端服务器无法启动
- 检查端口3001是否被占用
- 确保已安装Node.js
- 检查依赖是否正确安装

### 2. Python脚本执行失败
- 确保Python环境正确配置
- 检查coze_workflow_test1.py中的API密钥配置
- 查看服务器控制台的错误信息

### 3. 前端API调用失败
- 确保后端服务器正在运行
- 检查浏览器控制台的网络错误
- 验证API地址是否正确

## 开发说明

### 扩展Prompt生成逻辑

可以在`outfit-detail.vue`的`buildDynamicPrompt`函数中添加更多个性化逻辑：

```javascript
const buildDynamicPrompt = () => {
  // 添加更多动态信息
  const weather = getCurrentWeather(); // 天气信息
  const userPreferences = getUserPreferences(); // 用户偏好
  const trendingStyles = getTrendingStyles(); // 流行趋势
  
  // 构建更复杂的Prompt
  return `...`;
};
```

### 添加新的API端点

在`server.js`中添加新的路由：

```javascript
app.post('/api/new-endpoint', (req, res) => {
  // 处理新的API请求
});
```

## 注意事项

1. 确保Coze API密钥正确配置
2. Python脚本需要正确的依赖环境
3. 后端服务器和前端应用需要同时运行
4. 注意跨域问题的处理