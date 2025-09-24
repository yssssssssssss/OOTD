/**
 * 图片生成服务
 * 用于调用Python脚本生成搭配图片并保存到历史记录
 */

import { HistoryService, type HistoryItem } from './historyService'
import { UserService } from './userService'

export interface GenerationParams {
  prompt: string
  characterName?: string
  additionalParams?: any
}

export interface GenerationResult {
  success: boolean
  message?: string
  imageUrl?: string
  output?: string
  error?: string
  historyItem?: HistoryItem
}

export class ImageGenerationService {
  private static readonly API_BASE_URL = 'http://localhost:3001' // 后端服务地址

  /**
   * 生成搭配图片
   */
  static async generateOutfit(params: GenerationParams): Promise<GenerationResult> {
    try {
      const currentUser = UserService.getCurrentUser()
      if (!currentUser) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      // 调用后端API生成图片
      const response = await uni.request({
        url: `${this.API_BASE_URL}/api/generate-outfit`,
        method: 'POST',
        data: {
          prompt: params.prompt,
          characterName: params.characterName || '',
          additionalParams: params.additionalParams || {},
          userId: currentUser.id
        },
        timeout: 60000 // 60秒超时
      })

      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}: ${response.data?.error || '生成失败'}`)
      }

      const result = response.data as any

      if (!result.success) {
        return {
          success: false,
          error: result.error || result.message || '生成失败'
        }
      }

      // 保存到历史记录
      const historyItem = HistoryService.addHistory({
        userId: currentUser.id,
        prompt: params.prompt,
        imageUrl: result.imageUrl,
        characterName: params.characterName,
        metadata: {
          generationTime: Date.now(),
          parameters: params.additionalParams,
          output: result.output
        }
      })

      return {
        success: true,
        message: result.message,
        imageUrl: result.imageUrl,
        output: result.output,
        historyItem
      }

    } catch (error) {
      console.error('生成图片失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成失败'
      }
    }
  }

  /**
   * 获取生成状态（用于长时间生成的轮询）
   */
  static async getGenerationStatus(taskId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress?: number
    result?: GenerationResult
  }> {
    try {
      const response = await uni.request({
        url: `${this.API_BASE_URL}/api/generation-status/${taskId}`,
        method: 'GET'
      })

      if (response.statusCode === 200) {
        return response.data as any
      } else {
        throw new Error(`HTTP ${response.statusCode}`)
      }
    } catch (error) {
      console.error('获取生成状态失败:', error)
      return {
        status: 'failed'
      }
    }
  }

  /**
   * 批量生成图片
   */
  static async batchGenerateOutfits(paramsList: GenerationParams[]): Promise<GenerationResult[]> {
    const results: GenerationResult[] = []
    
    for (const params of paramsList) {
      try {
        const result = await this.generateOutfit(params)
        results.push(result)
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : '生成失败'
        })
      }
    }
    
    return results
  }

  /**
   * 重新生成图片（基于历史记录）
   */
  static async regenerateFromHistory(historyId: string): Promise<GenerationResult> {
    try {
      const currentUser = UserService.getCurrentUser()
      if (!currentUser) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      const historyItem = HistoryService.getHistoryById(currentUser.id, historyId)
      if (!historyItem) {
        return {
          success: false,
          error: '历史记录不存在'
        }
      }

      return await this.generateOutfit({
        prompt: historyItem.prompt,
        characterName: historyItem.characterName,
        additionalParams: historyItem.metadata?.parameters
      })
    } catch (error) {
      console.error('重新生成失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '重新生成失败'
      }
    }
  }

  /**
   * 验证生成参数
   */
  static validateParams(params: GenerationParams): { valid: boolean; error?: string } {
    if (!params.prompt || params.prompt.trim().length === 0) {
      return {
        valid: false,
        error: '请输入生成提示'
      }
    }

    if (params.prompt.length > 500) {
      return {
        valid: false,
        error: '生成提示过长，请控制在500字符以内'
      }
    }

    return { valid: true }
  }

  /**
   * 获取推荐的生成提示
   */
  static getRecommendedPrompts(): string[] {
    return [
      '夏日清新搭配，白色T恤配牛仔裤',
      '职场优雅风格，西装外套配半身裙',
      '休闲运动风，运动套装配运动鞋',
      '甜美约会装，连衣裙配小白鞋',
      '复古文艺范，格子衬衫配阔腿裤',
      '街头潮流风，卫衣配破洞牛仔裤',
      '温柔淑女风，针织衫配百褶裙',
      '简约极简风，纯色上衣配直筒裤'
    ]
  }

  /**
   * 获取角色名称建议
   */
  static getCharacterSuggestions(): string[] {
    return [
      '小雅',
      '小美',
      '小丽',
      '小欣',
      '小慧',
      '小婷',
      '小琳',
      '小娜'
    ]
  }

  /**
   * 格式化生成时间
   */
  static formatGenerationTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) {
      return `${seconds}秒前`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}分钟前`
    } else if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)}小时前`
    } else {
      return `${Math.floor(seconds / 86400)}天前`
    }
  }
}