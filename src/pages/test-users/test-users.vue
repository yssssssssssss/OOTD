<template>
  <view class="test-users-page">
    <view class="header">
      <text class="title">创建测试用户</text>
    </view>
    
    <view class="content">
      <view class="info-section">
        <text class="info-text">点击下方按钮在Supabase数据库中创建测试用户</text>
        <text class="info-text">测试账号：</text>
        <text class="account-info">用户名: testuser1, 密码: 123456</text>
        <text class="account-info">用户名: testuser2, 密码: password123</text>
      </view>
      
      <button 
        class="create-btn" 
        :disabled="loading"
        @click="createTestUsers"
      >
        {{ loading ? '创建中...' : '创建测试用户' }}
      </button>
      
      <view v-if="result" class="result-section">
        <text :class="['result-text', result.success ? 'success' : 'error']">
          {{ result.message }}
        </text>
        <view v-if="result.createdUsers && result.createdUsers.length > 0" class="created-users">
          <text class="created-title">已创建的用户：</text>
          <text v-for="user in result.createdUsers" :key="user" class="created-user">
            {{ user }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserService } from '@/utils/userService'

const loading = ref(false)
const result = ref<{
  success: boolean
  message: string
  createdUsers?: string[]
} | null>(null)

const createTestUsers = async () => {
  loading.value = true
  result.value = null
  
  try {
    const response = await UserService.createTestUsers()
    result.value = response
  } catch (error) {
    result.value = {
      success: false,
      message: `创建失败: ${error}`
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-users-page {
  padding: 40rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.content {
  max-width: 600rpx;
  margin: 0 auto;
}

.info-section {
  background: white;
  padding: 40rpx;
  border-radius: 20rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.info-text {
  display: block;
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.account-info {
  display: block;
  font-size: 28rpx;
  color: #007AFF;
  margin-bottom: 10rpx;
  padding-left: 20rpx;
}

.create-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  color: white;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.create-btn:disabled {
  background: #ccc;
}

.result-section {
  background: white;
  padding: 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.result-text {
  display: block;
  font-size: 32rpx;
  margin-bottom: 20rpx;
  line-height: 1.5;
}

.result-text.success {
  color: #34C759;
}

.result-text.error {
  color: #FF3B30;
}

.created-users {
  margin-top: 20rpx;
}

.created-title {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.created-user {
  display: block;
  font-size: 26rpx;
  color: #007AFF;
  margin-bottom: 5rpx;
  padding-left: 20rpx;
}
</style>