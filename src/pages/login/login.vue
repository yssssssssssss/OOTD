<template>
  <view class="login-container">
    <view class="login-header">
      <text class="login-title">欢迎登录</text>
      <text class="login-subtitle">请输入您的账号信息</text>
    </view>
    
    <view class="login-form">
      <view class="input-group">
        <view class="input-wrapper">
          <input 
            class="input-field"
            type="text"
            v-model="formData.username"
            placeholder="请输入账号"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>
      
      <view class="input-group">
        <view class="input-wrapper">
          <input 
            class="input-field"
            :type="showPassword ? 'text' : 'password'"
            v-model="formData.password"
            placeholder="请输入密码"
            placeholder-class="input-placeholder"
          />
          <view class="password-toggle" @tap="togglePassword">
            <text class="password-icon">{{ showPassword ? '👁️' : '👁️‍🗨️' }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="button-group">
      <button class="login-btn" @tap="handleLogin">登录</button>
      <button class="register-btn" @tap="goToRegister">注册</button>
    </view>
    
    <view class="login-footer">
      <text class="footer-text">还没有账号？点击注册创建新账号</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 响应式数据
const showPassword = ref(false)
const formData = reactive({
  username: '',
  password: ''
})

// 切换密码显示状态
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 登录处理
const handleLogin = () => {
  if (!formData.username.trim()) {
    uni.showToast({
      title: '请输入账号',
      icon: 'none'
    })
    return
  }
  
  if (!formData.password.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }
  
  // 这里可以添加登录逻辑
  uni.showToast({
    title: '登录成功',
    icon: 'success'
  })
}

// 跳转到注册页面
const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.login-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 20rpx;
}

.login-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.login-form {
  margin-bottom: 60rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-wrapper {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 0 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.input-field {
  width: 100%;
  height: 88rpx;
  font-size: 32rpx;
  color: #333333;
  background: transparent;
  border: none;
  outline: none;
}

.input-placeholder {
  color: #999999;
}

.password-toggle {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  padding: 10rpx;
}

.password-icon {
  font-size: 36rpx;
  color: #666666;
}

.button-group {
  margin-bottom: 40rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.login-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.3);
}

.register-btn {
  width: 100%;
  height: 88rpx;
  background: transparent;
  color: #ffffff;
  font-size: 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.register-btn:active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.8);
}

.login-footer {
  text-align: center;
  margin-top: 40rpx;
}

.footer-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}
</style>

