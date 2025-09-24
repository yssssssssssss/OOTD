<template>
  <view class="create-character-container">
    <!-- 状态栏占位 -->
    <view class="status-bar"></view>
    
    <!-- 头部区域 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="header-title">创建角色</text>
      <view class="header-actions">
        <text class="action-icon">⋯</text>
        <view class="record-icon">
          <text class="record-text">⊙</text>
        </view>
      </view>
    </view>
    
    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 图片上传区域 -->
      <view class="upload-section">
        <text class="section-label">上传图片</text>
        <text class="upload-hint">最大5MB，支持png、jpg格式</text>
        
        <view class="upload-area" @tap="chooseImage">
          <image 
            v-if="formData.imageUrl" 
            :src="formData.imageUrl" 
            class="uploaded-image"
            mode="aspectFill"
          />
          <view v-else class="upload-placeholder">
            <text class="upload-icon">+</text>
          </view>
        </view>
      </view>
      
      <!-- 角色名输入 -->
      <view class="input-section">
        <text class="section-label">角色名</text>
        <input 
          v-model="formData.characterName"
          class="text-input"
          placeholder="请输入"
          maxlength="20"
        />
      </view>
      
      <!-- 发型选择 -->
      <view class="input-section">
        <text class="section-label">当前发型</text>
        <picker 
          :value="hairStyleIndex" 
          :range="hairStyles"
          @change="onHairStyleChange"
        >
          <view class="picker-input">
            <text class="picker-text">{{ formData.hairStyle || '请选择' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
      
      <!-- 发色输入 -->
      <view class="input-section">
        <text class="section-label">发色</text>
        <input 
          v-model="formData.hairColor"
          class="text-input"
          placeholder="请输入"
          maxlength="10"
        />
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="confirm-btn" @tap="createCharacter" :disabled="!isFormValid">
        确认创建
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { store } from '@/store/index'

// 表单数据接口
interface FormData {
  imageUrl: string
  characterName: string
  hairStyle: string
  hairColor: string
}

// 响应式数据
const formData = reactive<FormData>({
  imageUrl: '',
  characterName: '',
  hairStyle: '短发', // 设置默认发型
  hairColor: ''
})

// 本地图片路径（用于延迟上传）
const localImagePath = ref('')

// 发型选项
const hairStyles = ref([
  '短发',
  '长发',
  '卷发',
  '直发',
  '波浪发',
  '马尾',
  '双马尾',
  '丸子头',
  '编发',
  '刘海'
])

const hairStyleIndex = ref(0)

// 上传状态
const uploading = ref(false)

// 表单验证
const isFormValid = computed(() => {
  const valid = formData.imageUrl && 
         formData.characterName.trim() && 
         formData.hairStyle && 
         formData.hairColor.trim()
  
  // 调试信息
  console.log('表单验证状态:', {
    imageUrl: !!formData.imageUrl,
    characterName: !!formData.characterName.trim(),
    hairStyle: !!formData.hairStyle,
    hairColor: !!formData.hairColor.trim(),
    isValid: valid
  })
  
  return valid
})

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      // 保存本地路径，不立即上传
      localImagePath.value = tempFilePath
      formData.imageUrl = tempFilePath // 临时设置为本地路径用于预览
      
      uni.showToast({
        title: '图片选择成功',
        icon: 'success'
      })
    },
    fail: (error) => {
      console.error('选择图片失败:', error)
      uni.showToast({
        title: '选择图片失败',
        icon: 'error'
      })
    }
  })
}

// 上传图片到图床
const uploadImage = async (filePath: string) => {
  uploading.value = true
  
  try {
    // 调用后端API上传图片
    const response = await uni.uploadFile({
      url: 'http://localhost:3001/api/upload-avatar', // 只上传图片
      filePath: filePath,
      name: 'image'
    })
    
    const result = JSON.parse(response.data)
    if (result.success) {
      formData.imageUrl = result.imageUrl // 获取图片URL
      
      uni.showToast({
        title: '图片上传成功',
        icon: 'success'
      })
    } else {
      throw new Error(result.error || '上传失败')
    }
  } catch (error) {
    console.error('上传图片失败:', error)
    uni.showToast({
      title: '图片上传失败',
      icon: 'error'
    })
  } finally {
    uploading.value = false
  }
}

