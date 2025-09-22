/**
 * Coze API 调用工具
 */

export interface CozeApiResponse {
  success: boolean
  imageUrl?: string
  message?: string
  error?: string
}

export interface OutfitGenerationRequest {
  prompt: string
  characterName?: string
  style?: string
  season?: string
  occasion?: string
}

/**
 * 调用Coze workflow生成搭配
 */
export async function generateOutfit(request: OutfitGenerationRequest): Promise<CozeApiResponse> {
  try {
    // 构建完整的prompt
    const fullPrompt = buildPrompt(request)
    
    // 调用真实的Coze workflow API
    const response = await callCozeWorkflow(fullPrompt, request.characterName)
    
    return response
  } catch (error) {
    console.error('Coze API调用失败:', error)
    return {
      success: false,
      error: '生成搭配失败，请重试'
    }
  }
}

/**
 * 构建发送给Coze的prompt
 */
function buildPrompt(request: OutfitGenerationRequest): string {
  const { prompt, characterName, style, season, occasion } = request
  
  let fullPrompt = prompt
  
  if (characterName) {
    fullPrompt += `\n角色：${characterName}`
  }
  
  if (style) {
    fullPrompt += `\n风格偏好：${style}`
  }
  
  if (season) {
    fullPrompt += `\n季节：${season}`
  }
  
  if (occasion) {
    fullPrompt += `\n场合：${occasion}`
  }
  
  return fullPrompt
}

/**
 * 调用Python脚本执行Coze workflow
 */
async function callCozeWorkflow(prompt: string, characterName?: string): Promise<CozeApiResponse> {
  try {
    // 构建参数对象
    const params = {
      prompt: prompt,
      character_name: characterName || '',
      additional_params: {}
    };
    
    // 调用Python脚本
     const response = await fetch('http://localhost:3001/api/generate-outfit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        imageUrl: result.imageUrl || '/static/generated-outfit.jpg',
        message: result.message || '搭配生成成功！'
      };
    } else {
      throw new Error(result.error || '生成搭配失败');
    }
  } catch (error) {
    console.error('调用Coze workflow失败:', error);
    
    // 如果API调用失败，回退到模拟数据
    console.log('回退到模拟数据');
    return mockCozeWorkflow(prompt);
  }
}

/**
 * 模拟Coze workflow调用
 * 在实际项目中，这里应该调用真实的后端API
 */
async function mockCozeWorkflow(prompt: string): Promise<CozeApiResponse> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
  
  // 模拟成功率（90%成功）
  const isSuccess = Math.random() > 0.1
  
  if (isSuccess) {
    // 模拟返回生成的图片URL
    const mockImageUrls = [
      'https://via.placeholder.com/400x600/FFB6C1/FFFFFF?text=时尚搭配1',
      'https://via.placeholder.com/400x600/87CEEB/FFFFFF?text=时尚搭配2',
      'https://via.placeholder.com/400x600/DDA0DD/FFFFFF?text=时尚搭配3',
      'https://via.placeholder.com/400x600/F0E68C/FFFFFF?text=时尚搭配4',
      'https://via.placeholder.com/400x600/98FB98/FFFFFF?text=时尚搭配5'
    ]
    
    const randomImageUrl = mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)]
    
    return {
      success: true,
      imageUrl: randomImageUrl,
      message: '搭配生成成功！'
    }
  } else {
    return {
      success: false,
      error: '生成失败，请重试'
    }
  }
}

/**
 * 真实的API调用函数（待实现）
 * 这个函数应该调用你的后端服务，后端服务再调用coze_workflow_test1.py
 */
export async function callRealCozeAPI(prompt: string): Promise<CozeApiResponse> {
  try {
    // 这里应该是真实的API调用
    const response = await fetch('/api/generate-outfit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API调用失败:', error)
    return {
      success: false,
      error: '网络请求失败'
    }
  }
}