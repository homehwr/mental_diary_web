<template>
  <div class="record-page">
    <!-- 固定头部 -->
    <div class="fixed-header">
      <!-- 顶部导航 -->
      <van-nav-bar
        title="心灵日记"
        left-text="返回"
        left-arrow
        @click-left="$router.go(-1)"
        class="transparent-nav"
      />
      
      <!-- 日期和心情卡片 -->
      <div class="header-card">
        <div class="date-section">
          <van-icon name="calendar-o" size="20px" color="#3498db" />
          <span class="record-date">{{ currentDate }}</span>
        </div>
        
        <div class="mood-display">
          <div class="mood-icon-large" :class="{ 'not-selected': !selectedMood }">
            <van-icon v-if="selectedMood" :name="selectedMoodData.icon" size="32px" :color="selectedMoodData.color" />
            <van-icon v-else name="question-o" size="32px" color="#95a5a6" />
          </div>
          <span class="mood-text">{{ selectedMood ? selectedMoodData.label : '请选择心情' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 记录内容区 -->
    <div class="record-container">
      <!-- 心情选择器 -->
      <div class="mood-selector-card">
        <h3 class="card-title">
          <van-icon name="smile-comment-o" color="#3498db" />
          选择心情
        </h3>
        
        <div class="mood-selector">
          <div 
            v-for="(mood, index) in moods" 
            :key="index"
            class="mood-option"
            :class="{ 'selected': selectedMood === mood.value }"
            @click="selectMood(mood.value)"
          >
            <van-icon :name="mood.icon" size="24px" :color="selectedMood === mood.value ? mood.color : '#95a5a6'" />
            <span>{{ mood.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 情绪指标卡片 -->
      <div class="metrics-card">
        <h3 class="card-title">
          <van-icon name="chart-trending-o" color="#3498db" />
          情绪指标
        </h3>
        
        <div class="metric-item">
          <div class="metric-header">
            <div class="metric-info">
              <van-icon name="warning-o" color="#e74c3c" size="18px" />
              <span>压力指数</span>
            </div>
            <span class="metric-value">{{ stressLevel || '未设置' }}</span>
          </div>
          <van-slider 
            v-model="stressLevel" 
            :min="1" 
            :max="10" 
            bar-height="8px" 
            active-color="#e74c3c"
          >
            <template #button>
              <div class="custom-button stress">
                {{ stressLevel || '?' }}
              </div>
            </template>
          </van-slider>
        </div>
        
        <div class="metric-item">
          <div class="metric-header">
            <div class="metric-info">
              <van-icon name="like-o" color="#2ecc71" size="18px" />
              <span>积极情绪</span>
            </div>
            <span class="metric-value">{{ positiveLevel || '未设置' }}</span>
          </div>
          <van-slider 
            v-model="positiveLevel" 
            :min="1" 
            :max="10" 
            bar-height="8px" 
            active-color="#2ecc71"
          >
            <template #button>
              <div class="custom-button positive">
                {{ positiveLevel || '?' }}
              </div>
            </template>
          </van-slider>
        </div>
        
        <div class="metric-item">
          <div class="metric-header">
            <div class="metric-info">
              <van-icon name="flashlight-o" color="#f39c12" size="18px" />
              <span>精力水平</span>
            </div>
            <span class="metric-value">{{ energyLevel || '未设置' }}</span>
          </div>
          <van-slider 
            v-model="energyLevel" 
            :min="1" 
            :max="10" 
            bar-height="8px" 
            active-color="#f39c12"
          >
            <template #button>
              <div class="custom-button energy">
                {{ energyLevel || '?' }}
              </div>
            </template>
          </van-slider>
        </div>
      </div>
      
      <!-- 关联实验 -->
      <div class="experiment-card">
        <h3 class="card-title">
          <van-icon name="experiment" color="#3498db" />
          关联实验
          <span class="optional">(非必填)</span>
        </h3>
        
        <div class="experiment-options">
          <div 
            v-for="(exp, index) in experiments" 
            :key="index"
            class="experiment-option"
            :class="{ 'selected': selectedExperiment === exp.value }"
            @click="selectedExperiment = selectedExperiment === exp.value ? '' : exp.value"
          >
            <div class="experiment-icon">
              <van-icon :name="exp.icon" size="24px" :color="selectedExperiment === exp.value ? exp.color : '#95a5a6'" />
            </div>
            <div class="experiment-info">
              <h4>{{ exp.name }}</h4>
              <p>{{ exp.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 日记内容 -->
      <div class="diary-card">
        <h3 class="card-title">
          <van-icon name="edit" color="#3498db" />
          今日感悟
        </h3>
        
        <van-field
          v-model="diaryContent"
          type="textarea"
          placeholder="请写下您的心情、感悟或思考..."
          rows="6"
          autosize
          :border="false"
          class="diary-textarea"
        />
        
        <!-- 图片上传 -->
        <div class="image-upload">
          <h4 class="upload-title">
            <van-icon name="photo-o" color="#3498db" />
            添加图片
          </h4>
          <van-uploader 
            v-model="imageList" 
            multiple 
            :max-count="9"
            :deletable="true"
            :after-read="afterRead"
            :before-delete="beforeDelete"
            class="custom-uploader"
          >
            <template #default>
              <div class="upload-btn">
                <van-icon name="plus" size="24px" color="#3498db" />
              </div>
            </template>
          </van-uploader>
        </div>

        <van-checkbox v-model="secret" style="margin-top: 20px;">此记录仅自己可见</van-checkbox>
      </div>
      
      <!-- 保存按钮 -->
      <div class="save-button-container">
        <van-button 
          round 
          block 
          type="primary" 
          size="large" 
          @click="validateAndSave"
          class="save-button"
          :disabled="isSaving || isUploading"
        >
          <van-icon name="success" size="20px" />
          {{ getSaveButtonText }}
        </van-button>
      </div>
    </div>
    
    <!-- 底部安全区域 -->
    <div class="safe-area-bottom"></div>
  </div>
</template>

<script>
import { NavBar, Icon, Field, Slider, Uploader, Button, Toast, Checkbox } from 'vant';
import dayjs from 'dayjs';

export default {
  components: {
    [NavBar.name]: NavBar,
    [Icon.name]: Icon,
    [Field.name]: Field,
    [Slider.name]: Slider,
    [Uploader.name]: Uploader,
    [Button.name]: Button,
    [Checkbox.name]: Checkbox
  },
  data() {
    return {
      currentDate: dayjs().format('YYYY年MM月DD日'),
      moods: [
        { value: '1', icon: 'smile-o', label: '高兴', color: '#f39c12' },
        { value: '2', icon: 'smile-comment-o', label: '平静', color: '#3498db' },
        { value: '3', icon: 'good-job-o', label: '兴奋', color: '#9b59b6' },
        { value: '4', icon: 'eye-o', label: '疲惫', color: '#95a5a6' },
        { value: '5', icon: 'down', label: '低落', color: '#e74c3c' }
      ],
      selectedMood: '',
      stressLevel: null,
      positiveLevel: null,
      energyLevel: null,
      secret: 0,
      experiments: [
        {
          value: '共振与情绪共鸣',
          name: '共振与情绪共鸣',
          description: '理解情绪传染机制',
          icon: 'balance-o',
          color: '#3498db'
        },
        {
          value: '熵增与压力管理',
          name: '熵增与压力管理',
          description: '压力积累与释放原理',
          icon: 'cluster-o',
          color: '#e74c3c'
        },
        {
          value: '光的偏振与心态调节',
          name: '光的偏振与心态调节',
          description: '认知滤镜的影响',
          icon: 'aim',
          color: '#2ecc71'
        },
        {
          value: '磁场力与人际联结',
          name: '磁场力与人际联结',
          description: '人际吸引与冲突',
          icon: 'gem-o',
          color: '#9b59b6'
        }
      ],
      selectedExperiment: '',
      diaryContent: '',
      imageList: [],
      uploadedImageUrls: [], // 存储已上传成功的图片URL
      isSaving: false,
      isUploading: false, // 上传状态
      uploadCount: 0, // 上传计数
      validationError: false
    };
  },
  computed: {
    selectedMoodData() {
      return this.moods.find(mood => mood.value === this.selectedMood) || {};
    },
    getSaveButtonText() {
      if (this.isUploading) {
        return `上传中 (${this.uploadCount}/${this.imageList.length})`;
      }
      return this.isSaving ? '保存中...' : '保存日记';
    }
  },
  methods: {
    selectMood(value) {
      this.selectedMood = this.selectedMood === value ? '' : value;
    },
    
    validateAndSave() {
      // 重置验证状态
      this.validationError = false;
      
      // 验证必填项
      if (!this.selectedMood) {
        Toast('请选择心情状态');
        this.validationError = true;
        return;
      }
      
      if (!this.diaryContent.trim()) {
        Toast('请填写日记内容');
        this.validationError = true;
        return;
      }
      
      // 如果有图片但未上传，先上传图片
      if (this.imageList.length > 0 && this.uploadedImageUrls.length < this.imageList.length) {
        this.uploadImages();
      } else {
        // 否则直接保存
        this.saveRecord();
      }
    },
    
    // 上传所有图片
    uploadImages() {
      this.isUploading = true;
      this.uploadCount = 0;
      
      // 重置已上传URL列表
      this.uploadedImageUrls = [];
      
      // 遍历所有图片进行上传
      this.imageList.forEach(item => {
        this.uploadImage(item);
      });
    },
    
    // 上传单个图片
    uploadImage(fileItem) {
      if (fileItem.url){
        this.uploadedImageUrls.push(fileItem.url);
        this.uploadCount++;
        return;
      }
      // 标记为上传中
      fileItem.status = 'uploading';
      fileItem.message = '上传中...';
      
      const formData = new FormData();
      formData.append('file', fileItem.file);
      
      this.$axios.post('http://parliy.com:89/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        // 上传成功
        fileItem.status = 'done';
        fileItem.message = '上传成功';

        fileItem.url = response.data.url;
        
        // 保存图片URL
        this.uploadedImageUrls.push(response.data.url);
        this.uploadCount++;
        
        // 检查是否所有图片都已上传完成
        if (this.uploadCount === this.imageList.length) {
          this.isUploading = false;
          this.saveRecord();
        }
      })
      .catch(error => {
        // 上传失败
        fileItem.status = 'failed';
        fileItem.message = '上传失败';
        this.uploadCount++;
        
        console.error('图片上传失败:', error);
        Toast.fail('部分图片上传失败，请重试');
        
        // 检查是否所有图片都已处理完成
        if (this.uploadCount === this.imageList.length) {
          this.isUploading = false;
          
          // 如果有成功上传的图片，仍然允许保存
          if (this.uploadedImageUrls.length > 0) {
            Toast('部分图片上传失败，但仍可保存日记');
            this.saveRecord();
          } else {
            Toast.fail('所有图片上传失败，请重试');
          }
        }
      });
    },
    
    // 图片删除前确认
    beforeDelete(fileItem) {
      // 如果图片已上传成功，从URL列表中移除
      if (fileItem.url) {
        const index = this.uploadedImageUrls.indexOf(fileItem.url);
        if (index !== -1) {
          this.uploadedImageUrls.splice(index, 1);
        }
      }
      return true;
    },
    
    // 保存日记记录
    saveRecord() {
      // 重置保存状态
      this.isSaving = true;
      
      try {
        let secret1;
        if (this.secret){
          secret1 = 1
        } else {
          secret1 = 0
        }
        
        // 准备数据
        const recordData = {
          uuid: this.$store.state.User.uid,
          mood: parseInt(this.selectedMood),
          stress: parseInt(this.stressLevel),
          positive: parseInt(this.positiveLevel),
          energy: parseInt(this.energyLevel),
          experiment: this.selectedExperiment,
          content: this.diaryContent,
          images: this.uploadedImageUrls.join(','), // 用逗号分隔多个URL
          secret: secret1
        };
        
        console.log("保存日记:", recordData);
        
        // 验证必填字段
        const requiredFields = ['uuid', 'mood', 'stress', 'positive', 'energy', 'content'];
        const missingFields = requiredFields.filter(field => {
          const value = recordData[field];
          return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
        });
        
        if (missingFields.length > 0) {
          Toast.fail(`请填写以下必填字段: ${missingFields.join(', ')}`);
          this.isSaving = false;
          return;
        }
        
        // 验证数值范围
        const rangeChecks = [
          {field: 'mood', min: 1, max: 5, message: '心情指数必须在1-5之间'},
          {field: 'stress', min: 1, max: 10, message: '压力指数必须在1-10之间'},
          {field: 'positive', min: 1, max: 10, message: '积极情绪指数必须在1-10之间'},
          {field: 'energy', min: 1, max: 10, message: '精力水平指数必须在1-10之间'},
        ];
        
        const rangeErrors = [];
        for (const check of rangeChecks) {
          const value = recordData[check.field];
          if (value < check.min || value > check.max) {
            rangeErrors.push(check.message);
          }
        }
        
        if (rangeErrors.length > 0) {
          Toast.fail(rangeErrors.join('；'));
          this.isSaving = false;
          return;
        }
        
        // 发送请求
        this.$axios({
          method: "post",
          url: "/diary/add",
          data: recordData,
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((res) => {
          if (res.status === 201) {
            Toast.success('日记保存成功');
            
            // 重置表单
            this.selectedMood = '';
            this.stressLevel = 5;
            this.positiveLevel = 5;
            this.energyLevel = 5;
            this.selectedExperiment = '';
            this.diaryContent = '';
            this.imageList = [];
            this.uploadedImageUrls = [];
            
            // 延迟跳转
            setTimeout(() => {
              this.$router.push('/');
              this.isSaving = false;
            }, 500);
          } else {
            this.isSaving = false;
            Toast.fail(`保存失败: ${res.data.detail || '未知错误'}`);
          }
        }).catch((error) => {
          this.isSaving = false;
          this.handleApiError(error);
        });
      } catch (error) {
        this.isSaving = false;
        console.error('保存日记时发生异常:', error);
        Toast.fail('保存过程中发生错误，请重试');
      }
    },

    // 处理API错误
    handleApiError(error) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            Toast.fail(`请求错误: ${data.detail || '无效请求'}`);
            break;
          case 401:
            Toast.fail('登录已过期，请重新登录');
            this.$router.push('/login');
            break;
          case 403:
            Toast.fail('没有权限执行此操作');
            break;
          case 404:
            Toast.fail('请求的资源不存在');
            break;
          case 422:
            this.handleValidationErrors(data);
            break;
          case 500:
            Toast.fail('服务器内部错误');
            break;
          default:
            Toast.fail(`服务器错误: ${status}`);
        }
      } else if (error.request) {
        Toast.fail('无法连接到服务器，请检查网络');
      } else {
        Toast.fail(`请求错误: ${error.message}`);
      }
    },

    // 处理验证错误
    handleValidationErrors(data) {
      let errorMessage = '数据验证失败: ';
      
      if (data.errors && Array.isArray(data.errors)) {
        // 处理字段级错误
        const fieldErrors = {};
        
        data.errors.forEach(err => {
          const field = err.loc && err.loc.length > 0 ? err.loc[0] : 'unknown';
          fieldErrors[field] = fieldErrors[field] || [];
          fieldErrors[field].push(err.msg);
        });
        
        // 构建友好的错误消息
        const errorParts = [];
        for (const [field, messages] of Object.entries(fieldErrors)) {
          let fieldName = field;
          
          // 将字段名称转换为中文
          const fieldNameMap = {
            'uuid': '用户ID',
            'mood': '心情指数',
            'stress': '压力指数',
            'positive': '积极情绪',
            'energy': '精力水平',
            'content': '日记内容',
            'experiment': '关联实验',
            'images': '图片'
          };
          
          if (fieldNameMap[field]) {
            fieldName = fieldNameMap[field];
          }
          
          errorParts.push(`${fieldName}: ${messages.join(', ')}`);
        }
        
        errorMessage += errorParts.join('; ');
      } else if (data.detail) {
        errorMessage += data.detail;
      } else {
        errorMessage += '未知验证错误';
      }
      
      Toast.fail(errorMessage);
    },
    
    // 图片上传处理
    afterRead(file) {
      // 统一处理为数组
      const files = Array.isArray(file) ? file : [file];
      
      // 过滤掉已经存在的文件（防止重复添加）
      const newFiles = files.filter(fileItem => {
        return !this.imageList.some(item => 
          item.file && item.file.name === fileItem.file.name && 
          item.file.size === fileItem.file.size
        );
      });
      
      // 添加到图片列表
      newFiles.forEach(fileItem => {
        this.imageList.push({
          ...fileItem,
          status: 'pending', // 初始状态
          message: '等待上传'
        });
      });
    },
  }
};
</script>

<style scoped>
.record-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding-top: 140px; /* 为固定头部留出空间 */
  padding-bottom: 80px;
}

/* 固定头部 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 透明导航栏 */
.transparent-nav {
  background: transparent !important;
}

.transparent-nav /deep/ .van-nav-bar__text,
.transparent-nav /deep/ .van-icon,
.transparent-nav /deep/ .van-nav-bar__title {
  color: #2c3e50 !important;
}

/* 头部卡片 */
.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.date-section {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
}

.record-date {
  margin-left: 8px;
}

.mood-display {
  display: flex;
  align-items: center;
}

.mood-icon-large {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: #f8f9fa;
  border: 2px solid #ebedf0;
}

.mood-icon-large.not-selected {
  border: 2px dashed #95a5a6;
}

.mood-text {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

/* 记录容器 */
.record-container {
  padding: 16px;
}

/* 心情选择卡片 */
.mood-selector-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  display: flex;
  align-items: center;
  margin: 0 0 20px;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 500;
}

.card-title .van-icon {
  margin-right: 8px;
}

/* 心情选择器 */
.mood-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.mood-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #ebedf0;
}

.mood-option.selected {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%);
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.15);
  border-color: #3498db;
}

