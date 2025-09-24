import { reactive, ref } from 'vue'
import { createDatabaseAdapter } from '@/config/database'
import { UserService, type UserData } from '@/utils/userService'

// 用户信息接口
export interface UserInfo {
  id: string
  username: string
  email?: string
  password: string
  points: number
  userId: string
  avatars: string[]  // 用户拥有的所有头像URL
  currentAvatar: string  // 当前使用的头像URL
  createdAt: string
}

// 角色信息接口
export interface Character {
  id: string
  name: string
  imageUrl: string
  hairStyle: string
  hairColor: string
  createdAt: string
  userId: string
}

// 全局状态
class Store {
  // 用户信息
  userInfo = reactive<UserInfo>({
    id: '1',
    username: 'ys',
    email: 'ys@example.com',
    password: '',
    points: 0,
    userId: 'iVjnyp/JW8Whiv4ye+cLewTQDKXF0',
    avatars: [],
    currentAvatar: '/static/default-avatar.svg',
    createdAt: new Date().toISOString()
  })

  // 角色列表
  characters = ref<Character[]>([])

  // 加载状态
  loading = ref(false)

  // 数据库适配器，通过配置文件管理
  private dbAdapter = createDatabaseAdapter()

  // 初始化数据
  async init() {
    this.loading.value = true
    try {
      // 首先尝试从UserService获取当前登录用户
      const currentUser = UserService.getCurrentUser()
      if (currentUser) {
        // 将UserData映射到UserInfo
        Object.assign(this.userInfo, {
          id: currentUser.user_id || '1',
          username: currentUser.user_name,
          email: '', // UserData中没有email字段
          password: '', // 不存储密码
          points: currentUser.user_score || 0,
          userId: currentUser.user_id || 'unknown',
          avatars: [],
          currentAvatar: '/static/default-avatar.svg',
          createdAt: currentUser.create_time || new Date().toISOString()
        })
      } else {
        // 如果没有登录用户，设置默认信息
        Object.assign(this.userInfo, {
          id: '1',
          username: 'ys',
          email: 'ys@example.com',
          password: '',
          points: 0,
          userId: 'iVjnyp/JW8Whiv4ye+cLewTQDKXF0',
          avatars: [],
          currentAvatar: '/static/default-avatar.svg',
          createdAt: new Date().toISOString()
        })
      }
      
      // 加载角色数据
      await this.loadCharacters()
    } catch (error) {
      console.error('初始化失败:', error)
    } finally {
      this.loading.value = false
    }
  }

