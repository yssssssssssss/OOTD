<template>
  <view class="outfit-detail">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <text class="nav-icon">‹</text>
      </view>
      <view class="nav-title">搭配详情</view>
      <view class="nav-right">
        <text class="nav-icon">⋯</text>
        <text class="nav-icon record-icon">⊙</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 图片展示区域 -->
      <view class="image-display">
        <image 
          v-if="generatedImageUrl" 
          :src="generatedImageUrl" 
          class="generated-image"
          mode="aspectFit"
        />
        <view v-else class="placeholder-image">
          <text class="placeholder-icon">📷</text>
          <text class="placeholder-text">点击"试同款"生成搭配图片</text>
        </view>
      </view>

      <!-- 底部操作区域 -->
      <view class="bottom-actions">
        <!-- 操作按钮组 -->
        <view class="action-buttons">
          <view class="action-btn" @click="checkTextMatch">
            <text class="action-icon">🔍</text>
            <text class="action-text">请检查文本配置</text>
          </view>
          <view class="action-btn" @click="checkImageMatch">
            <text class="action-icon">💎</text>
            <text class="action-text">请检查文本配置</text>
          </view>
          <view class="action-btn" @click="checkQuery">
            <text class="action-icon">📋</text>
            <text class="action-text">请检查</text>
          </view>
        </view>

        <!-- 角色选择区域 -->
        <view class="character-section">
          <view class="character-info" @click="showCharacterModal = true">
            <image :src="selectedCharacter.avatar" class="character-avatar" />
            <view class="character-details">
              <text class="character-label">请检查文本配置</text>
              <text class="character-name">{{ selectedCharacter.name }}</text>
            </view>
            <text class="switch-text" @click.stop="showCharacterModal = true">切换角色 ›</text>
          </view>
        </view>

        <!-- 试同款按钮 -->
        <view class="try-button" @click="tryOutfit" :class="{ loading: isGenerating }">
          <text class="try-button-text">{{ isGenerating ? '生成中...' : '试同款' }}</text>
        </view>
      </view>
    </view>

    <!-- 角色选择弹窗 -->
    <view v-if="showCharacterModal" class="modal-overlay" @click="showCharacterModal = false">
      <view class="character-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">请点击选择角色</text>
          <text class="modal-close" @click="showCharacterModal = false">✕</text>
        </view>
        
        <view class="character-grid">
          <view 
            v-for="character in characters" 
            :key="character.id"
            class="character-item"
            @click="selectCharacter(character)"
          >
            <image :src="character.avatar" class="character-grid-avatar" />
            <text class="character-grid-name">{{ character.name }}</text>
          </view>
        </view>

        <view class="create-character-btn" @click="goToCreateCharacter">
          <text class="create-icon">+</text>
          <text class="create-text">新建角色</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { generateOutfit, type OutfitGenerationRequest } from '@/utils/cozeApi'

// 响应式数据
const showCharacterModal = ref(false)
const isGenerating = ref(false)
const generatedImageUrl = ref('')

// 选中的角色
const selectedCharacter = ref({
  id: 1,
  name: '当前角色',
  avatar: '/static/default-avatar.svg'
})

// 角色列表
const characters = ref([
  {
    id: 1,
    name: 'Cindy',
    avatar: '/static/default-avatar.svg'
  },
  {
    id: 2,
    name: 'JANY',
    avatar: '/static/default-avatar.svg'
  },
  {
    id: 3,
    name: 'Mary',
    avatar: '/static/default-avatar.svg'
  },
  {
    id: 4,
    name: '人薇',
    avatar: '/static/default-avatar.svg'
  },
  {
    id: 5,
    name: '库',
    avatar: '/static/default-avatar.svg'
  }
])

// 方法定义
const goBack = () => {
  uni.navigateBack()
}

const selectCharacter = (character: any) => {
  selectedCharacter.value = character
  showCharacterModal.value = false
}

const goToCreateCharacter = () => {
  showCharacterModal.value = false
  uni.navigateTo({
    url: '/pages/create-character/create-character'
  })
}

const checkTextMatch = () => {
  uni.showToast({
    title: '检查文本配置功能',
    icon: 'none'
  })
}

const checkImageMatch = () => {
  uni.showToast({
    title: '检查图片配置功能',
    icon: 'none'
  })
}

const checkQuery = () => {
  uni.showToast({
    title: '检查查询功能',
    icon: 'none'
  })
}

