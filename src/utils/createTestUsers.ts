import { supabaseConfig } from '@/config/supabase'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// 测试用户数据
const testUsers = [
  {
    user_name: 'testuser1',
    user_code: '123456',
    user_score: 150,
    create_time: new Date().toISOString()
  },
  {
    user_name: 'testuser2', 
    user_code: 'password123',
    user_score: 280,
    create_time: new Date().toISOString()
  }
]

export async function createTestUsers() {
  console.log('开始创建测试用户...')
  
  for (const user of testUsers) {
    try {
      // 检查用户是否已存在
      const { data: existingUser } = await supabase
        .from('users')
        .select('user_name')
        .eq('user_name', user.user_name)
        .single()

      if (existingUser) {
        console.log(`用户 ${user.user_name} 已存在，跳过创建`)
        continue
      }

      // 创建新用户
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()

      if (error) {
        console.error(`创建用户 ${user.user_name} 失败:`, error.message)
      } else {
        console.log(`成功创建用户 ${user.user_name}`)
      }
    } catch (error) {
      console.error(`处理用户 ${user.user_name} 时发生错误:`, error)
    }
  }
  
  console.log('测试用户创建完成')
}

// 如果直接运行此文件，则执行创建用户操作
if (typeof window === 'undefined') {
  createTestUsers()
}