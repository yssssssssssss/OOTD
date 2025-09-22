import type { Character, UserInfo } from '@/store/index'

// 所有可用的头像URL
export const availableAvatars = [
  'https://tc-new.z.wiki/autoupload/P9fMWrEzi18lXM6qMBFMfSfNcKcqEnRmcljopnyJoMs/20250922/G1fX/300X300/face4.png/webp',
  'https://tc-new.z.wiki/autoupload/P9fMWrEzi18lXM6qMBFMfSfNcKcqEnRmcljopnyJoMs/20250922/nXJa/300X300/face3.png/webp',
  'https://tc-new.z.wiki/autoupload/P9fMWrEzi18lXM6qMBFMfSfNcKcqEnRmcljopnyJoMs/20250922/g6Wb/300X300/face2.png/webp',
  'https://tc-new.z.wiki/autoupload/P9fMWrEzi18lXM6qMBFMfSfNcKcqEnRmcljopnyJoMs/20250922/UT0r/300X300/face1.png/webp'
]

// 模拟图片URL生成器 - 从可用头像中随机选择
export const generateMockImageUrl = (characterName: string): string => {
  const randomIndex = Math.floor(Math.random() * availableAvatars.length)
  return availableAvatars[randomIndex]
}

// 模拟用户数据
export const mockUsers: UserInfo[] = [
  {
    id: '1',
    username: 'ys',
    email: 'ys@example.com',
    password: '123456',
    points: 150,
    userId: 'iVjnyp/JW8Whiv4ye+cLewTQDKXF0',
    avatars: [...availableAvatars], // 用户拥有所有头像
    currentAvatar: availableAvatars[0], // 默认使用第一个头像
    createdAt: '2024-01-15T08:30:00Z'
  },
  {
    id: '2',
    username: 'alice',
    email: 'alice@example.com',
    password: 'alice123',
    points: 280,
    userId: 'aLice123/ABC456def+GHI789jkl',
    avatars: availableAvatars.slice(0, 2), // 用户只拥有前两个头像
    currentAvatar: availableAvatars[1], // 使用第二个头像
    createdAt: '2024-01-10T10:15:00Z'
  }
]

// 模拟角色数据
export const mockCharacters: Character[] = [
  {
    id: '1',
    name: '小樱',
    imageUrl: generateMockImageUrl('小樱'),
    hairStyle: '双马尾',
    hairColor: '粉色',
    createdAt: '2024-01-16T09:00:00Z',
    userId: '1'
  },
  {
    id: '2',
    name: '雪菲',
    imageUrl: generateMockImageUrl('雪菲'),
    hairStyle: '长发',
    hairColor: '银白色',
    createdAt: '2024-01-17T14:30:00Z',
    userId: '1'
  },
  {
    id: '3',
    name: '艾米',
    imageUrl: generateMockImageUrl('艾米'),
    hairStyle: '短发',
    hairColor: '棕色',
    createdAt: '2024-01-18T11:45:00Z',
    userId: '2'
  }
]

// 模拟数据库操作类
export class MockDatabase {
  private static instance: MockDatabase
  private users: UserInfo[] = []
  private characters: Character[] = []

