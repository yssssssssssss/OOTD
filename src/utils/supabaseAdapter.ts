// Supabase适配器示例 - 将来替换MockDatabaseAdapter时使用
// 需要安装: npm install @supabase/supabase-js

import type { DatabaseAdapter, SupabaseConfig } from './mockData'
import type { Character, UserInfo } from '@/store/index'

// 注释掉的导入，将来启用时取消注释
// import { createClient, SupabaseClient } from '@supabase/supabase-js'

export class SupabaseAdapter implements DatabaseAdapter {
  // private supabase: SupabaseClient
  private config: SupabaseConfig

  constructor(config: SupabaseConfig) {
    this.config = config
    
    // 将来启用时取消注释
    // this.supabase = createClient(config.url, config.anonKey)
  }

  // 用户相关操作
  async getUserById(userId: string): Promise<UserInfo | null> {
    try {
      // 将来的Supabase实现
      /*
      const { data, error } = await this.supabase
        .from(this.config.tableName.users)
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('获取用户失败:', error)
        return null
      }

      return data as UserInfo
      */
      
      // 临时返回null，实际使用时删除这行
      return null
    } catch (error) {
      console.error('获取用户失败:', error)
      return null
    }
  }

  async updateUser(userId: string, updates: Partial<UserInfo>): Promise<UserInfo | null> {
    try {
      // 将来的Supabase实现
      /*
      const { data, error } = await this.supabase
        .from(this.config.tableName.users)
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('更新用户失败:', error)
        return null
      }

      return data as UserInfo
      */
      
      return null
    } catch (error) {
      console.error('更新用户失败:', error)
      return null
    }
  }

  // 角色相关操作
  async getCharactersByUserId(userId: string): Promise<Character[]> {
    try {
      // 将来的Supabase实现
      /*
      const { data, error } = await this.supabase
        .from(this.config.tableName.characters)
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('获取角色列表失败:', error)
        return []
      }

      return data as Character[]
      */
      
      return []
    } catch (error) {
      console.error('获取角色列表失败:', error)
      return []
    }
  }

  async createCharacter(characterData: Omit<Character, 'id' | 'createdAt'>): Promise<Character> {
    try {
      // 将来的Supabase实现
      /*
      const { data, error } = await this.supabase
        .from(this.config.tableName.characters)
        .insert([{
          ...characterData,
          createdAt: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('创建角色失败:', error)
        throw new Error('创建角色失败')
      }

      return data as Character
      */
      
      // 临时抛出错误，实际使用时删除
      throw new Error('Supabase未配置')
    } catch (error) {
      console.error('创建角色失败:', error)
      throw error
    }
  }

  async updateCharacter(characterId: string, updates: Partial<Character>): Promise<Character | null> {
    try {
      // 将来的Supabase实现
      /*
      const { data, error } = await this.supabase
        .from(this.config.tableName.characters)
        .update(updates)
        .eq('id', characterId)
        .select()
        .single()

      if (error) {
        console.error('更新角色失败:', error)
        return null
      }

      return data as Character
      */
      
      return null
    } catch (error) {
      console.error('更新角色失败:', error)
      return null
    }
  }

  async deleteCharacter(characterId: string): Promise<boolean> {
    try {
      // 将来的Supabase实现
      /*
      const { error } = await this.supabase
        .from(this.config.tableName.characters)
        .delete()
        .eq('id', characterId)

      if (error) {
        console.error('删除角色失败:', error)
        return false
      }

      return true
      */
      
      return false
    } catch (error) {
      console.error('删除角色失败:', error)
      return false
    }
  }

  async getCharacterById(characterId: string): Promise<Character | null> {
    try {
      // 将来的Supabase实现
      /*
      const { data, error } = await this.supabase
        .from(this.config.tableName.characters)
        .select('*')
        .eq('id', characterId)
        .single()

      if (error) {
        console.error('获取角色失败:', error)
        return null
      }

      return data as Character
      */
      
      return null
    } catch (error) {
      console.error('获取角色失败:', error)
      return null
    }
  }

  async uploadImage(file: File | string): Promise<string> {
    try {
      // 将来的Supabase Storage实现
      /*
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`
      const filePath = `avatars/${fileName}`

      const { data, error } = await this.supabase.storage
        .from('images')
        .upload(filePath, file)

      if (error) {
        console.error('上传图片失败:', error)
        throw new Error('上传图片失败')
      }

      // 获取公共URL
      const { data: urlData } = this.supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
      */
      
      throw new Error('Supabase未配置')
    } catch (error) {
      console.error('上传图片失败:', error)
      throw error
    }
  }
}

// 配置示例
export const supabaseConfig: SupabaseConfig = {
  url: 'YOUR_SUPABASE_URL', // 替换为你的Supabase URL
  anonKey: 'YOUR_SUPABASE_ANON_KEY', // 替换为你的Supabase匿名密钥
  tableName: {
    users: 'users',
    characters: 'characters'
  }
}

// 使用示例（将来在store中替换MockDatabaseAdapter时使用）
/*
import { SupabaseAdapter, supabaseConfig } from '@/utils/supabaseAdapter'

// 在Store类中
private dbAdapter = new SupabaseAdapter(supabaseConfig)
*/

// Supabase数据库表结构建议
/*
-- 用户表
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  user_id VARCHAR(100) UNIQUE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 角色表
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  image_url TEXT,
  hair_style VARCHAR(50),
  hair_color VARCHAR(50),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全性
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = user_id);

-- 角色访问策略
CREATE POLICY "Users can view own characters" ON characters
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can insert own characters" ON characters
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can update own characters" ON characters
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE user_id = auth.uid()::text));

CREATE POLICY "Users can delete own characters" ON characters
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE user_id = auth.uid()::text));
*/