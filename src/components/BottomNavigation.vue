<template>
  <view class="bottom-navigation">
    <view 
      class="nav-item" 
      :class="{ active: currentPath === '/pages/browse/browse' }"
      @tap="navigateTo('/pages/browse/browse')"
    >
      <view class="nav-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" :fill="currentPath === '/pages/browse/browse' ? '#667eea' : '#999'" />
        </svg>
      </view>
      <text class="nav-text" :class="{ active: currentPath === '/pages/browse/browse' }">灵感</text>
    </view>
    
    <view 
      class="nav-item" 
      :class="{ active: currentPath === '/pages/outfit-detail/outfit-detail' }"
      @tap="navigateTo('/pages/outfit-detail/outfit-detail')"
    >
      <view class="nav-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" :fill="currentPath === '/pages/outfit-detail/outfit-detail' ? '#667eea' : '#999'" />
          <circle cx="12" cy="12" r="3" :fill="currentPath === '/pages/outfit-detail/outfit-detail' ? '#667eea' : '#999'" />
        </svg>
      </view>
      <text class="nav-text" :class="{ active: currentPath === '/pages/outfit-detail/outfit-detail' }">生成</text>
    </view>
    
    <view 
      class="nav-item" 
      :class="{ active: currentPath === '/pages/history/history' }"
      @tap="navigateTo('/pages/history/history')"
    >
      <view class="nav-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 3C16.31 3 19 5.69 19 9V10H20C20.55 10 21 10.45 21 11V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V11C3 10.45 3.45 10 4 10H5V9C5 5.69 7.69 3 11 3H13ZM13 5H11C8.79 5 7 6.79 7 9V10H17V9C17 6.79 15.21 5 13 5Z" :fill="currentPath === '/pages/history/history' ? '#667eea' : '#999'" />
        </svg>
      </view>
      <text class="nav-text" :class="{ active: currentPath === '/pages/history/history' }">历史</text>
    </view>
    
    <view 
      class="nav-item" 
      :class="{ active: currentPath === '/pages/profile/profile' }"
      @tap="navigateTo('/pages/profile/profile')"
    >
      <view class="nav-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" :fill="currentPath === '/pages/profile/profile' ? '#667eea' : '#999'" />
        </svg>
      </view>
      <text class="nav-text" :class="{ active: currentPath === '/pages/profile/profile' }">我的</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 当前页面路径
const currentPath = ref('')

// 组件挂载时获取当前页面路径
onMounted(() => {
  getCurrentPath()
})

// 获取当前页面路径
const getCurrentPath = () => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    currentPath.value = '/' + currentPage.route
  }
}

// 导航到指定页面
const navigateTo = (path: string) => {
  // 如果已经在当前页面，不进行跳转
  if (currentPath.value === path) {
    return
  }
  
  // 使用 switchTab 进行页面切换（如果是 tabBar 页面）
  // 这里使用 navigateTo，因为我们没有配置 tabBar
  uni.navigateTo({
    url: path,
    success: () => {
      currentPath.value = path
    },
    fail: (err) => {
      // 如果 navigateTo 失败，尝试使用 redirectTo
      uni.redirectTo({
        url: path,
        success: () => {
          currentPath.value = path
        }
      })
    }
  })
}

// 暴露方法给父组件
defineExpose({
  getCurrentPath,
  navigateTo
})
</script>

<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 10rpx 0;
  transition: all 0.2s ease;
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  transition: all 0.2s ease;
}

.nav-text {
  font-size: 20rpx;
  color: #999;
  transition: color 0.2s ease;
}

.nav-text.active {
  color: #667eea;
  font-weight: 500;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
}

/* 适配不同设备的安全区域 */
@supports (bottom: env(safe-area-inset-bottom)) {
  .bottom-navigation {
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  }
}
</style>