  // 加载用户信息
  async loadUserInfo() {
    try {
      // 从本地存储获取用户信息
      const storedUser = uni.getStorageSync('userInfo')
      if (storedUser) {
        Object.assign(this.userInfo, storedUser)
      } else {
        // 如果没有存储的用户信息，使用默认值并保存
        this.saveUserInfo()
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }

  // 保存用户信息
  saveUserInfo() {
    try {
      uni.setStorageSync('userInfo', this.userInfo)
    } catch (error) {
      console.error('保存用户信息失败:', error)
    }
  }

  // 更新用户信息
  updateUserInfo(updates: Partial<UserInfo>) {
    Object.assign(this.userInfo, updates)
    this.saveUserInfo()
  }

  // 刷新用户信息（从UserService获取最新数据）
  refreshUserInfo() {
    const currentUser = UserService.getCurrentUser()
    if (currentUser) {
      // 将UserData映射到UserInfo
      Object.assign(this.userInfo, {
        id: currentUser.user_id || '1',
        username: currentUser.user_name,
        email: this.userInfo.email, // 保持现有email
        password: '', // 不存储密码
        points: currentUser.user_score || 0,
        userId: currentUser.user_id || 'unknown',
        avatars: this.userInfo.avatars, // 保持现有头像列表
        currentAvatar: this.userInfo.currentAvatar, // 保持现有头像
        createdAt: currentUser.create_time || new Date().toISOString()
      })
      this.saveUserInfo()
    }
  }

  // 更新用户头像
  async updateUserAvatar(avatarUrl: string) {
    try {
      const updatedUser = await this.dbAdapter.updateUserAvatar(this.userInfo.id, avatarUrl)
      if (updatedUser) {
        Object.assign(this.userInfo, updatedUser)
        return true
      }
      return false
    } catch (error) {
      console.error('更新头像失败:', error)
      throw error
    }
  }

  // 获取所有可用头像
  async getAvailableAvatars(): Promise<string[]> {
    try {
      return await this.dbAdapter.getAvailableAvatars()
    } catch (error) {
      console.error('获取可用头像失败:', error)
      return []
    }
  }

  // 为用户添加新头像
  async addUserAvatar(avatarUrl: string) {
    try {
      const updatedUser = await this.dbAdapter.addUserAvatar(this.userInfo.id, avatarUrl)
      if (updatedUser) {
        Object.assign(this.userInfo, updatedUser)
        return true
      }
      return false
    } catch (error) {
      console.error('添加头像失败:', error)
      throw error
    }
  }

  // 加载角色数据
  async loadCharacters() {
    try {
      // 从数据库获取当前用户的角色数据
      const charactersData = await this.dbAdapter.getCharactersByUserId(this.userInfo.id)
      
      // 清空现有数据并添加新数据
      this.characters.value.splice(0, this.characters.value.length, ...charactersData)
    } catch (error) {
      console.error('加载角色失败:', error)
    }
  }

  // 添加角色
  async addCharacter(character: Omit<Character, 'id' | 'createdAt' | 'userId'>) {
    try {
      // 使用数据库适配器创建角色
      const newCharacter = await this.dbAdapter.createCharacter({
        ...character,
        userId: this.userInfo.id
      })
      
      // 添加到本地状态
      this.characters.value.push(newCharacter)
      
      return newCharacter
    } catch (error) {
      console.error('添加角色失败:', error)
      throw error
    }
  }

  // 删除角色
  removeCharacter(characterId: string) {
    const index = this.characters.value.findIndex(char => char.id === characterId)
    if (index > -1) {
      this.characters.value.splice(index, 1)
      this.saveCharacters()
    }
  }

  // 更新角色
  updateCharacter(characterId: string, updates: Partial<Character>) {
    const character = this.characters.value.find(char => char.id === characterId)
    if (character) {
      Object.assign(character, updates)
      this.saveCharacters()
    }
  }

  // 保存角色列表
  saveCharacters() {
    try {
      // 获取所有用户的角色
      const allCharacters = uni.getStorageSync('characters') || []
      
      // 过滤掉当前用户的角色
      const otherUsersCharacters = allCharacters.filter(
        (char: Character) => char.userId !== this.userInfo.id
      )
      
      // 合并当前用户的角色
      const updatedCharacters = [...otherUsersCharacters, ...this.characters.value]
      
      uni.setStorageSync('characters', updatedCharacters)
    } catch (error) {
      console.error('保存角色列表失败:', error)
    }
  }

  // 获取角色详情
  getCharacter(characterId: string) {
    return this.characters.value.find(char => char.id === characterId)
  }

  // 清空数据
  clear() {
    this.characters.value = []
    Object.assign(this.userInfo, {
      id: '1',
      username: 'ys',
      points: 0,
      userId: 'iVjnyp/JW8Whiv4ye+cLewTQDKXF0',
      createdAt: new Date().toISOString()
    })
    
    try {
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('characters')
    } catch (error) {
      console.error('清空数据失败:', error)
    }
  }

  // 清除用户数据（用于退出登录）
  clearUserData() {
    this.characters.value = []
    Object.assign(this.userInfo, {
      id: '',
      username: '',
      email: '',
      password: '',
      points: 0,
      userId: '',
      avatars: [],
      currentAvatar: '/static/default-avatar.svg',
      createdAt: ''
    })
    
    try {
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('characters')
    } catch (error) {
      console.error('清除用户数据失败:', error)
    }
  }
}

// 创建全局store实例
export const store = new Store()

// 导出类型
export type { Character, UserInfo }