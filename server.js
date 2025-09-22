const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // 服务静态文件

// API路由：生成搭配
app.post('/api/generate-outfit', async (req, res) => {
  try {
    const { prompt, character_name, additional_params } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt参数是必需的'
      });
    }
    
    // 构建传递给Python脚本的参数
    const pythonParams = {
      prompt,
      character_name: character_name || '',
      additional_params: additional_params || {}
    };
    
    // 将参数写入临时文件
    const fs = require('fs');
    const tempFile = path.join(__dirname, 'temp_params.json');
    fs.writeFileSync(tempFile, JSON.stringify(pythonParams, null, 2));
    
    // 调用Python脚本，传递临时文件路径
    // 使用测试版本确保演示功能正常，真实API需要有效的token
    const pythonScript = 'test_coze_workflow.py'; // 测试版本，可改为 'coze_workflow_test1.py'
    const pythonProcess = spawn('python', [
      path.join(__dirname, pythonScript),
      '--file',
      tempFile
    ]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          // 尝试解析Python脚本的输出
          const lines = output.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          
          if (lastLine.startsWith('{')) {
            const result = JSON.parse(lastLine);
            res.json({
              success: true,
              message: result.message || '搭配生成成功',
              imageUrl: '/static/generated-outfit.jpg', // 这里应该是实际生成的图片URL
              output: output // 包含完整输出用于调试
            });
          } else {
            res.json({
              success: true,
              message: '搭配生成完成',
              output: output
            });
          }
        } catch (parseError) {
          console.error('解析Python输出失败:', parseError);
          res.json({
            success: true,
            message: '搭配生成完成',
            output: output
          });
        }
      } else {
        console.error('Python脚本执行失败:', errorOutput);
        res.status(500).json({
          success: false,
          error: `Python脚本执行失败 (退出码: ${code})`,
          details: errorOutput
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('启动Python进程失败:', error);
      res.status(500).json({
        success: false,
        error: '启动Python进程失败',
        details: error.message
      });
    });
    
  } catch (error) {
    console.error('API处理错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      details: error.message
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`API服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});

module.exports = app;