.mood-option span {
  font-size: 14px;
  margin-top: 8px;
  color: #7f8c8d;
}

.mood-option.selected span {
  color: #3498db;
  font-weight: 500;
}

/* 卡片通用样式 */
.metrics-card,
.experiment-card,
.diary-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 情绪指标 */
.metric-item {
  margin-bottom: 24px;
}

.metric-item:last-child {
  margin-bottom: 0;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-info {
  display: flex;
  align-items: center;
}

.metric-info span {
  margin: 0 8px;
  font-size: 15px;
  color: #2c3e50;
}

.metric-value {
  font-weight: bold;
  font-size: 16px;
  color: #3498db;
}

.custom-button {
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  font-weight: bold;
}

.stress {
  color: #e74c3c;
  border: 2px solid #e74c3c;
}

.positive {
  color: #2ecc71;
  border: 2px solid #2ecc71;
}

.energy {
  color: #f39c12;
  border: 2px solid #f39c12;
}

/* 关联实验 */
.experiment-options {
  display: flex;
  flex-direction: column;
}

.experiment-option {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 12px;
  border-radius: 12px;
  border: 1px solid #ebedf0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.experiment-option:last-child {
  margin-bottom: 0;
}

.experiment-option.selected {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.05);
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.1);
}

.experiment-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  transition: all 0.3s ease;
}

