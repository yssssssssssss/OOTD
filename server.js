const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://zggcpsevulwgfaguotqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZ2Nwc2V2dWx3Z2ZhZ3VvdHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzMzOTgsImV4cCI6MjA3NDIwOTM5OH0.YJB2tIYXrdv_20vVOCQZ3wYjatgZxrHxH4JrBbQIIxw';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const PORT = 3001;

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB限制
  },
  fileFilter: function (req, file, cb) {
    // 检查文件类型
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

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
    // 使用真实的Coze API脚本
    const pythonScript = 'coze_workflow_test1.py'; // 使用真实的Coze API脚本
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
          // 过滤输出，移除调试信息
          const cleanOutput = output
            .split('\n')
            .filter(line => 
              !line.includes('got message') && 
              !line.includes('got error') && 
              line.trim() !== ''
            )
            .join('\n');
          
          // 尝试解析Python脚本的输出
          const lines = cleanOutput.trim().split('\n');
          const lastLine = lines[lines.length - 1];
          
          if (lastLine.startsWith('{')) {
            const result = JSON.parse(lastLine);
            res.json({
              success: true,
              message: result.message || '搭配生成成功',
              imageUrl: result.imageUrl || '/static/generated-outfit.jpg',
              output: process.env.NODE_ENV === 'production' ? '搭配生成完成' : cleanOutput
            });
          } else {
            res.json({
              success: true,
              message: '搭配生成完成',
              imageUrl: '/static/generated-outfit.jpg',
              output: process.env.NODE_ENV === 'production' ? '搭配生成完成' : cleanOutput
            });
          }
        } catch (parseError) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('解析Python输出失败:', parseError);
          }
          res.json({
            success: true,
            message: '搭配生成完成',
            imageUrl: '/static/generated-outfit.jpg',
            output: '搭配生成完成'
          });
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Python脚本执行失败:', errorOutput);
        }
        res.status(500).json({
          success: false,
          error: `Python脚本执行失败 (退出码: ${code})`,
          details: process.env.NODE_ENV === 'production' ? '执行失败' : errorOutput
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

// API路由：上传图片到图床
app.post('/api/upload-avatar', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '没有上传文件'
      });
    }

    const filePath = req.file.path;
    const customName = `avatar_${Date.now()}`;

    // 调用Python脚本上传到图床
    const pythonProcess = spawn('python', [
      path.join(__dirname, 'upload_img_imgbed.py'),
      filePath,
      customName
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      // 删除临时文件
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('删除临时文件失败:', err);
      }

      console.log('Python脚本执行完成，退出码:', code);
      console.log('Python脚本输出:', output);
      console.log('Python脚本错误输出:', errorOutput);

      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          
          if (result.success) {
            res.json({
              success: true,
              message: '图片上传成功',
              imageUrl: result.url || result.data
            });
          } else {
            console.error('Python脚本返回失败结果:', result);
            res.status(500).json({
              success: false,
              error: '图片上传失败',
              details: result.error
            });
          }
        } catch (parseError) {
          console.error('解析Python输出失败:', parseError);
          console.error('原始输出内容:', output);
          res.status(500).json({
            success: false,
            error: '解析上传结果失败',
            details: output
          });
        }
      } else {
        console.error('Python脚本执行失败，退出码:', code);
        console.error('错误输出:', errorOutput);
        res.status(500).json({
          success: false,
          error: '图片上传失败',
          details: errorOutput
        });
      }
    });

    pythonProcess.on('error', (error) => {
      // 删除临时文件
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('删除临时文件失败:', err);
      }
      
      console.error('启动Python进程失败:', error);
      res.status(500).json({
        success: false,
        error: '启动上传进程失败',
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

// API路由：创建角色
app.post('/api/create-character', async (req, res) => {
  console.log('=== 收到创建角色请求 ===');
  console.log('请求数据:', req.body);
  
  try {
    const { userId, characterName, imageUrl, hairStyle, hairColor } = req.body;

    if (!userId || !characterName || !imageUrl || !hairStyle || !hairColor) {
      console.log('缺少必要参数:', { userId, characterName, imageUrl, hairStyle, hairColor });
      return res.status(400).json({
        success: false,
        error: '缺少必要的角色信息'
      });
    }

    // 检查用户是否存在 (可选，但推荐)
    console.log('检查用户是否存在, userId:', userId);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    console.log('用户查询结果:', { userData, userError });

    if (userError || !userData) {
      console.log('用户不存在或查询失败');
      return res.status(404).json({
        success: false,
        error: '用户不存在或查询失败',
        details: userError ? userError.message : ''
      });
    }

    // 保存到Supabase数据库的user_avatars表
    console.log('准备保存到数据库，数据:', {
      user_id: userId,
      avatar_name: characterName,
      avatar_url: imageUrl,
      hair_style: hairStyle,
      hair_color: hairColor
    });
    
    const { data: avatarData, error: dbError } = await supabase
      .from('user_avatars')
      .insert({
        user_id: userId,
        avatar_name: characterName,
        avatar_url: imageUrl,
        hair_style: hairStyle,
        hair_color: hairColor,
        created_at: new Date().toISOString()
      })
      .select();

    console.log('数据库保存结果:', { avatarData, dbError });

    if (dbError) {
      console.error('保存到数据库失败:', dbError);
      return res.status(500).json({
        success: false,
        error: '保存角色信息到数据库失败',
        details: dbError.message
      });
    }

    console.log('角色创建成功!');
    res.json({
      success: true,
      message: '角色创建成功',
      character: avatarData[0]
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