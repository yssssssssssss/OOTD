<template>
  <view class="history-container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="title">我的历史</text>
    </view>
    
    <!-- 瀑布流容器 -->
    <view class="waterfall-container" v-if="!isEmpty">
      <view class="waterfall-column" v-for="(column, columnIndex) in columns" :key="columnIndex">
        <view 
          class="history-item" 
          v-for="item in column" 
          :key="item.id"
          @tap="viewDetail(item)"
        >
          <image 
            :src="item.imageUrl" 
            class="history-image"
            mode="widthFix"
            @load="onImageLoad"
            @error="onImageError"
          />
          <view class="item-info">
            <text class="item-prompt">{{ item.prompt }}</text>
            <text class="item-date">{{ formatDate(item.createdAt) }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <image src="/static/default-avatar.svg" class="empty-icon" />
      <text class="empty-text">还没有生成过搭配</text>
      <text class="empty-hint">去生成页面创建你的第一个搭配吧！</text>
      <button class="go-generate-btn" @tap="goToGenerate">开始生成</button>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore && !isEmpty">
      <text class="load-text" v-if="!loading">加载更多</text>
      <text class="load-text" v-else>加载中...</text>
    </view>
    
    <!-- 底部导航栏 -->
    <BottomNavigation />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { UserService } from '@/utils/userService'
import { HistoryService, type HistoryItem } from '@/utils/historyService'
import BottomNavigation from '@/components/BottomNavigation.vue'

// 响应式数据
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20

// 瀑布流数据
const leftColumn = ref<HistoryItem[]>([])
const rightColumn = ref<HistoryItem[]>([])

// 用户信息
const currentUser = ref<any>(null)

// 瀑布流列数
const columnCount = 2

// 计算属性
const isEmpty = computed(() => leftColumn.value.length === 0 && rightColumn.value.length === 0)

// 计算瀑布流列
const columns = computed(() => {
  return [leftColumn.value, rightColumn.value]
})

// 页面加载时获取历史数据
onMounted(async () => {
  // 获取当前用户
  const user = UserService.getCurrentUser()
  if (!user) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    uni.navigateTo({
      url: '/pages/login/login'
    })
    return
  }
  
  currentUser.value = user
  await loadHistory()
})

// 加载历史记录
const loadHistory = async () => {
  if (loading.value || !hasMore.value || !currentUser.value) return
  
  loading.value = true
  
  try {
    // 获取分页历史记录
    const result = HistoryService.getHistoryPage(
      currentUser.value.id, 
      currentPage.value, 
      pageSize
    )
    
    if (result.items.length === 0) {
      hasMore.value = false
      return
    }
    
    // 分配到左右列（基于图片高度的智能分配）
    result.items.forEach((item) => {
      // 简单的交替分配，实际项目中可以根据图片高度智能分配
      if (leftColumn.value.length <= rightColumn.value.length) {
        leftColumn.value.push(item)
      } else {
        rightColumn.value.push(item)
      }
    })
    
    currentPage.value++
    hasMore.value = result.hasMore
    
  } catch (error) {
    console.error('加载历史记录失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}



// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}

// 查看详情
const viewDetail = (item: any) => {
  // 跳转到搭配详情页面，传递图片信息
  uni.navigateTo({
    url: `/pages/outfit-detail/outfit-detail?imageUrl=${encodeURIComponent(item.imageUrl)}&prompt=${encodeURIComponent(item.prompt)}`
  })
}

// 去生成页面
const goToGenerate = () => {
  uni.navigateTo({
    url: '/pages/outfit-detail/outfit-detail'
  })
}

// 图片加载完成
const onImageLoad = () => {
  // 图片加载完成后可以做一些处理
}

// 图片加载失败
const onImageError = () => {
  console.log('图片加载失败')
}

// 下拉刷新
const onPullDownRefresh = async () => {
  currentPage.value = 1
  hasMore.value = true
  leftColumn.value = []
  rightColumn.value = []
  
  await loadHistory()
  uni.stopPullDownRefresh()
}

// 上拉加载更多
const onReachBottom = () => {
  if (hasMore.value && !loading.value) {
    loadHistory()
  }
}
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background: #f8f8f8;
  padding-bottom: 120rpx; /* 为底部导航留出空间 */
}

.header {
  background: #fff;
  padding: 40rpx 30rpx 30rpx;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.waterfall-container {
  padding: 20rpx 15rpx;
  display: flex;
  gap: 15rpx;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.history-item {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.history-item:active {
  transform: scale(0.98);
}

.history-image {
  width: 100%;
  display: block;
}

.item-info {
  padding: 20rpx;
}

.item-prompt {
  display: block;
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-date {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  text-align: center;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  opacity: 0.3;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.empty-hint {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.go-generate-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.go-generate-btn:active {
  transform: scale(0.95);
}

.load-more {
  padding: 40rpx;
  text-align: center;
}

.load-text {
  font-size: 28rpx;
  color: #999;
}
</style>