.experiment-option.selected .experiment-icon {
  background: rgba(52, 152, 219, 0.1);
  transform: scale(1.1);
}

.experiment-info h4 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
}

.experiment-info p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #7f8c8d;
}

/* 日记内容 */
.diary-textarea {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  min-height: 180px;
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 16px;
  line-height: 1.6;
  border: 1px solid #ebedf0;
}

/* 图片上传 */
.image-upload {
  margin-top: 20px;
}

.upload-title {
  display: flex;
  align-items: center;
  margin: 0 0 12px;
  font-size: 15px;
  color: #2c3e50;
  font-weight: 500;
}

.upload-title .van-icon {
  margin-right: 8px;
}

.upload-btn {
  width: 60px;
  height: 60px;
  border: 2px dashed #3498db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(52, 152, 219, 0.05);
}

.custom-uploader /deep/ .van-uploader__preview {
  margin: 0 8px 8px 0;
}

.custom-uploader /deep/ .van-uploader__preview-image {
  border-radius: 12px;
}

/* 保存按钮 */
.save-button-container {
  padding: 0 10px;
  margin-top: 20px;
}

.save-button {
  background: linear-gradient(to right, #3498db, #2ecc71);
  border: none;
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
  font-weight: bold;
  height: 50px;
  font-size: 16px;
}

.save-button .van-icon {
  margin-right: 8px;
  vertical-align: middle;
}

.save-button[disabled] {
  opacity: 0.7;
}

/* 安全区域 */
.safe-area-bottom {
  height: 30px;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .record-container {
    padding: 12px;
  }
  
  .header-card {
    padding: 12px;
  }
  
  .mood-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metric-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .metric-value {
    margin-top: 6px;
  }
}
</style>