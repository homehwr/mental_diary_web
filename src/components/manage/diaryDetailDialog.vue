<template>
  <el-dialog
    :title="`日记详情 - ${diary.username || '用户'}`"
    :visible.sync="visible"
    width="60%"
    class="diary-detail-dialog"
    @close="handleClose"
  >
    <div class="diary-detail-content" v-loading="loading">
      <!-- 基本信息区域 -->
      <el-card class="info-card" shadow="never">
        <div class="basic-info">
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">姓名：</span>
              <span class="info-value">{{ diary.username || '暂无' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">关联实验：</span>
              <span class="info-value">{{ diary.experiment || '暂无' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">班级：</span>
              <span class="info-value">{{ diary.real_class || '暂无' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">学号：</span>
              <span class="info-value">{{ diary.account || '暂无' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">提交时间：</span>
              <span class="info-value">{{ formatDate(diary.create_time) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">心情状态：</span>
              <span class="mood-tag detail-mood" :class="'mood-' + diary.mood">
                {{ diary.mood }}
              </span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 情绪指标区域 -->
      <el-card class="metrics-card" shadow="never">
        <div class="card-header">
          <i class="el-icon-data-analysis"></i>
          <span>情绪指标</span>
        </div>
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-label">精力水平</div>
            <div class="metric-rate">
              <el-rate
                :value="energyRate"
                disabled
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                :max="5"
              ></el-rate>
              <span class="metric-value">{{ diary.energy || 0 }}/10</span>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-label">积极情绪</div>
            <div class="metric-rate">
              <el-rate
                :value="positiveRate"
                disabled
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                :max="5"
              ></el-rate>
              <span class="metric-value">{{ diary.positive || 0 }}/10</span>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-label">压力水平</div>
            <div class="metric-rate">
              <el-rate
                :value="stressRate"
                disabled
                :colors="['#2ECC71', '#F39C12', '#E74C3C']"
                :max="5"
              ></el-rate>
              <span class="metric-value">{{ diary.stress || 0 }}/10</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 日记内容区域 -->
      <el-card class="content-card" shadow="never">
        <div class="card-header">
          <i class="el-icon-document"></i>
          <span>日记内容</span>
          <el-tag v-if="diary.secret === 1" type="warning" size="small" class="secret-tag">
            <i class="el-icon-lock"></i>私密
          </el-tag>
        </div>
        <div class="content-area">
          <template v-if="diary.secret === 1">
            <div class="secret-message">
              <i class="el-icon-lock secret-icon"></i>
              <p>用户设置了内容仅自己可见</p>
            </div>
          </template>
          <template v-else>
            <div class="diary-text" v-if="diary.content">
              {{ diary.content }}
            </div>
            <div class="no-content" v-else>
              <i class="el-icon-document-remove"></i>
              <p>暂无日记内容</p>
            </div>
            
            <!-- 图片展示 -->
            <div class="images-section" v-if="diary.images && diary.images.trim()">
              <div class="images-title">相关图片：</div>
              <div class="images-grid">
                <div 
                  v-for="(image, index) in getImageList(diary.images)" 
                  :key="index" 
                  class="image-item"
                  @click="viewImage(image)"
                >
                  <el-image
                    :src="image"
                    :preview-src-list="getImageList(diary.images)"
                    fit="cover"
                    class="diary-image"
                  >
                    <div slot="error" class="image-error">
                      <i class="el-icon-picture-outline"></i>
                      <span>加载失败</span>
                    </div>
                    <div slot="placeholder" class="image-loading">
                      <i class="el-icon-loading"></i>
                      <span>加载中...</span>
                    </div>
                  </el-image>
                </div>
              </div>
            </div>
          </template>
        </div>
      </el-card>
    </div>
    
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'DiaryDetailDialog',
  props: {
    // 控制弹窗显示
    visible: {
      type: Boolean,
      default: false
    },
    // 日记数据
    diary: {
      type: Object,
      default: () => ({})
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 计算精力水平评分（0-10转换为0-5）
    energyRate() {
      return this.diary.energy ? this.diary.energy / 2 : 0;
    },
    
    // 计算积极情绪评分
    positiveRate() {
      return this.diary.positive ? this.diary.positive / 2 : 0;
    },
    
    // 计算压力水平评分
    stressRate() {
      return this.diary.stress ? this.diary.stress / 2 : 0;
    }
  },
  methods: {
    // 获取心情名称
    getMoodName(moodId) {
      const moodNames = {
        1: '高兴',
        2: '平静',
        3: '兴奋',
        4: '疲惫',
        5: '低落'
      };
      return moodNames[moodId] || '未知';
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '暂无';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // 处理图片字符串，转换为数组
    getImageList(images) {
      if (!images) return [];
      return images.split(',').filter(img => img.trim());
    },
    
    // 查看大图
    viewImage(image) {
      // 这里使用element-ui的image预览功能，不需要额外处理
    },
    
    // 关闭弹窗
    handleClose() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
/* 样式保持不变 */
.diary-detail-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

.info-card, .metrics-card, .content-card {
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
}

.basic-info {
  padding: 10px 0;
}

.info-row {
  display: flex;
  margin-bottom: 15px;
}

.info-item {
  flex: 1;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
}

.info-value {
  color: #303133;
}

.detail-mood {
  font-size: 12px;
  padding: 4px 8px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.card-header i {
  margin-right: 8px;
  color: #409EFF;
}

.secret-tag {
  margin-left: 10px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-label {
  font-weight: 600;
  margin-bottom: 10px;
  color: #606266;
}

.metric-rate {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-value {
  font-size: 14px;
  color: #909399;
  font-weight: 600;
}

.content-area {
  min-height: 100px;
}

.diary-text {
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.secret-message {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.secret-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #E6A23C;
}

.no-content {
  text-align: center;
  padding: 30px 20px;
  color: #909399;
}

.no-content i {
  font-size: 36px;
  margin-bottom: 10px;
}

.images-section {
  margin-top: 20px;
}

.images-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #606266;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.image-item {
  cursor: pointer;
  transition: transform 0.3s;
}

.image-item:hover {
  transform: scale(1.05);
}

.diary-image {
  width: 100%;
  height: 120px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.image-error, .image-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

/* 心情标签样式 */
.mood-tag {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

.mood-高兴 { /* 高兴 */
  background: linear-gradient(135deg, #FFE57F, #FFD54F);
  color: #E65100;
  box-shadow: 0 2px 4px rgba(255, 214, 0, 0.3);
}

.mood-平静 { /* 平静 */
  background: linear-gradient(135deg, #81D4FA, #4FC3F7);
  color: #01579B;
  box-shadow: 0 2px 4px rgba(129, 212, 250, 0.3);
}

.mood-兴奋 { /* 兴奋 */
  background: linear-gradient(135deg, #FFAB91, #FF8A65);
  color: #BF360C;
  box-shadow: 0 2px 4px rgba(255, 138, 101, 0.3);
}

.mood-疲惫 { /* 疲惫 */
  background: linear-gradient(135deg, #E0E0E0, #BDBDBD);
  color: #424242;
  box-shadow: 0 2px 4px rgba(189, 189, 189, 0.3);
}

.mood-低落 { /* 低落 */
  background: linear-gradient(135deg, #90CAF9, #64B5F6);
  color: #0D47A1;
  box-shadow: 0 2px 4px rgba(100, 181, 246, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>