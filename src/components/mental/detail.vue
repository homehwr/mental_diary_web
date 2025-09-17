<template>
  <div class="record-detail-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="记录详情"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
      class="app-nav-bar"
    />
    
    <!-- 加载动画 -->
    <div class="loading-overlay" v-if="loading">
      <van-loading size="24px" color="#3498db" vertical>加载中...</van-loading>
    </div>
    
    <!-- 内容区域 -->
    <div v-if="!loading" class="content-container">
      <!-- 记录头部信息 -->
      <div class="record-header">
        <div class="record-date">
          <div class="date-text">{{ formattedDate }}</div>
          <div class="time-text">{{ formattedTime }}</div>
        </div>
        <div class="record-mood">
          <div class="mood-icon" :style="{ backgroundColor: moodColor + '20' }">
            <van-icon :name="moodIcon" :color="moodColor" size="28" />
          </div>
          <div class="mood-text">{{ record.mood }}</div>
        </div>
      </div>
      
      <!-- 记录内容卡片 -->
      <div class="record-card">
        <div class="card-header">
          <h3 class="experiment-title">
            <van-icon name="experiment" color="#3498db" />
            {{ record.experiment || getDefaultTitle(record.mood) }}
          </h3>
        </div>
        
        <div class="record-content">
          <!-- 使用pre-line保留换行符 -->
          <p class="content-text">{{ record.content }}</p>
        </div>
      </div>
      
      <!-- 图片展示区域 -->
      <div class="image-gallery" v-if="hasImages">
        <div class="gallery-header">
          <van-icon name="photo-o" color="#3498db" size="18" />
          <h3>记录图片</h3>
        </div>
        
        <div class="image-grid">
          <div 
            v-for="(img, index) in imageList" 
            :key="index" 
            class="image-item"
            @click="showImagePreview(index)"
          >
            <van-image
              fit="cover"
              :src="img"
              class="gallery-image"
            >
              <template v-slot:loading>
                <van-loading type="spinner" size="20" />
              </template>
            </van-image>
          </div>
        </div>
      </div>
      
      <!-- 情绪指标卡片 -->
      <div class="metrics-card">
        <div class="card-header">
          <h3><van-icon name="chart-trending-o" color="#3498db" /> 情绪指标</h3>
        </div>
        
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-icon stress">
              <van-icon name="fire-o" size="24" />
            </div>
            <div class="metric-info">
              <div class="metric-label">压力指数</div>
              <div class="metric-value">{{ record.stress }}/10</div>
              <van-progress 
                :percentage="record.stress * 10" 
                stroke-width="4" 
                color="#e74c3c"
                track-color="#ebedf0"
              />
            </div>
          </div>
          
          <div class="metric-item">
            <div class="metric-icon positive">
              <van-icon name="like-o" size="24" />
            </div>
            <div class="metric-info">
              <div class="metric-label">积极情绪</div>
              <div class="metric-value">{{ record.positive }}/10</div>
              <van-progress 
                :percentage="record.positive * 10" 
                stroke-width="4" 
                color="#2ecc71"
                track-color="#ebedf0"
              />
            </div>
          </div>
          
          <div class="metric-item">
            <div class="metric-icon energy">
              <van-icon name="bolt" size="24" />
            </div>
            <div class="metric-info">
              <div class="metric-label">精力水平</div>
              <div class="metric-value">{{ record.energy }}/10</div>
              <van-progress 
                :percentage="record.energy * 10" 
                stroke-width="4" 
                color="#f39c12"
                track-color="#ebedf0"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 相关记录卡片 -->
      <div class="related-records-card" v-if="relatedRecords.length > 0">
        <div class="card-header">
          <h3><van-icon name="notes-o" color="#3498db" /> 相关记录</h3>
        </div>
        
        <div class="related-list">
          <div 
            v-for="(related, index) in relatedRecords" 
            :key="index" 
            class="related-item"
            @click="viewRecord(related.id)"
          >
            <div class="related-date">
              <div class="date">{{ formatRelatedDate(related.create_time) }}</div>
              <div class="time">{{ formatRelatedTime(related.create_time) }}</div>
            </div>
            <div class="related-content">
              <div class="title">{{ related.experiment || getDefaultTitle(related.mood) }}</div>
              <div class="preview">{{ related.content.substring(0, 30) + '...' }}</div>
            </div>
            <div class="related-mood">
              <van-icon :name="getMoodIcon(related.mood)" :color="getMoodColor(related.mood)" size="18" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部操作按钮 - 左右排列 -->
    <div class="action-buttons">
      <van-button 
        round 
        type="primary" 
        icon="edit" 
        @click="editRecord"
        class="edit-button"
        :disabled="true"
      >
        编辑记录
      </van-button>
      <van-button 
        round 
        type="default" 
        icon="delete" 
        @click="deleteRecord"
        class="delete-button"
      >
        删除记录
      </van-button>
    </div>
    
    <!-- 图片预览组件 -->
    <van-image-preview
      v-model="showPreview"
      :images="imageList"
      :start-position="previewIndex"
      @change="onPreviewChange"
    >
      <template v-slot:index>第{{ previewIndex + 1 }}张 / 共{{ imageList.length }}张</template>
    </van-image-preview>
  </div>