const tryOutfit = async () => {
  if (isGenerating.value) return
  
  isGenerating.value = true
  
  try {
    // 构建动态Prompt
    const dynamicPrompt = buildDynamicPrompt()
    
    // 构建发送给Coze API的请求
    const request: OutfitGenerationRequest = {
      prompt: dynamicPrompt,
      characterName: selectedCharacter.value.name,
      style: '现代简约',
      season: getSeason(new Date()),
      occasion: '日常工作和休闲'
    }

    // 调用Coze API
    const response = await generateOutfit(request)
    
    if (response.success && response.imageUrl) {
      generatedImageUrl.value = response.imageUrl
      uni.showToast({
        title: response.message || '搭配生成成功！',
        icon: 'success'
      })
    } else {
      throw new Error(response.error || '生成失败')
    }
  } catch (error) {
    console.error('生成搭配失败:', error)
    uni.showToast({
      title: error instanceof Error ? error.message : '生成失败，请重试',
      icon: 'error'
    })
  } finally {
    isGenerating.value = false
  }
}

// 构建动态Prompt的函数
const buildDynamicPrompt = () => {
  const currentDate = new Date()
  const season = getSeason(currentDate)
  const timeOfDay = getTimeOfDay(currentDate)
  
  return `请为${selectedCharacter.value.name}生成一套时尚搭配。要求：
1. 风格：现代简约，适合${selectedCharacter.value.name}的个人特色
2. 季节：${season}，适合当前季节穿着
3. 时间：${timeOfDay}，适合当前时段的活动
4. 色彩：协调统一，突出个人魅力
5. 场合：适合日常工作和休闲活动
6. 请生成高质量的搭配效果图，包含上衣、下装、鞋子等完整搭配
7. 搭配风格要符合当下流行趋势，同时保持实用性
8. 考虑${selectedCharacter.value.name}的身材特点，选择最适合的版型和款式
9. 提供具体的搭配建议和穿搭技巧
10. 生成的搭配要有创新性，避免过于常见的组合`
}

// 获取当前季节
const getSeason = (date: Date) => {
  const month = date.getMonth() + 1
  if (month >= 3 && month <= 5) return '春季'
  if (month >= 6 && month <= 8) return '夏季'
  if (month >= 9 && month <= 11) return '秋季'
  return '冬季'
}

// 获取当前时段
const getTimeOfDay = (date: Date) => {
  const hour = date.getHours()
  if (hour >= 6 && hour < 12) return '上午'
  if (hour >= 12 && hour < 18) return '下午'
  if (hour >= 18 && hour < 22) return '晚上'
  return '深夜'
}


</script>

<style scoped>
.outfit-detail {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.nav-icon {
  font-size: 36rpx;
  color: #333333;
  padding: 10rpx;
}

.record-icon {
  font-size: 32rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

/* 内容区域 */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 图片展示区域 */
.image-display {
  flex: 1;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600rpx;
  margin: 20rpx;
  border-radius: 12rpx;
}

.generated-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.placeholder-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999999;
}

.placeholder-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.placeholder-text {
  font-size: 28rpx;
}

/* 底部操作区域 */
.bottom-actions {
  background-color: #ffffff;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  flex: 1;
  margin: 0 10rpx;
}

.action-icon {
  font-size: 32rpx;
  margin-bottom: 10rpx;
}

.action-text {
  font-size: 24rpx;
  color: #666666;
  text-align: center;
}

/* 角色选择区域 */
.character-section {
  margin-bottom: 30rpx;
}

.character-info {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.character-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  margin-right: 20rpx;
}

.character-details {
  flex: 1;
}

.character-label {
  font-size: 24rpx;
  color: #999999;
  display: block;
  margin-bottom: 5rpx;
}

.character-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.switch-text {
  font-size: 28rpx;
  color: #666666;
}

/* 试同款按钮 */
.try-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.try-button.loading {
  background: linear-gradient(135deg, #cccccc 0%, #999999 100%);
}

.try-button-text {
  font-size: 32rpx;
  color: #333333;
  font-weight: 600;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.character-modal {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx 30rpx;
  width: 100%;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.modal-close {
  font-size: 32rpx;
  color: #999999;
  padding: 10rpx;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30rpx;
  margin-bottom: 40rpx;
}

.character-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border-radius: 12rpx;
  transition: background-color 0.3s ease;
}

.character-item:active {
  background-color: #f0f0f0;
}

.character-grid-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-bottom: 15rpx;
}

.character-grid-name {
  font-size: 24rpx;
  color: #333333;
  text-align: center;
}

.create-character-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  background-color: #ffffff;
}

.create-icon {
  font-size: 32rpx;
  color: #666666;
  margin-right: 10rpx;
}

.create-text {
  font-size: 28rpx;
  color: #666666;
}
</style>