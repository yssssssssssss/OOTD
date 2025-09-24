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
          @load="onImageLoad"
          @error="onImageError"
          :show-menu-by-longpress="true"
        />
        <view v-else-if="isGenerating" class="placeholder-image">
          <view class="loading-animation">
            <text class="loading-icon">⏳</text>
            <text class="loading-dots">{{ loadingDots }}</text>
          </view>
          <text class="placeholder-text">{{ generationStatus }}</text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: generationProgress + '%' }"></view>
          </view>
        </view>
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
    
    <!-- 底部导航栏 -->
    <BottomNavigation />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { generateOutfit, type OutfitGenerationRequest } from '@/utils/cozeApi'
import { ImageGenerationService } from '@/utils/imageGenerationService'
import { store } from '@/store/index'

// 响应式数据
const showCharacterModal = ref(false)
const isGenerating = ref(false)
const generatedImageUrl = ref('')
const generationStatus = ref('正在生成搭配图片...')
const generationProgress = ref(0)
const loadingDots = ref('')

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

// 图片事件处理
const onImageLoad = () => {
  console.log('图片加载成功:', generatedImageUrl.value)
}

const onImageError = (e: any) => {
  console.error('图片加载失败:', e)
  uni.showToast({
    title: '图片加载失败',
    icon: 'error'
  })
}

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
  
  // 重置所有状态
  generatedImageUrl.value = ''
  isGenerating.value = true
  generationProgress.value = 0
  generationStatus.value = '正在准备生成参数...'
  loadingDots.value = ''
  
  // 启动加载动画
  startLoadingAnimation()
  
  try {
    // 构建动态Prompt
    const dynamicPrompt = buildDynamicPrompt()
    generationProgress.value = 20
    generationStatus.value = '正在连接AI服务...'
    
    // 使用新的图片生成服务
    const result = await ImageGenerationService.generateOutfit({
      prompt: dynamicPrompt,
      characterName: selectedCharacter.value.name,
      additionalParams: {
        style: '现代简约',
        season: getSeason(new Date()),
        occasion: '日常工作和休闲'
      }
    })
    
    generationProgress.value = 90
    generationStatus.value = '正在处理生成结果...'
    
    if (result.success && result.imageUrl) {
      generationProgress.value = 100
      generationStatus.value = '生成完成！'
      
      // 延迟一下显示完成状态
      setTimeout(() => {
        generatedImageUrl.value = result.imageUrl
        uni.showToast({
          title: result.message || '搭配生成成功！',
          icon: 'success'
        })
        
        // 显示保存到历史记录的提示
        if (result.historyItem) {
          setTimeout(() => {
            uni.showToast({
              title: '已保存到历史记录',
              icon: 'none'
            })
          }, 2000)
        }
      }, 500)
    } else {
      throw new Error(result.error || '生成失败')
    }
  } catch (error) {
    console.error('生成搭配失败:', error)
    generationStatus.value = '生成失败，请重试'
    uni.showToast({
      title: error instanceof Error ? error.message : '生成失败，请重试',
      icon: 'error'
    })
  } finally {
    stopLoadingAnimation()
    setTimeout(() => {
      isGenerating.value = false
      generationProgress.value = 0
      generationStatus.value = '正在生成搭配图片...'
    }, 1000)
  }
}

// 加载动画相关
let loadingInterval: any = null

const startLoadingAnimation = () => {
  let dotCount = 0
  loadingInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4
    loadingDots.value = '.'.repeat(dotCount)
    
    // 模拟进度增长
    if (generationProgress.value < 80) {
      generationProgress.value += Math.random() * 5
    }
  }, 500)
}

const stopLoadingAnimation = () => {
  if (loadingInterval) {
    clearInterval(loadingInterval)
    loadingInterval = null
  }
  loadingDots.value = ''
}

// 构建动态Prompt的函数
const buildDynamicPrompt = () => {
  // 获取从browse页面保存的Prompt
  const savedPrompt = store.getSelectedPrompt()
  
  if (savedPrompt) {
    // 如果有保存的Prompt，使用它并结合角色信息
    return `${savedPrompt}。请为角色"${selectedCharacter.value.name}"生成对应的搭配效果图。`
  }
  
  // 如果没有保存的Prompt，使用默认的通用Prompt
  const currentDate = new Date()
  const season = getSeason(currentDate)
  const timeOfDay = getTimeOfDay(currentDate)
  
  return `请为${selectedCharacter.value.name}生成一套时尚搭配。要求：
1. 风格：现代简约，适合${selectedCharacter.value.name}的个人特色
2. 季节：${season}，适合当前季节穿着
3. 时间：${timeOfDay}，适合当前时段的活动
4. 色彩：协调统一，突出个人魅力
5. 场合：适合日常工作和休闲活动
6. 请生成高质量的搭配效果图，包含上衣、下装、鞋子等完整搭配`
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
  height: 100vh;
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
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
  height: calc(100vh - 80rpx);
  overflow: hidden;
}

/* 图片展示区域 */
.image-display {
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 800rpx;
  width: calc(100% - 40rpx);
  margin: 20rpx;
  border-radius: 12rpx;
  position: relative;
}

.generated-image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 12rpx;
  object-fit: contain;
  display: block;
}

.placeholder-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999999;
  width: 100%;
  height: 100%;
  min-height: 400rpx;
}

.placeholder-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.placeholder-text {
  font-size: 28rpx;
}

/* 加载动画样式 */
.loading-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.loading-icon {
  font-size: 48rpx;
  animation: rotate 2s linear infinite;
}

.loading-dots {
  font-size: 32rpx;
  color: #666666;
  margin-left: 10rpx;
  min-width: 60rpx;
}

/* 进度条样式 */
.progress-bar {
  width: 80%;
  height: 8rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
  margin-top: 30rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a8e6cf 0%, #88d8a3 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

/* 旋转动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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