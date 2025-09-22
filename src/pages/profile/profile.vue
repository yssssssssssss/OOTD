<template>
  <view class="profile-container">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 头部区域 -->
    <view class="header">
      <text class="header-title">我的</text>
      <view class="header-actions">
        <text class="action-icon">⋯</text>
        <view class="record-icon">
          <text class="record-text">⊙</text>
        </view>
      </view>
    </view>
    
    <!-- 用户信息区域 -->
    <view class="user-info">
      <view class="user-profile">
        <image 
          :src="store.userInfo.currentAvatar || '/static/default-avatar.svg'" 
          class="user-avatar"
          mode="aspectFill"
        />
        <view class="user-details">
          <text class="greeting">hi! {{ store.userInfo.username }}</text>
          <view class="user-stats">
            <text class="stats-label">积分:</text>
            <text class="stats-value">{{ store.userInfo.points }}</text>
          </view>
        </view>
      </view>
      <view class="user-id" @tap="copyUserId">
        <text class="id-label">id:</text>
        <text class="id-value">{{ store.userInfo.userId }}</text>
        <text class="copy-btn">复制id</text>
      </view>
    </view>
    
    <!-- 我的头像区域 -->
    <view class="my-avatars">
      <text class="section-title">我的头像</text>
      
      <view class="avatars-grid">
        <view 
          v-for="avatar in store.userInfo.avatars" 
          :key="avatar"
          class="avatar-item"
          :class="{ 'active': avatar === store.userInfo.currentAvatar }"
          @tap="selectAvatar(avatar)"
        >
          <image 
            :src="avatar" 
            class="avatar-image"
            mode="aspectFill"
          />
          <view v-if="avatar === store.userInfo.currentAvatar" class="current-badge">
            <text class="badge-text">当前</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 我的角色区域 -->
    <view class="my-characters">
      <text class="section-title">我的角色</text>
      
      <view class="characters-grid">
        <view 
          v-for="character in (store.characters as Character[])" 
          :key="character.id"
          class="character-item"
          @tap="viewCharacter(character)"
        >
          <image 
            :src="character.imageUrl || '/static/default-avatar.svg'" 
            class="character-image"
            mode="aspectFill"
          />
          <text class="character-name">{{ character.name }}</text>
        </view>
        
        <!-- 添加新角色按钮 -->
        <view class="character-item add-character" @tap="goToCreateCharacter">
          <view class="add-icon">
            <text class="plus-icon">+</text>
          </view>
          <text class="add-text">添加角色</text>
        </view>
      </view>
      
      <!-- 管理角色按钮 -->
      <button class="manage-btn" @tap="goToCreateCharacter">管理角色</button>
    </view>
    
    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item active">
        <text class="nav-icon">👤</text>
        <text class="nav-text">我的</text>
      </view>
      <view class="nav-item">
        <text class="nav-icon">⚙️</text>
        <text class="nav-text">设置</text>
      </view>
      <view class="nav-item">
        <text class="nav-icon">👥</text>
        <text class="nav-text">社区</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { store, type Character } from '@/store/index'

// 页面加载时初始化数据
onMounted(async () => {
  await store.init()
})

// 页面显示时刷新角色列表（从创建角色页面返回时）
onShow(() => {
  store.loadCharacters()
})

// 查看角色详情
const viewCharacter = (character: Character) => {
  uni.navigateTo({
    url: `/pages/character-detail/character-detail?id=${character.id}`
  })
}

// 跳转到创建角色页面
const goToCreateCharacter = () => {
  uni.navigateTo({
    url: '/pages/create-character/create-character'
  })
}

// 复制用户ID
const copyUserId = () => {
  uni.setClipboardData({
    data: store.userInfo.userId,
    success: () => {
      uni.showToast({
        title: 'ID已复制',
        icon: 'success'
      })
    }
  })
}

// 选择头像
const selectAvatar = async (avatarUrl: string) => {
  if (avatarUrl === store.userInfo.currentAvatar) {
    return // 如果是当前头像，不需要切换
  }
  
  try {
    uni.showLoading({
      title: '切换中...'
    })
    
    const success = await store.updateUserAvatar(avatarUrl)
    if (success) {
      uni.showToast({
        title: '头像切换成功',
        icon: 'success'
      })
    } else {
      uni.showToast({
        title: '切换失败',
        icon: 'error'
      })
    }
  } catch (error) {
    console.error('切换头像失败:', error)
    uni.showToast({
      title: '切换失败',
      icon: 'error'
    })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f8f9fa;
  position: relative;
}

.status-bar {
  height: 44rpx;
  background: #ffffff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
  background: #ffffff;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.action-icon {
  font-size: 32rpx;
  color: #666666;
}

.record-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-text {
  font-size: 24rpx;
  color: #666666;
}

.user-info {
  padding: 40rpx;
  background: #ffffff;
  margin-bottom: 20rpx;
  border-radius: 0 0 24rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 30rpx;
  border: 4rpx solid #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.user-details {
  flex: 1;
}

.greeting {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 16rpx;
}

.user-stats {
  display: flex;
  align-items: center;
}

.stats-label {
  font-size: 28rpx;
  color: #666666;
  margin-right: 10rpx;
}

.stats-value {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

.user-id {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.id-label {
  font-size: 24rpx;
  color: #666666;
  margin-right: 10rpx;
}

.id-value {
  font-size: 24rpx;
  color: #999999;
  margin-right: 20rpx;
  word-break: break-all;
  flex: 1;
}

.copy-btn {
  font-size: 24rpx;
  color: #007aff;
  padding: 8rpx 16rpx;
  border: 1rpx solid #007aff;
  border-radius: 8rpx;
}

.my-avatars {
  padding: 40rpx;
  background: #ffffff;
  margin-bottom: 20rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.avatars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.avatar-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  border-radius: 16rpx;
  background: #f8f9fa;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.avatar-item.active {
  border-color: #007aff;
  background: #e3f2fd;
  transform: scale(1.05);
}

.avatar-item:active {
  transform: scale(0.95);
}

.avatar-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  border: 2rpx solid #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.current-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background: #007aff;
  border-radius: 12rpx;
  padding: 4rpx 8rpx;
}

.badge-text {
  font-size: 18rpx;
  color: #ffffff;
  font-weight: bold;
}

.my-characters {
  padding: 40rpx;
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  margin-top: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 30rpx;
}

.characters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  margin-bottom: 40rpx;
}

.character-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.character-item:active {
  transform: scale(0.95);
  background: #e9ecef;
}

.character-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
  background: #e9ecef;
  border: 2rpx solid #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.character-name {
  font-size: 24rpx;
  color: #333333;
  text-align: center;
}

.add-character {
  border: 2rpx dashed #cccccc;
  background: transparent;
}

.add-icon {
  width: 140rpx;
  height: 140rpx;
  border-radius: 20rpx;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  border: 2rpx dashed #cccccc;
}

.plus-icon {
  font-size: 48rpx;
  color: #cccccc;
}

.add-text {
  font-size: 24rpx;
  color: #999999;
}

.manage-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.manage-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1rpx solid #e9ecef;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.nav-item.active .nav-text {
  color: #007aff;
}

.nav-icon {
  font-size: 32rpx;
  color: #666666;
}

.nav-item.active .nav-icon {
  color: #007aff;
}

.nav-text {
  font-size: 20rpx;
  color: #666666;
}
</style>