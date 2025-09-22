// 数据库配置文件 - 方便在Mock数据和Supabase之间切换

import type { DatabaseAdapter } from '@/utils/mockData'
import { MockDatabaseAdapter } from '@/utils/mockData'
// import { SupabaseAdapter, supabaseConfig } from '@/utils/supabaseAdapter'

// 数据库类型
export type DatabaseType = 'mock' | 'supabase'

// 当前使用的数据库类型
export const DATABASE_TYPE: DatabaseType = 'mock' // 将来改为 'supabase'

// 数据库适配器工厂
export function createDatabaseAdapter(): DatabaseAdapter {
  switch (DATABASE_TYPE) {
    case 'mock':
      return new MockDatabaseAdapter()
    
    case 'supabase':
      // 将来启用Supabase时取消注释
      // return new SupabaseAdapter(supabaseConfig)
      throw new Error('Supabase适配器尚未配置，请先配置Supabase')
    
    default:
      throw new Error(`不支持的数据库类型: ${DATABASE_TYPE}`)
  }
}

// 环境配置
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

// 开发环境配置
export const devConfig = {
  // 是否启用模拟数据
  useMockData: true,
  
  // 是否显示调试信息
  showDebugInfo: true,
  
  // 模拟网络延迟（毫秒）
  mockNetworkDelay: 300
}

// 生产环境配置
export const prodConfig = {
  useMockData: false,
  showDebugInfo: false,
  mockNetworkDelay: 0
}

// 当前环境配置
export const config = isDevelopment ? devConfig : prodConfig

// 数据库迁移指南
export const migrationGuide = {
  steps: [
    '1. 安装Supabase客户端: npm install @supabase/supabase-js',
    '2. 在Supabase控制台创建项目',
    '3. 创建数据库表（参考 supabaseAdapter.ts 中的SQL）',
    '4. 配置环境变量或更新 supabaseConfig',
    '5. 将 DATABASE_TYPE 改为 "supabase"',
    '6. 取消注释 supabaseAdapter.ts 中的相关代码',
    '7. 测试数据迁移和功能'
  ],
  
  notes: [
    '• Mock数据会自动保存在本地存储中',
    '• 迁移前建议备份本地数据',
    '• Supabase提供实时数据同步功能',
    '• 可以先在开发环境测试Supabase集成'
  ]
}

// 数据迁移工具
export class DataMigrationTool {
  static async exportMockData() {
    try {
      const users = uni.getStorageSync('mock_users') || []
      const characters = uni.getStorageSync('mock_characters') || []
      
      const exportData = {
        users,
        characters,
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('导出数据失败:', error)
      throw error
    }
  }
  
  static async importMockData(jsonData: string) {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.users) {
        uni.setStorageSync('mock_users', data.users)
      }
      
      if (data.characters) {
        uni.setStorageSync('mock_characters', data.characters)
      }
      
      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      throw error
    }
  }
  
  static async clearAllData() {
    try {
      uni.removeStorageSync('mock_users')
      uni.removeStorageSync('mock_characters')
      return true
    } catch (error) {
      console.error('清空数据失败:', error)
      throw error
    }
  }
}