<template>
  <view class="register-container">
    <view class="register-header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="register-title">创建账号</text>
      <text class="register-subtitle">请填写以下信息完成注册</text>
    </view>
    
    <view class="register-form">
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
      
      <view class="input-group">
        <view class="input-wrapper">
          <input 
            class="input-field"
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="formData.confirmPassword"
            placeholder="请确认密码"
            placeholder-class="input-placeholder"
          />
          <view class="password-toggle" @tap="toggleConfirmPassword">
            <text class="password-icon">{{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="button-group">
      <button 
        class="confirm-btn" 
        :class="{ 'loading': isRegistering }"
        :disabled="isRegistering"
        @tap="handleRegister"
      >
        {{ isRegistering ? '注册中...' : '确认' }}
      </button>
      <button class="cancel-btn" @tap="handleCancel">取消</button>
    </view>
    
    <view class="register-footer">
      <text class="footer-text">已有账号？返回登录页面</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { UserService } from '@/utils/userService'

// 响应式数据
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isRegistering = ref(false) // 注册状态
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 切换密码显示状态
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 切换确认密码显示状态
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 表单验证
const validateForm = (): boolean => {
  if (!formData.username.trim()) {
    uni.showToast({
      title: '请输入账号',
      icon: 'none'
    })
    return false
  }
  
  if (formData.username.length < 3) {
    uni.showToast({
      title: '账号长度至少3位',
      icon: 'none'
    })
    return false
  }
  
  if (!formData.password.trim()) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return false
  }
  
  if (formData.password.length < 6) {
    uni.showToast({
      title: '密码长度至少6位',
      icon: 'none'
    })
    return false
  }
  
  if (!formData.confirmPassword.trim()) {
    uni.showToast({
      title: '请确认密码',
      icon: 'none'
    })
    return false
  }
  
  if (formData.password !== formData.confirmPassword) {
    uni.showToast({
      title: '两次密码输入不一致',
      icon: 'none'
    })
    return false
  }
  
  return true
}

// 注册处理
const handleRegister = async () => {
  // 表单验证
  if (!validateForm()) {
    return
  }
  
  // 防止重复提交
  if (isRegistering.value) {
    return
  }
  
  isRegistering.value = true
  
  try {
    // 显示加载提示
    uni.showLoading({
      title: '注册中...',
      mask: true
    })
    
    // 调用注册服务
    const result = await UserService.registerUser(
      formData.username.trim(),
      formData.password.trim()
    )
    
    // 隐藏加载提示
    uni.hideLoading()
    
    if (result.success) {
      // 注册成功
      uni.showToast({
        title: result.message,
        icon: 'success',
        duration: 2000
      })
      
      // 清空表单
      formData.username = ''
      formData.password = ''
      formData.confirmPassword = ''
      
      // 延迟返回登录页
      setTimeout(() => {
        uni.navigateBack()
      }, 2000)
      
    } else {
      // 注册失败
      uni.showToast({
        title: result.message,
        icon: 'none',
        duration: 3000
      })
    }
    
  } catch (error) {
    // 隐藏加载提示
    uni.hideLoading()
    
    console.error('注册过程中发生错误:', error)
    uni.showToast({
      title: '注册失败，请稍后重试',
      icon: 'none',
      duration: 3000
    })
  } finally {
    isRegistering.value = false
  }
}

// 取消注册
const handleCancel = () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消注册吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-header {
  position: relative;
  text-align: center;
  margin-bottom: 80rpx;
}

.back-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
}

.back-icon {
  font-size: 36rpx;
  color: #333333;
  font-weight: bold;
}

.register-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.register-subtitle {
  font-size: 28rpx;
  color: #666666;
  display: block;
}

.register-form {
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

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(79, 172, 254, 0.3);
  transition: all 0.3s ease;
}

.confirm-btn:disabled,
.confirm-btn.loading {
  opacity: 0.6;
  background: linear-gradient(135deg, #999 0%, #666 100%);
  cursor: not-allowed;
}

.confirm-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(79, 172, 254, 0.3);
}

.cancel-btn {
  width: 100%;
  height: 88rpx;
  background: transparent;
  color: #666666;
  font-size: 32rpx;
  border: 2rpx solid #cccccc;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.cancel-btn:active {
  background: rgba(204, 204, 204, 0.1);
  border-color: #999999;
}

.register-footer {
  text-align: center;
  margin-top: 40rpx;
}

.footer-text {
  font-size: 24rpx;
  color: #666666;
}
</style>