// 发型选择变化
const onHairStyleChange = (e: any) => {
  hairStyleIndex.value = e.detail.value
  formData.hairStyle = hairStyles.value[e.detail.value]
}

// 创建角色
const createCharacter = async () => {
  console.log('=== 开始创建角色 ===')
  console.log('表单数据:', formData)
  console.log('表单验证状态:', isFormValid.value)
  
  if (!isFormValid.value) {
    console.log('表单验证失败，显示提示')
    uni.showToast({
      title: '请完善角色信息',
      icon: 'error'
    })
    return
  }
  
  try {
    uni.showLoading({
      title: '上传图片中...'
    })
    
    // 先上传图片到图床
    let finalImageUrl = ''
    if (localImagePath.value) {
      console.log('开始上传图片到图床:', localImagePath.value)
      const uploadResponse = await uni.uploadFile({
        url: 'http://localhost:3001/api/upload-avatar',
        filePath: localImagePath.value,
        name: 'image'
      })
      
      const uploadResult = JSON.parse(uploadResponse.data)
      if (uploadResult.success) {
        finalImageUrl = uploadResult.imageUrl
        console.log('图片上传成功:', finalImageUrl)
      } else {
        throw new Error(uploadResult.error || '图片上传失败')
      }
    }
    
    uni.showLoading({
      title: '创建角色中...'
    })
    
    // 获取当前用户ID
    const currentUserId = store.userInfo.userId
    console.log('当前用户ID:', currentUserId)
    
    const requestData = {
      userId: currentUserId,
      characterName: formData.characterName,
      imageUrl: finalImageUrl, // 使用上传后的图片URL
      hairStyle: formData.hairStyle,
      hairColor: formData.hairColor
    }
    console.log('准备发送的数据:', requestData)
    
    // 调用新的后端API创建角色
    console.log('开始调用后端API...')
    const response = await uni.request({
      url: 'http://localhost:3001/api/create-character',
      method: 'POST',
      data: requestData
    })
    
    console.log('后端API响应:', response)
    
    if (response.statusCode === 200 && response.data.success) {
      uni.hideLoading()
      
      uni.showToast({
        title: '创建成功',
        icon: 'success',
        duration: 2000
      })
      
      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 2000)
    } else {
      throw new Error(response.data.error || '创建失败')
    }
    
  } catch (error) {
    uni.hideLoading()
    console.error('创建角色失败:', error)
    uni.showToast({
      title: '创建失败，请重试',
      icon: 'error'
    })
  }
}
</script>

<style scoped>
.create-character-container {
  min-height: 100vh;
  background: #f8f9fa;
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
  border-bottom: 1rpx solid #e9ecef;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 48rpx;
  color: #333333;
  font-weight: bold;
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

.form-container {
  padding: 40rpx;
}

.upload-section {
  margin-bottom: 60rpx;
}

.section-label {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 16rpx;
}

.upload-hint {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 30rpx;
  display: block;
}

.upload-area {
  width: 100%;
  height: 400rpx;
  border-radius: 16rpx;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2rpx dashed #cccccc;
  transition: all 0.3s ease;
}

.upload-area:active {
  background: #e9ecef;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 80rpx;
  color: #cccccc;
}

.input-section {
  margin-bottom: 40rpx;
}

.text-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333333;
  border: 1rpx solid #e9ecef;
}

.text-input:focus {
  border-color: #007aff;
  background: #ffffff;
}

.picker-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1rpx solid #e9ecef;
}

.picker-text {
  font-size: 28rpx;
  color: #333333;
}

.picker-arrow {
  font-size: 32rpx;
  color: #cccccc;
  transform: rotate(90deg);
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40rpx;
  background: #ffffff;
  border-top: 1rpx solid #e9ecef;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.confirm-btn {
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

.confirm-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.confirm-btn:disabled {
  background: #cccccc;
  box-shadow: none;
  transform: none;
}
</style>