</template>

<script>
import { NavBar, Icon, Button, Progress, Loading, Dialog, Image, ImagePreview } from 'vant';
import dayjs from 'dayjs';

export default {
  components: {
    [NavBar.name]: NavBar,
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Progress.name]: Progress,
    [Loading.name]: Loading,
    [Dialog.Component.name]: Dialog.Component,
    [Image.name]: Image,
    [ImagePreview.Component.name]: ImagePreview.Component
  },
  data() {
    return {
      record: {
        id: 4,
        content: "今天好累啊！做完光的偏振实验后，我深刻体会到心态对观察结果的影响。\n\n当心情平静时，我能更清晰地看到光的偏振现象；而当我感到疲惫或焦虑时，实验结果就会变得模糊不清。\n\n这让我联想到，在生活中，我们的心态就像是一个滤镜，会影响我们对世界的认知。",
        create_time: "2025-09-03T21:03:42.569+08:00",
        energy: 3,
        experiment: "光的偏振与心态调节",
        images: "",
        mood: "疲惫",
        positive: 3,
        stress: 5,
        uuid: "1"
      },
      relatedRecords: [],
      loading: true,
      showPreview: false, // 控制图片预览显示
      previewIndex: 0 // 当前预览的图片索引
    };
  },
  computed: {
    formattedDate() {
      return dayjs(this.record.create_time).format('YYYY年MM月DD日');
    },
    formattedTime() {
      return dayjs(this.record.create_time).format('HH:mm');
    },
    moodIcon() {
      return this.getMoodIcon(this.record.mood);
    },
    moodColor() {
      return this.getMoodColor(this.record.mood);
    },
    // 检查是否有图片
    hasImages() {
      return this.record.images && this.record.images.trim() !== '';
    },
    // 将逗号分隔的图片字符串转换为数组
    imageList() {
      if (!this.hasImages) return [];
      
      // 分割字符串并过滤空值
      return this.record.images.split(',')
        .map(url => url.trim())
        .filter(url => url !== '');
    }
  },
  watch: {
    // 监听路由变化，当id变化时重新加载数据
    '$route.query.id': {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.loadRecordData();
        }
      }
    }
  },
  methods: {
    // 加载记录数据
    loadRecordData() {
      this.loading = true;
      
      // 实际API请求
      this.$axios.get(`/diary/getById?id=${this.$route.query.id}&recommend=true`)
        .then(response => {
          if (response.data && response.data.length > 0) {
            this.record = response.data[0];
            this.relatedRecords = response.data.length > 1 ? response.data.slice(1) : [];
          }
        })
        .catch(error => {
          console.error('加载记录失败:', error);
          this.$toast('加载记录失败，请稍后重试');
        })
        .finally(() => {
          this.loading = false;
        });
    },
    
    getMoodIcon(mood) {
      const icons = {
        '高兴': 'smile-o',
        '平静': 'smile-comment-o',
        '兴奋': 'good-job-o',
        '疲惫': 'eye-o',
        '低落': 'down'
      };
      return icons[mood] || 'smile-o';
    },
    
    getMoodColor(mood) {
      const colors = {
        '高兴': '#f39c12',
        '平静': '#3498db',
        '兴奋': '#9b59b6',
        '疲惫': '#95a5a6',
        '低落': '#e74c3c'
      };
      return colors[mood] || '#3498db';
    },

    // 获取默认标题
    getDefaultTitle(mood) {
      const defaultTitles = {
        '高兴': '愉快的一天',
        '平静': '平静的时光',
        '兴奋': '兴奋的时刻',
        '疲惫': '疲惫的体验',
        '低落': '低落的情绪'
      };
      return defaultTitles[mood] || '我的心情记录';
    },
    
    formatRelatedDate(dateString) {
      return dayjs(dateString).format('MM/DD');
    },
    
    formatRelatedTime(dateString) {
      return dayjs(dateString).format('HH:mm');
    },
    
    viewRecord(id) {
      this.$router.push(`/detail?id=${id}`);
    },
    
    editRecord() {
      this.$router.push(`/edit?id=${this.record.id}`);
    },
    
    deleteRecord() {
      Dialog.confirm({
        title: '删除记录',
        message: '确定要删除这条记录吗？此操作不可恢复。',
        confirmButtonColor: '#e74c3c'
      }).then(() => {
        this.$axios.delete(`/diary/deleteById?id=${this.record.id}`)
          .then(() => {
            this.$toast.success('记录已删除');
            this.$router.go(-1);
          })
          .catch(error => {
            console.error('删除记录失败:', error);
            this.$toast('删除记录失败，请稍后重试');
          });
      }).catch(() => {
        // 取消删除
      });
    },
    
    // 显示图片预览
    showImagePreview(index) {
      this.previewIndex = index;
      this.showPreview = true;
    },
    
    // 预览图片切换时的回调
    onPreviewChange(index) {
      this.previewIndex = index;
    }
  }
};
</script>

