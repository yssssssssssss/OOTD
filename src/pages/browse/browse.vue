<template>
  <view class="browse-page">
    <!-- 第一楼层：轮播图 -->
    <view class="banner-section">
      <swiper 
        class="banner-swiper" 
        :indicator-dots="true" 
        :autoplay="true" 
        :interval="3000"
        :duration="500"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#ffffff"
      >
        <swiper-item v-for="(banner, index) in bannerList" :key="index">
          <view class="banner-item">
            <image :src="banner.image" class="banner-image" mode="aspectFill" />
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 第二楼层：一衣多穿 -->
    <view class="outfit-section">
      <view class="section-title">一衣多穿</view>
      <scroll-view class="outfit-scroll" scroll-x="true" show-scrollbar="false">
        <view class="outfit-list">
          <view 
            class="outfit-item" 
            v-for="(outfit, index) in outfitList" 
            :key="index"
            @click="handleOutfitClick(outfit)"
          >
            <image :src="outfit.image" class="outfit-image" mode="aspectFill" />
            <view class="outfit-title">{{ outfit.title }}</view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 第三楼层：场景搭配 -->
    <view class="scene-section">
      <view class="section-title">场景搭配</view>
      
      <!-- Tab导航 -->
      <view class="tab-nav">
        <view 
          class="tab-item"
          :class="{ active: currentTab === tab.key }"
          v-for="tab in tabList" 
          :key="tab.key"
          @click="switchTab(tab.key)"
        >
          {{ tab.name }}
        </view>
      </view>

      <!-- 图片Feed流 -->
      <view class="scene-content">
        <view class="scene-grid">
          <view 
            class="scene-item" 
            v-for="(item, index) in currentSceneList" 
            :key="index"
            @click="handleSceneClick(item)"
          >
            <image :src="item.image" class="scene-image" mode="aspectFill" />
            <view class="scene-info">
              <view class="scene-title">{{ item.title }}</view>
              <view class="scene-desc">{{ item.desc }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 轮播图数据
const bannerList = ref([
  {
    id: 1,
    image: 'https://picsum.photos/750/300?random=1',
    title: '春季新品'
  },
  {
    id: 2,
    image: 'https://picsum.photos/750/300?random=2',
    title: '夏日清新'
  },
  {
    id: 3,
    image: 'https://picsum.photos/750/300?random=3',
    title: '秋冬时尚'
  }
])

// 一衣多穿数据
const outfitList = ref([
  {
    id: 1,
    image: 'https://picsum.photos/200/250?random=11',
    title: '白色衬衫',
    link: '/pages/detail/detail?id=1'
  },
  {
    id: 2,
    image: 'https://picsum.photos/200/250?random=12',
    title: '黑色西装',
    link: '/pages/detail/detail?id=2'
  },
  {
    id: 3,
    image: 'https://picsum.photos/200/250?random=13',
    title: '牛仔外套',
    link: '/pages/detail/detail?id=3'
  },
  {
    id: 4,
    image: 'https://picsum.photos/200/250?random=14',
    title: '针织毛衣',
    link: '/pages/detail/detail?id=4'
  },
  {
    id: 5,
    image: 'https://picsum.photos/200/250?random=15',
    title: '连衣裙',
    link: '/pages/detail/detail?id=5'
  },
  {
    id: 6,
    image: 'https://picsum.photos/200/250?random=16',
    title: '休闲T恤',
    link: '/pages/detail/detail?id=6'
  }
])

// Tab数据
const tabList = ref([
  { key: 'recommend', name: '最新推荐' },
  { key: 'business', name: '正式商务' },
  { key: 'social', name: '社交宴会' },
  { key: 'daily', name: '日常通勤' }
])

const currentTab = ref('recommend')

// 场景搭配数据
const sceneData = ref({
  recommend: [
    {
      id: 1,
      image: 'https://picsum.photos/180/220?random=21',
      title: '春日清新搭配',
      desc: '简约舒适'
    },
    {
      id: 2,
      image: 'https://picsum.photos/180/220?random=22',
      title: '都市时尚风',
      desc: '个性十足'
    },
    {
      id: 3,
      image: 'https://picsum.photos/180/220?random=23',
      title: '甜美可爱风',
      desc: '青春活力'
    },
    {
      id: 4,
      image: 'https://picsum.photos/180/220?random=24',
      title: '优雅知性风',
      desc: '气质出众'
    }
  ],
  business: [
    {
      id: 5,
      image: 'https://picsum.photos/180/220?random=25',
      title: '商务正装',
      desc: '专业干练'
    },
    {
      id: 6,
      image: 'https://picsum.photos/180/220?random=26',
      title: '职场精英',
      desc: '成熟稳重'
    },
    {
      id: 7,
      image: 'https://picsum.photos/180/220?random=27',
      title: '会议装扮',
      desc: '正式得体'
    },
    {
      id: 8,
      image: 'https://picsum.photos/180/220?random=28',
      title: '商务休闲',
      desc: '轻松自在'
    }
  ],
  social: [
    {
      id: 9,
      image: 'https://picsum.photos/180/220?random=29',
      title: '晚宴礼服',
      desc: '华丽优雅'
    },
    {
      id: 10,
      image: 'https://picsum.photos/180/220?random=30',
      title: '派对装扮',
      desc: '时尚前卫'
    },
    {
      id: 11,
      image: 'https://picsum.photos/180/220?random=31',
      title: '聚会造型',
      desc: '亮眼夺目'
    },
    {
      id: 12,
      image: 'https://picsum.photos/180/220?random=32',
      title: '社交场合',
      desc: '得体大方'
    }
  ],
  daily: [
    {
      id: 13,
      image: 'https://picsum.photos/180/220?random=33',
      title: '通勤装扮',
      desc: '简约实用'
    },
    {
      id: 14,
      image: 'https://picsum.photos/180/220?random=34',
      title: '日常休闲',
      desc: '舒适自然'
    },
    {
      id: 15,
      image: 'https://picsum.photos/180/220?random=35',
      title: '周末出行',
      desc: '轻松惬意'
    },
    {
      id: 16,
      image: 'https://picsum.photos/180/220?random=36',
      title: '居家服饰',
      desc: '温馨舒适'
    }
  ]
})

// 当前场景列表
const currentSceneList = computed(() => {
  return sceneData.value[currentTab.value] || []
})

// 切换Tab
const switchTab = (tabKey: string) => {
  currentTab.value = tabKey
}

// 处理一衣多穿点击
const handleOutfitClick = (outfit: any) => {
  console.log('点击一衣多穿:', outfit)
  // 这里可以跳转到详情页
  // uni.navigateTo({
  //   url: outfit.link
  // })
}

// 处理场景搭配点击
const handleSceneClick = (scene: any) => {
  console.log('点击场景搭配:', scene)
  // 这里可以跳转到详情页
}

onMounted(() => {
  console.log('浏览页面加载完成')
})
</script>

<style scoped>
.browse-page {
  background-color: #f8f8f8;
  min-height: 100vh;
  
  /* 图片尺寸变量 - 方便统一修改 */
  --outfit-item-width: 200rpx;    /* 一衣多穿图片宽度 */
  --outfit-item-height: 200rpx;   /* 一衣多穿图片高度 */
  --scene-item-height: 400rpx;    /* 场景搭配图片高度 */
  --banner-height: 300rpx;        /* 轮播图高度 */
}

/* 轮播图样式 */
.banner-section {
  margin-bottom: 20rpx;
  padding: 0 30rpx;
}

.banner-swiper {
  height: var(--banner-height);
  border-radius: 12rpx;
  overflow: hidden;
}

.banner-item {
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* 通用区块样式 */
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  padding: 30rpx 30rpx 20rpx;
}

/* 一衣多穿样式 */
.outfit-section {
  background-color: #fff;
  margin-bottom: 20rpx;
}

.outfit-scroll {
  white-space: nowrap;
  padding: 0 30rpx 30rpx;
}

.outfit-list {
  display: flex;
  gap: 20rpx;
}

.outfit-item {
  flex-shrink: 0;
  width: var(--outfit-item-width);
  text-align: center;
}

.outfit-image {
  width: var(--outfit-item-width);
  height: var(--outfit-item-height);
  border-radius: 12rpx;
  margin-bottom: 10rpx;
}

.outfit-title {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

/* 场景搭配样式 */
.scene-section {
  background-color: #fff;
}

.tab-nav {
  display: flex;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #333;
    font-weight: bold;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background-color: #333;
      border-radius: 2rpx;
    }
  }
}

.scene-content {
  padding: 30rpx;
}

.scene-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.scene-item {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.scene-image {
  width: 100%;
  height: var(--scene-item-height);
}

.scene-info {
  padding: 20rpx;
}

.scene-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.scene-desc {
  font-size: 22rpx;
  color: #999;
}
</style>