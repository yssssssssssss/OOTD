// 用户服务 - 处理用户注册、登录等操作
import { supabaseConfig } from '@/config/supabase'
import { createClient } from '@supabase/supabase-js'

// 创建 Supabase 客户端
const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// 用户数据类型
export interface UserData {
    user_id?: string
    user_name: string
    user_code: string
    user_score?: number
    create_time?: string
}

// 用户服务类
export class UserService {
    // 当前登录用户的存储键
    private static readonly CURRENT_USER_KEY = 'current_user'
    
    /**
     * 设置当前登录用户
     * @param userData 用户数据
     */
    static setCurrentUser(userData: UserData): void {
        try {
            uni.setStorageSync(this.CURRENT_USER_KEY, userData)
        } catch (error) {
            console.error('保存当前用户信息失败:', error)
        }
    }
    
    /**
     * 获取当前登录用户
     * @returns 当前用户数据或null
     */
    static getCurrentUser(): UserData | null {
        try {
            const userData = uni.getStorageSync(this.CURRENT_USER_KEY)
            return userData || null
        } catch (error) {
            console.error('获取当前用户信息失败:', error)
            return null
        }
    }
    
    /**
     * 清除当前登录用户（登出）
     */
    static clearCurrentUser(): void {
        try {
            uni.removeStorageSync(this.CURRENT_USER_KEY)
        } catch (error) {
            console.error('清除当前用户信息失败:', error)
        }
    }
    
    /**
     * 检查是否有用户登录
     */
    static isLoggedIn(): boolean {
        return this.getCurrentUser() !== null
    }
    /**
     * 用户注册
     * @param username 用户名 (映射到数据库的user_name字段)
     * @param password 密码 (映射到数据库的user_code字段)
     */
    static async registerUser(username: string, password: string): Promise<{
        success: boolean
        message: string
        data?: UserData
    }> {
        try {
            // 检查配置是否正确
            if (supabaseConfig.url === 'YOUR_SUPABASE_URL' || supabaseConfig.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
                return {
                    success: false,
                    message: '请先配置Supabase连接信息'
                }
            }

            // 首先检查用户名是否已存在
            const existingUser = await this.checkUsernameAvailability(username)
            if (!existingUser.available) {
                return {
                    success: false,
                    message: '用户名已存在，请选择其他用户名'
                }
            }

            // 准备用户数据
            const userData = {
                user_name: username,     // 页面账号映射到user_name
                user_code: password,     // 页面密码映射到user_code (注意：实际项目中应该对密码进行加密)
                user_score: 0,           // 默认积分为0
                create_time: new Date().toISOString()
            }

            // 使用fetch API调用Supabase REST API
            const response = await fetch(`${supabaseConfig.url}/rest/v1/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseConfig.anonKey,
                    'Authorization': `Bearer ${supabaseConfig.anonKey}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(userData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('注册失败:', errorData)

                // 处理特定的数据库错误
                if (errorData.code === '23505' || errorData.message?.includes('duplicate')) {
                    return {
                        success: false,
                        message: '用户名已存在，请选择其他用户名'
                    }
                }

                return {
                    success: false,
                    message: '注册失败，请稍后重试'
                }
            }

            const data = await response.json()
            const newUser = Array.isArray(data) ? data[0] : data

            return {
                success: true,
                message: '注册成功！',
                data: {
                    user_id: newUser.user_id,
                    user_name: newUser.user_name,
                    user_score: newUser.user_score,
                    create_time: newUser.create_time
                }
            }
        } catch (error) {
            console.error('注册过程中发生错误:', error)
            return {
                success: false,
                message: '注册失败，请检查网络连接'
            }
        }
    }

    /**
     * 用户登录验证
     * @param username 用户名
     * @param password 密码
     * @returns 登录结果
     */
    static async loginUser(username: string, password: string): Promise<{
        success: boolean
        message: string
        data?: UserData
    }> {
        try {
            // 只使用Supabase数据库进行用户验证
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('user_name', username)
                .eq('user_code', password)
                .single()

            if (error || !data) {
                console.log('登录失败:', error?.message || '用户名或密码错误')
                return {
                    success: false,
                    message: '用户名或密码错误'
                }
            }

            const userData = data as UserData
            // 保存当前登录用户信息
            this.setCurrentUser(userData)

            console.log('登录成功:', userData.user_name)
            return {
                success: true,
                message: '登录成功',
                data: userData
            }

        } catch (error) {
            console.error('登录过程中发生错误:', error)
            return {
                success: false,
                message: '网络错误，请检查网络连接'
            }
        }
    }

    /**
     * 检查用户名是否可用
     * @param username 用户名
     */
    static async checkUsernameAvailability(username: string): Promise<{
        available: boolean
        message: string
    }> {
        try {
            // 使用fetch API查询用户名
            const response = await fetch(`${supabaseConfig.url}/rest/v1/users?user_name=eq.${username}&select=user_name`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseConfig.anonKey,
                    'Authorization': `Bearer ${supabaseConfig.anonKey}`
                }
            })

            if (!response.ok) {
                console.error('检查用户名时发生错误:', response.statusText)
                return {
                    available: false,
                    message: '检查用户名时发生错误'
                }
            }

            const data = await response.json()
            const userExists = Array.isArray(data) && data.length > 0

            return {
                available: !userExists, // 如果没有数据，说明用户名可用
                message: userExists ? '用户名已存在' : '用户名可用'
            }
        } catch (error) {
            console.error('检查用户名时发生错误:', error)
            return {
                available: false,
                message: '网络错误，请检查网络连接'
            }
        }
    }

    /**
     * 获取用户信息
     * @param userId 用户ID
     * @returns 用户信息
     */
    static async getUserById(userId: string): Promise<UserData | null> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (error || !data) {
                return null
            }

            return data as UserData
        } catch (error) {
            console.error('获取用户信息时发生错误:', error)
            return null
        }
    }

    /**
     * 创建测试用户数据（仅用于开发测试）
     */
    static async createTestUsers(): Promise<{
        success: boolean
        message: string
        createdUsers?: string[]
    }> {
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

        const createdUsers: string[] = []
        const errors: string[] = []

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
                    errors.push(`${user.user_name}: ${error.message}`)
                } else {
                    console.log(`成功创建用户 ${user.user_name}`)
                    createdUsers.push(user.user_name)
                }
            } catch (error) {
                console.error(`处理用户 ${user.user_name} 时发生错误:`, error)
                errors.push(`${user.user_name}: ${error}`)
            }
        }

        if (errors.length > 0) {
            return {
                success: false,
                message: `部分用户创建失败: ${errors.join(', ')}`,
                createdUsers
            }
        }

        return {
            success: true,
            message: `成功创建 ${createdUsers.length} 个测试用户`,
            createdUsers
        }
    }
}