<style scoped>
.record-detail-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: 100vh;
  padding-bottom: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.app-nav-bar {
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
}

.app-nav-bar /deep/ .van-nav-bar__title,
.app-nav-bar /deep/ .van-nav-bar__text,
.app-nav-bar /deep/ .van-icon {
  color: white !important;
}

/* 加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

/* 内容容器 */
.content-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 90px;
}

/* 记录头部信息 */
.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  margin: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.record-date {
  flex: 1;
}

.date-text {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.time-text {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 4px;
}

.record-mood {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mood-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.mood-text {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

/* 卡片通用样式 */
.record-card,
.metrics-card,
.related-records-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.card-header .van-icon {
  margin-right: 8px;
}

/* 记录内容 - 保留换行符 */
.record-content {
  padding: 10px 0;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: #34495e;
  margin: 0;
  white-space: pre-line; /* 保留换行符 */
}

/* 情绪指标 */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.metric-item {
  display: flex;
  align-items: center;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.metric-icon.stress {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.metric-icon.positive {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.metric-icon.energy {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.metric-info {
  flex: 1;
}

.metric-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 6px;
}

/* 相关记录 */
.related-list {
  display: flex;
  flex-direction: column;
}

.related-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-item:last-child {
  border-bottom: none;
}

.related-item:hover {
  background-color: #f8f9fa;
}

.related-date {
  min-width: 60px;
  margin-right: 16px;
}

.related-date .date {
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
}

.related-date .time {
  font-size: 12px;
  color: #7f8c8d;
}

.related-content {
  flex: 1;
}

.related-content .title {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.related-content .preview {
  font-size: 14px;
  color: #7f8c8d;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-mood {
  margin-left: 12px;
}

/* 底部操作按钮 - 左右排列 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.edit-button,
.delete-button {
  flex: 1;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.edit-button {
  background: linear-gradient(135deg, #3498db, #2ecc71);
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.delete-button {
  background: white;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2);
}

.edit-button:active,
.delete-button:active {
  transform: translateY(2px);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .record-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .record-mood {
    flex-direction: row;
    align-items: center;
    margin-top: 16px;
  }
  
  .mood-icon {
    margin-right: 12px;
    margin-bottom: 0;
  }
  
  .action-buttons {
    flex-direction: row;
    gap: 12px;
  }
  
  .edit-button,
  .delete-button {
    height: 46px;
    font-size: 15px;
  }
}

/* 图片展示区域 */
.image-gallery {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.gallery-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.gallery-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-left: 8px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  aspect-ratio: 1/1; /* 保持正方形 */
}

.image-item:hover {
  transform: scale(1.03);
}

.gallery-image {
  width: 100%;
  height: 100%;
  display: block;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .image-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>