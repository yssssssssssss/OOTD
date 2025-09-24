/**
 * 历史记录服务
 * 用于管理用户生成的搭配图片历史记录
 */

export interface HistoryItem {
  id: string
  userId: string
  prompt: string
  imageUrl: string
  characterName?: string
  createdAt: string
  metadata?: {
    generationTime?: number
    parameters?: any
  }
}

export class HistoryService {
  private static readonly STORAGE_KEY = 'ootd_history'
  private static readonly MAX_HISTORY_ITEMS = 100 // 最大保存100条历史记录

  /**
   * 添加历史记录
   */
  static addHistory(item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem {
    const historyItem: HistoryItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    }

    const historyList = this.getHistoryList(item.userId)
    historyList.unshift(historyItem) // 添加到开头

    // 限制历史记录数量
    if (historyList.length > this.MAX_HISTORY_ITEMS) {
      historyList.splice(this.MAX_HISTORY_ITEMS)
    }

    this.saveHistoryList(item.userId, historyList)
    return historyItem
  }

  /**
   * 获取用户的历史记录列表
   */
  static getHistoryList(userId: string): HistoryItem[] {
    try {
      const allHistory = uni.getStorageSync(this.STORAGE_KEY) || {}
      return allHistory[userId] || []
    } catch (error) {
      console.error('获取历史记录失败:', error)
      return []
    }
  }

  /**
   * 获取分页历史记录
   */
  static getHistoryPage(userId: string, page: number = 1, pageSize: number = 20): {
    items: HistoryItem[]
    hasMore: boolean
    total: number
  } {
    const allHistory = this.getHistoryList(userId)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      items: allHistory.slice(startIndex, endIndex),
      hasMore: endIndex < allHistory.length,
      total: allHistory.length
    }
  }

  /**
   * 删除历史记录
   */
  static deleteHistory(userId: string, historyId: string): boolean {
    try {
      const historyList = this.getHistoryList(userId)
      const index = historyList.findIndex(item => item.id === historyId)
      
      if (index !== -1) {
        historyList.splice(index, 1)
        this.saveHistoryList(userId, historyList)
        return true
      }
      return false
    } catch (error) {
      console.error('删除历史记录失败:', error)
      return false
    }
  }

  /**
   * 清空用户的历史记录
   */
  static clearHistory(userId: string): boolean {
    try {
      this.saveHistoryList(userId, [])
      return true
    } catch (error) {
      console.error('清空历史记录失败:', error)
      return false
    }
  }

  /**
   * 根据ID获取历史记录
   */
  static getHistoryById(userId: string, historyId: string): HistoryItem | null {
    const historyList = this.getHistoryList(userId)
    return historyList.find(item => item.id === historyId) || null
  }

  /**
   * 搜索历史记录
   */
  static searchHistory(userId: string, keyword: string): HistoryItem[] {
    const historyList = this.getHistoryList(userId)
    return historyList.filter(item => 
      item.prompt.toLowerCase().includes(keyword.toLowerCase()) ||
      (item.characterName && item.characterName.toLowerCase().includes(keyword.toLowerCase()))
    )
  }

  /**
   * 保存历史记录列表到本地存储
   */
  private static saveHistoryList(userId: string, historyList: HistoryItem[]): void {
    try {
      const allHistory = uni.getStorageSync(this.STORAGE_KEY) || {}
      allHistory[userId] = historyList
      uni.setStorageSync(this.STORAGE_KEY, allHistory)
    } catch (error) {
      console.error('保存历史记录失败:', error)
    }
  }

  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取历史记录统计信息
   */
  static getHistoryStats(userId: string): {
    total: number
    thisWeek: number
    thisMonth: number
  } {
    const historyList = this.getHistoryList(userId)
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      total: historyList.length,
      thisWeek: historyList.filter(item => new Date(item.createdAt) > oneWeekAgo).length,
      thisMonth: historyList.filter(item => new Date(item.createdAt) > oneMonthAgo).length
    }
  }

  /**
   * 导出历史记录（用于备份）
   */
  static exportHistory(userId: string): string {
    const historyList = this.getHistoryList(userId)
    return JSON.stringify(historyList, null, 2)
  }

  /**
   * 导入历史记录（用于恢复）
   */
  static importHistory(userId: string, historyData: string): boolean {
    try {
      const historyList = JSON.parse(historyData) as HistoryItem[]
      
      // 验证数据格式
      if (!Array.isArray(historyList)) {
        throw new Error('Invalid history data format')
      }

      // 合并现有历史记录
      const existingHistory = this.getHistoryList(userId)
      const mergedHistory = [...historyList, ...existingHistory]
      
      // 去重（基于ID）
      const uniqueHistory = mergedHistory.filter((item, index, arr) => 
        arr.findIndex(h => h.id === item.id) === index
      )

      // 按时间排序
      uniqueHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // 限制数量
      if (uniqueHistory.length > this.MAX_HISTORY_ITEMS) {
        uniqueHistory.splice(this.MAX_HISTORY_ITEMS)
      }

      this.saveHistoryList(userId, uniqueHistory)
      return true
    } catch (error) {
      console.error('导入历史记录失败:', error)
      return false
    }
  }
}