  constructor() {
    this.initializeData()
  }

  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase()
    }
    return MockDatabase.instance
  }

  // 初始化数据
  private initializeData() {
    // 从本地存储加载数据，如果没有则使用模拟数据
    const storedUsers = uni.getStorageSync('mock_users')
    const storedCharacters = uni.getStorageSync('mock_characters')

    this.users = storedUsers && storedUsers.length > 0 ? storedUsers : [...mockUsers]
    this.characters = storedCharacters && storedCharacters.length > 0 ? storedCharacters : [...mockCharacters]

    // 保存到本地存储
    this.saveToStorage()
  }

  // 保存到本地存储
  private saveToStorage() {
    uni.setStorageSync('mock_users', this.users)
    uni.setStorageSync('mock_characters', this.characters)
  }

  // 用户相关操作
  async getUserById(userId: string): Promise<UserInfo | null> {
    // 模拟网络延迟
    await this.delay(100)
    return this.users.find(user => user.id === userId) || null
  }

  async updateUser(userId: string, updates: Partial<UserInfo>): Promise<UserInfo | null> {
    await this.delay(150)
    const userIndex = this.users.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates }
      this.saveToStorage()
      return this.users[userIndex]
    }
    return null
  }

  // 更新用户当前头像
  async updateUserAvatar(userId: string, avatarUrl: string): Promise<UserInfo | null> {
    await this.delay(100)
    const userIndex = this.users.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      // 检查用户是否拥有这个头像
      if (this.users[userIndex].avatars.includes(avatarUrl)) {
        this.users[userIndex].currentAvatar = avatarUrl
        this.saveToStorage()
        return this.users[userIndex]
      } else {
        throw new Error('用户不拥有此头像')
      }
    }
    return null
  }

  // 为用户添加新头像
  async addUserAvatar(userId: string, avatarUrl: string): Promise<UserInfo | null> {
    await this.delay(150)
    const userIndex = this.users.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      if (!this.users[userIndex].avatars.includes(avatarUrl)) {
        this.users[userIndex].avatars.push(avatarUrl)
        this.saveToStorage()
        return this.users[userIndex]
      }
    }
    return null
  }

  // 获取所有可用头像
  async getAvailableAvatars(): Promise<string[]> {
    await this.delay(50)
    return [...availableAvatars]
  }

  // 角色相关操作
  async getCharactersByUserId(userId: string): Promise<Character[]> {
    await this.delay(200)
    return this.characters.filter(character => character.userId === userId)
  }

  async createCharacter(characterData: Omit<Character, 'id' | 'createdAt'>): Promise<Character> {
    await this.delay(300)
    
    const newCharacter: Character = {
      ...characterData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      // 如果没有提供图片URL，生成一个模拟的
      imageUrl: characterData.imageUrl || generateMockImageUrl(characterData.name)
    }

    this.characters.push(newCharacter)
    this.saveToStorage()
    return newCharacter
  }

  async updateCharacter(characterId: string, updates: Partial<Character>): Promise<Character | null> {
    await this.delay(200)
    const characterIndex = this.characters.findIndex(char => char.id === characterId)
    if (characterIndex !== -1) {
      this.characters[characterIndex] = { ...this.characters[characterIndex], ...updates }
      this.saveToStorage()
      return this.characters[characterIndex]
    }
    return null
  }

  async deleteCharacter(characterId: string): Promise<boolean> {
    await this.delay(150)
    const characterIndex = this.characters.findIndex(char => char.id === characterId)
    if (characterIndex !== -1) {
      this.characters.splice(characterIndex, 1)
      this.saveToStorage()
      return true
    }
    return false
  }

  async getCharacterById(characterId: string): Promise<Character | null> {
    await this.delay(100)
    return this.characters.find(char => char.id === characterId) || null
  }

  // 模拟图片上传
  async uploadImage(file: File | string): Promise<string> {
    await this.delay(1000) // 模拟上传时间
    
    // 在实际应用中，这里会上传到图传服务
    // 现在返回一个模拟的URL
    const timestamp = Date.now()
    return `https://mock-image-service.com/uploads/${timestamp}.jpg`
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    this.users = []
    this.characters = []
    uni.removeStorageSync('mock_users')
    uni.removeStorageSync('mock_characters')
  }

  // 重置为初始数据
  async resetToInitialData(): Promise<void> {
    this.users = [...mockUsers]
    this.characters = [...mockCharacters]
    this.saveToStorage()
  }

  // 模拟网络延迟
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 导出单例实例
export const mockDB = MockDatabase.getInstance()

// Supabase集成准备接口
export interface SupabaseConfig {
  url: string
  anonKey: string
  tableName: {
    users: string
    characters: string
  }
}

// 为将来的Supabase集成准备的接口
export interface DatabaseAdapter {
  getUserById(userId: string): Promise<UserInfo | null>
  updateUser(userId: string, updates: Partial<UserInfo>): Promise<UserInfo | null>
  updateUserAvatar(userId: string, avatarUrl: string): Promise<UserInfo | null>
  addUserAvatar(userId: string, avatarUrl: string): Promise<UserInfo | null>
  getAvailableAvatars(): Promise<string[]>
  getCharactersByUserId(userId: string): Promise<Character[]>
  createCharacter(characterData: Omit<Character, 'id' | 'createdAt'>): Promise<Character>
  updateCharacter(characterId: string, updates: Partial<Character>): Promise<Character | null>
  deleteCharacter(characterId: string): Promise<boolean>
  getCharacterById(characterId: string): Promise<Character | null>
  uploadImage(file: File | string): Promise<string>
}

// 模拟数据库适配器实现
export class MockDatabaseAdapter implements DatabaseAdapter {
  private db = mockDB

  async getUserById(userId: string): Promise<UserInfo | null> {
    return this.db.getUserById(userId)
  }

  async updateUser(userId: string, updates: Partial<UserInfo>): Promise<UserInfo | null> {
    return this.db.updateUser(userId, updates)
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<UserInfo | null> {
    return this.db.updateUserAvatar(userId, avatarUrl)
  }

  async addUserAvatar(userId: string, avatarUrl: string): Promise<UserInfo | null> {
    return this.db.addUserAvatar(userId, avatarUrl)
  }

  async getAvailableAvatars(): Promise<string[]> {
    return this.db.getAvailableAvatars()
  }

  async getCharactersByUserId(userId: string): Promise<Character[]> {
    return this.db.getCharactersByUserId(userId)
  }

  async createCharacter(characterData: Omit<Character, 'id' | 'createdAt'>): Promise<Character> {
    return this.db.createCharacter(characterData)
  }

  async updateCharacter(characterId: string, updates: Partial<Character>): Promise<Character | null> {
    return this.db.updateCharacter(characterId, updates)
  }

  async deleteCharacter(characterId: string): Promise<boolean> {
    return this.db.deleteCharacter(characterId)
  }

  async getCharacterById(characterId: string): Promise<Character | null> {
    return this.db.getCharacterById(characterId)
  }

  async uploadImage(file: File | string): Promise<string> {
    return this.db.uploadImage(file)
  }
}