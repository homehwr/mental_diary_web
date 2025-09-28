<template>
  <div class="report-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="心灵成长报告"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
      class="app-nav-bar"
    />
    
    <!-- 时间范围选择 -->
    <van-dropdown-menu>
      <van-dropdown-item v-model="timeRange" :options="timeOptions" @change="changeTimeRange" />
    </van-dropdown-menu>
    
    <!-- 加载动画 -->
    <div class="loading-overlay" v-if="loading">
      <van-loading size="24px" color="#3498db" vertical>加载报告中...</van-loading>
    </div>
    
    <!-- 空数据提示 -->
    <div v-if="!loading && !hasData" class="empty-state">
      <div class="empty-icon">
        <van-icon name="notes-o" size="60" color="#bdc3c7" />
      </div>
      <h3 class="empty-title">暂无数据</h3>
      <p class="empty-desc">这段时间还没有日记记录，<br>开始记录您的心理状态吧</p>
      <van-button 
        type="primary" 
        round 
        @click="goToDiary"
        class="empty-action"
      >
        去写日记
      </van-button>
    </div>
    
    <!-- 报告内容 -->
    <div v-show="!loading && hasData" class="report-content">
      <!-- 用户概览卡片 -->
      <div class="overview-card">
        <div class="user-info">
          <van-image
            round
            width="60px"
            height="60px"
            :src="safeAvatar"
            class="user-avatar"
          />
          <div class="user-details">
            <h3 class="username">{{ safeUsername }}</h3>
            <p class="user-class">{{ safeUserClass }}</p>
          </div>
        </div>
        
        <div class="overview-stats">
          <div class="stat-item">
            <div class="stat-value">{{ reportData.total_records }}</div>
            <div class="stat-label">总记录数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ reportData.avg_stress }}/10</div>
            <div class="stat-label">平均压力</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ reportData.avg_energy }}/10</div>
            <div class="stat-label">平均精力</div>
          </div>
        </div>
      </div>
      
      <!-- 情绪趋势图表 -->
      <div class="chart-card">
        <div class="card-header">
          <h3><van-icon name="chart-trending-o" color="#3498db" /> 情绪变化趋势</h3>
        </div>
        
        <div class="chart-container">
          <div ref="moodChart" class="chart" style="height: 250px;"></div>
        </div>
      </div>
      
      <!-- 情绪分布卡片 -->
      <div class="mood-distribution-card">
        <div class="card-header">
          <h3><van-icon name="smile-comment-o" color="#3498db" /> 情绪分布</h3>
        </div>
        
        <div class="distribution-grid">
          <div 
            v-for="(mood, index) in moodDistribution" 
            :key="index" 
            class="mood-item"
            :style="{ backgroundColor: mood.color + '20' }"
          >
            <div class="mood-icon">
              <van-icon :name="mood.icon" :color="mood.color" size="24" />
            </div>
            <div class="mood-info">
              <div class="mood-name">{{ mood.name }}</div>
              <div class="mood-count">{{ mood.count }}次</div>
            </div>
            <div class="mood-percentage">{{ mood.percentage.toFixed(1) }}%</div>
          </div>
        </div>
      </div>
      
      <!-- 压力与精力对比 -->
      <div class="comparison-card">
        <div class="card-header">
          <h3><van-icon name="balance-o" color="#3498db" /> 压力与精力对比</h3>
        </div>
        
        <div class="chart-container">
          <div ref="stressEnergyChart" class="chart" style="height: 250px;"></div>
        </div>
      </div>
      
      <!-- 实验类型分布 -->
      <div class="experiment-card" v-if="hasExperimentData">
        <div class="card-header">
          <h3><van-icon name="experiment" color="#3498db" /> 实验类型分布</h3>
        </div>
        
        <div class="chart-container">
          <div ref="experimentChart" class="chart" style="height: 250px;"></div>
        </div>
      </div>
      
      <!-- 关键发现 -->
      <div class="insights-card" v-if="hasInsights">
        <div class="card-header">
          <h3><van-icon name="bulb-o" color="#3498db" /> 关键发现</h3>
        </div>
        
        <div class="insights-list">
          <div 
            v-for="(insight, index) in reportData.insights" 
            :key="index" 
            class="insight-item"
          >
            <van-icon :name="getInsightIcon(insight.title)" :color="getInsightColor(insight.title)" size="20" />
            <div class="insight-content">
              <div class="insight-title">{{ insight.title }}</div>
              <div class="insight-text">{{ insight.content }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 行动建议 -->
      <div class="recommendation-card" v-if="hasRecommendations">
        <div class="card-header">
          <h3><van-icon name="guide-o" color="#3498db" /> 行动建议</h3>
        </div>
        
        <div class="recommendations">
          <div 
            v-for="(rec, index) in reportData.recommendations" 
            :key="index" 
            class="recommendation-item"
          >
            <div class="rec-icon">
              <van-icon :name="getRecommendationIcon(rec.title)" :color="getRecommendationColor(index)" size="20" />
            </div>
            <div class="rec-content">
              <h4>{{ rec.title }}</h4>
              <p>{{ rec.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="creator-info-chart">
      <p>© 2025 赣南师范大学物理与电子信息学院 | 格致心灵日记</p>
      <p>设计开发: 物公2201黄文瑞</p>
    </div>
    <!-- 分享按钮 -->
    <div class="share-button-container" v-if="hasData">
      <van-button 
        round 
        block 
        type="primary" 
        icon="share" 
        class="share-button"
        @click="openShare"
      >
        分享报告
      </van-button>
    </div>

    <!-- 分享弹窗 -->
    <van-popup 
      v-model="showSharePopup" 
      position="bottom" 
      round
      :close-on-click-overlay="false"
    >
      <div class="share-popup">
        <h3>分享心灵成长报告</h3>
        <div class="share-options">
          <div class="share-option" @click="generateShareImage">
            <van-icon name="photo" size="24" color="#3498db" />
            <span>生成分享图片</span>
          </div>
          <div class="share-option" @click="shareToWechat">
            <van-icon name="wechat" size="24" color="#07c160" />
            <span>分享到微信</span>
          </div>
          <div class="share-option" @click="shareToQQ">
            <van-icon name="qq" size="24" color="#12b7f5" />
            <span>分享到QQ</span>
          </div>
          <div class="share-option" @click="shareToWeibo">
            <van-icon name="weibo" size="24" color="#e6162d" />
            <span>分享到微博</span>
          </div>
          <div class="share-option" @click="saveToAlbum">
            <van-icon name="down" size="24" color="#f39c12" />
            <span>保存到相册</span>
          </div>
        </div>
        <van-button 
          block 
          class="cancel-btn" 
          @click="showSharePopup = false"
        >
          取消
        </van-button>
      </div>
    </van-popup>

    <!-- 分享图片预览 -->
    <van-popup 
      v-model="showImagePreview" 
      position="bottom" 
      round
      closeable
      :close-on-click-overlay="false"
      class="image-preview-popup"
      @close="showImagePreview = false"
    >
      <div class="image-preview">
        <h3>分享图片预览</h3>
        <div class="preview-container">
          <img :src="shareImageUrl" alt="心灵成长报告" class="share-image" />
        </div>
        <div class="preview-actions">
          <van-button 
            type="primary" 
            block 
            @click="saveShareImage"
            :loading="savingImage"
          >
            {{ savingImage ? '保存中...' : '保存图片' }}
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 隐藏的分享内容容器 - 优化版本 -->
    <div v-show="false" class="share-content-container">
      <div ref="shareContent" class="share-content">
        <div class="share-template">
          <!-- 使用纯色背景避免渐变问题 -->
          <div class="share-header">
            <div class="share-title">心灵成长报告</div>
            <div class="share-subtitle">遇见更好的自己</div>
          </div>
          
          <!-- 用户信息 -->
          <div class="share-user-info">
            <div class="user-avatar">
              <img :src="safeAvatar" alt="头像" crossOrigin="anonymous" />
            </div>
            <div class="user-details">
              <div class="username">{{ safeUsername }}</div>
              <div class="user-class">{{ safeUserClass }}</div>
              <div class="report-date">{{ currentDate }}</div>
            </div>
          </div>

          <!-- 核心数据 -->
          <div class="share-stats">
            <div class="stat-item">
              <div class="stat-value">{{ reportData.total_records }}</div>
              <div class="stat-label">记录天数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ reportData.avg_stress }}/10</div>
              <div class="stat-label">平均压力</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ reportData.avg_energy }}/10</div>
              <div class="stat-label">平均精力</div>
            </div>
          </div>

          <!-- 情绪分布 -->
          <div class="share-section" v-if="hasMoodData">
            <h3>情绪分布</h3>
            <div class="mood-distribution">
              <div 
                v-for="(mood, index) in displayMoods" 
                :key="index"
                class="mood-share-item"
              >
                <div class="mood-color" :style="{ backgroundColor: safeMoodColor(mood.color) }"></div>
                <span class="mood-name">{{ mood.name }}</span>
                <span class="mood-percentage">{{ mood.percentage.toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <!-- 关键发现 -->
          <div class="share-section" v-if="hasInsights">
            <h3>关键发现</h3>
            <div class="insights-share">
              <div 
                v-for="(insight, index) in displayInsights" 
                :key="index"
                class="insight-share-item"
              >
                <div class="insight-icon">💡</div>
                <div class="insight-content">
                  <div class="insight-title">{{ insight.title }}</div>
                  <div class="insight-text">{{ insight.content }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="share-footer">
            <div class="footer-content">
              <div class="app-name">心灵日记</div>
              <div class="footer-text">生成时间: {{ generationTime }}</div>
              <div class="slogan">遇见更好的自己 · 记录心灵成长</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { NavBar, Icon, Button, Loading, DropdownMenu, DropdownItem, Image, Toast, Popup, Dialog } from 'vant';
import * as echarts from 'echarts';
import html2canvas from 'html2canvas';

export default {
  name: 'PsychologicalReport',
  components: {
    [NavBar.name]: NavBar,
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Image.name]: Image,
    [Popup.name]: Popup,
    [Dialog.name]: Dialog,
    [Toast.name]: Toast
  },
  data() {
    return {
      loading: true,
      timeRange: 'week',
      timeOptions: [
        { text: '最近一周', value: 'week' },
        { text: '最近一月', value: 'month' },
        { text: '最近三月', value: 'quarter' }
      ],
      defaultAvatar: 'https://img.yzcdn.cn/vant/user-active.png',
      reportData: {
        total_records: 0,
        avg_stress: 0,
        avg_energy: 0,
        mood_trend: [],
        mood_distribution: [],
        stress_energy: [],
        experiments: [],
        insights: [],
        recommendations: []
      },
      moodChart: null,
      stressEnergyChart: null,
      experimentChart: null,
      // 分享相关状态
      showSharePopup: false,
      showImagePreview: false,
      shareImageUrl: '',
      savingImage: false,
      currentDate: this.formatDate(new Date()),
      generationTime: this.formatTime(new Date()),
      timeRangeData: '最近一周',
      // 微信分享配置
      wxConfig: {
        debug: false,
        appId: '',
        timestamp: 0,
        nonceStr: '',
        signature: '',
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareAppMessage',
          'onMenuShareTimeline'
        ]
      }
    };
  },
  computed: {
    // 检查是否有数据
    hasData() {
      return this.reportData.total_records > 0;
    },
    
    // 情绪分布计算
    moodDistribution() {
      if (!this.reportData.mood_distribution || this.reportData.mood_distribution.length === 0) {
        return [];
      }
      
      return this.reportData.mood_distribution
        .filter(item => item.count > 0)
        .map(item => ({
          ...item,
          icon: this.getMoodIcon(item.name),
          color: this.getMoodColor(item.name),
          percentage: item.count > 0 ? (item.count / this.reportData.total_records) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);
    },
    
    // 检查是否有实验数据
    hasExperimentData() {
      return this.reportData.experiments && this.reportData.experiments.length > 0;
    },
    
    // 检查是否有洞察数据
    hasInsights() {
      return this.reportData.insights && this.reportData.insights.length > 0;
    },
    
    // 检查是否有建议数据
    hasRecommendations() {
      return this.reportData.recommendations && this.reportData.recommendations.length > 0;
    },
    
    // 安全的用户数据
    safeAvatar() {
      const userAvatar = this.$store.state.User?.head_img;
      if (userAvatar && this.isValidUrl(userAvatar)) {
        return userAvatar;
      }
      return this.defaultAvatar;
    },
    
    safeUsername() {
      return this.$store.state.User?.username || '用户';
    },
    
    safeUserClass() {
      return this.$store.state.User?.real_class || '';
    },
    
    // 情绪数据
    hasMoodData() {
      return this.moodDistribution && this.moodDistribution.length > 0;
    },
    
    displayMoods() {
      return this.moodDistribution.slice(0, 3);
    },
    
    // 关键发现数据
    displayInsights() {
      return this.reportData.insights?.slice(0, 2) || [];
    }
  },
  mounted() {
    this.loadReportData();
    // 初始化微信分享配置
    this.initWechatShare();
  },
  beforeDestroy() {
    this.destroyCharts();
  },
  methods: {
    // 初始化微信分享
    async initWechatShare() {
      try {
        // 这里需要从后端获取微信JS-SDK配置
        // const response = await this.$axios.get('/wechat/config', {
        //   params: {
        //     url: window.location.href.split('#')[0]
        //   }
        // });
        let response;
        if (response.data) {
          this.wxConfig = { ...this.wxConfig, ...response.data };
          
          // 配置微信JS-SDK
          if (window.wx) {
            window.wx.config(this.wxConfig);
            
            window.wx.ready(() => {
              console.log('微信JS-SDK 配置成功');
            });
            
            window.wx.error((res) => {
              console.error('微信JS-SDK 配置失败:', res);
            });
          }
        }
      } catch (error) {
        console.warn('微信分享配置加载失败:', error);
      }
    },
    
    // 设置微信分享内容
    setupWechatShare() {
      if (!window.wx) return;
      
      const shareData = {
        title: `${this.safeUsername}的心灵成长报告`,
        desc: `记录了${this.reportData.total_records}天的心情变化，平均压力${this.reportData.avg_stress}/10，平均精力${this.reportData.avg_energy}/10`,
        link: window.location.href,
        imgUrl: this.safeAvatar
      };
      
      // 朋友分享
      window.wx.updateAppMessageShareData(shareData);
      // 朋友圈分享
      window.wx.updateTimelineShareData({
        ...shareData,
        title: `${this.safeUsername}的心灵成长报告 - 心灵日记`
      });
    },
    
    changeTimeRange() {
      this.loadReportData();
      if (this.timeRange === 'week'){
        this.timeRangeData = '最近一周';
      } else if (this.timeRange === 'month'){
        this.timeRangeData = '最近一月';
      } else {
        this.timeRangeData = '最近三月';
      }
      
    },
    
    async loadReportData() {
      this.loading = true;
      
      try {
        const response = await this.$axios.get(`/stats/reportPersonal`, {
          params: {
            uid: this.$store.state.User.uid,
            timeRange: this.timeRange
          }
        });
        
        this.reportData = response.data;
        // console.log(this.reportData);
        
        // 延迟初始化图表，确保DOM已渲染
        this.$nextTick(() => {
          setTimeout(() => {
            this.initCharts();
          }, 100);
        });
        
      } catch (error) {
        console.error('加载报告失败:', error);
        Toast('加载报告失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },
    
    initCharts() {
      this.destroyCharts();
      
      if (this.hasData) {
        if (this.$refs.moodChart && this.reportData.mood_trend.length > 0) {
          this.initMoodChart();
        }
        if (this.$refs.stressEnergyChart && this.reportData.stress_energy.length > 0) {
          this.initStressEnergyChart();
        }
        if (this.$refs.experimentChart && this.hasExperimentData) {
          this.initExperimentChart();
        }
      }
    },
    
    destroyCharts() {
      [this.moodChart, this.stressEnergyChart, this.experimentChart].forEach(chart => {
        if (chart) {
          chart.dispose();
        }
      });
      this.moodChart = null;
      this.stressEnergyChart = null;
      this.experimentChart = null;
    },
    
    initMoodChart() {
      try {
        this.moodChart = echarts.init(this.$refs.moodChart);
        
        const moodData = this.reportData.mood_trend;
        const dates = moodData.map(item => item.date);
        const moods = moodData.map(item => item.mood);
        
        const option = {
          tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>情绪指数: {c}'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates,
            axisLine: {
              lineStyle: { color: '#ccc' }
            },
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: 'value',
            min: 1,
            max: 5,
            interval: 1,
            axisLabel: {
              formatter: (value) => {
                const moodMap = { 1: '低落', 2: '疲惫', 3: '平静', 4: '高兴', 5: '兴奋' };
                return moodMap[value] || value;
              }
            },
            axisLine: {
              lineStyle: { color: '#ccc' }
            },
            splitLine: {
              lineStyle: { color: '#f0f0f0' }
            }
          },
          series: [
            {
              name: '情绪指数',
              type: 'line',
              data: moods,
              smooth: true,
              symbol: 'circle',
              symbolSize: 8,
              lineStyle: {
                width: 3,
                color: '#3498db'
              },
              itemStyle: {
                color: '#3498db'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(52, 152, 219, 0.3)' },
                  { offset: 1, color: 'rgba(52, 152, 219, 0.1)' }
                ])
              }
            }
          ]
        };
        
        this.moodChart.setOption(option);
        
        // 响应式调整
        const resizeHandler = () => this.moodChart?.resize();
        window.addEventListener('resize', resizeHandler);
        this.$once('hook:beforeDestroy', () => {
          window.removeEventListener('resize', resizeHandler);
        });
        
      } catch (error) {
        console.error('初始化情绪趋势图失败:', error);
      }
    },
    
    initStressEnergyChart() {
      try {
        this.stressEnergyChart = echarts.init(this.$refs.stressEnergyChart);
        
        const data = this.reportData.stress_energy;
        const categories = data.map(item => item.time);
        const stressData = data.map(item => item.stress);
        const energyData = data.map(item => item.energy);
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['压力指数', '精力水平'],
            bottom: 0
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '10%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: categories,
            axisLine: {
              lineStyle: { color: '#ccc' }
            }
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 10,
            axisLine: {
              lineStyle: { color: '#ccc' }
            },
            splitLine: {
              lineStyle: { color: '#f0f0f0' }
            }
          },
          series: [
            {
              name: '压力指数',
              type: 'bar',
              data: stressData,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#e74c3c' },
                  { offset: 1, color: '#f5b7b1' }
                ])
              },
              barWidth: '30%'
            },
            {
              name: '精力水平',
              type: 'bar',
              data: energyData,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2ecc71' },
                  { offset: 1, color: '#a9dfbf' }
                ])
              },
              barWidth: '30%'
            }
          ]
        };
        
        this.stressEnergyChart.setOption(option);
        
        const resizeHandler = () => this.stressEnergyChart?.resize();
        window.addEventListener('resize', resizeHandler);
        this.$once('hook:beforeDestroy', () => {
          window.removeEventListener('resize', resizeHandler);
        });
        
      } catch (error) {
        console.error('初始化压力精力对比图失败:', error);
      }
    },
    
    initExperimentChart() {
      try {
        this.experimentChart = echarts.init(this.$refs.experimentChart);
        
        const experimentData = this.reportData.experiments;
        const colors = ['#3498db', '#9b59b6', '#2ecc71', '#f39c12', '#e74c3c'];
        
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}次 ({d}%)'
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            formatter: (name) => {
              const item = experimentData.find(item => item.name === name);
              return item ? `${name} (${item.count}次)` : name;
            }
          },
          series: [
            {
              name: '实验类型',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '14',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: experimentData.map((item, index) => ({
                value: item.count,
                name: item.name,
                itemStyle: {
                  color: colors[index % colors.length]
                }
              }))
            }
          ]
        };
        
        this.experimentChart.setOption(option);
        
        const resizeHandler = () => this.experimentChart?.resize();
        window.addEventListener('resize', resizeHandler);
        this.$once('hook:beforeDestroy', () => {
          window.removeEventListener('resize', resizeHandler);
        });
        
      } catch (error) {
        console.error('初始化实验类型分布图失败:', error);
      }
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
    
    getInsightIcon(title) {
      if (title.includes('压力')) return 'fire-o';
      if (title.includes('精力')) return 'bolt';
      if (title.includes('情绪')) return 'smile-o';
      return 'bulb-o';
    },
    
    getInsightColor(title) {
      if (title.includes('压力')) return '#e74c3c';
      if (title.includes('精力')) return '#f39c12';
      if (title.includes('情绪')) return '#3498db';
      return '#9b59b6';
    },
    
    getRecommendationIcon(title) {
      if (title.includes('压力')) return 'fire-o';
      if (title.includes('精力')) return 'bolt';
      if (title.includes('情绪')) return 'smile-o';
      if (title.includes('记录')) return 'edit';
      return 'guide-o';
    },
    
    getRecommendationColor(index) {
      const colors = ['#3498db', '#f39c12', '#2ecc71', '#9b59b6', '#e74c3c'];
      return colors[index % colors.length];
    },

    // 打开分享弹窗
    openShare() {
      this.showSharePopup = true;
      // 设置微信分享内容
      this.setupWechatShare();
    },

    // 分享到微信
    shareToWechat() {
      this.showSharePopup = false;
      
      if (window.wx) {
        // 微信JS-SDK已配置，可以直接调用分享
        Toast('请点击右上角分享到微信');
      } else {
        // 生成图片供用户手动分享
        this.generateShareImage().then(() => {
          Toast('请使用微信扫描二维码或保存图片分享');
          // window.location.href = 'weixin://dl';
        });
      }
    },

    // 分享到QQ
    shareToQQ() {
      this.showSharePopup = false;
      this.generateShareImage().then(() => {
        Toast('请使用QQ扫描二维码或保存图片分享');
      });
    },

    // 分享到微博
    shareToWeibo() {
      this.showSharePopup = false;
      
      const shareUrl = `http://service.weibo.com/share/share.php?title=${encodeURIComponent(`${this.safeUsername}的心灵成长报告`)}&url=${encodeURIComponent(window.location.href)}`;
      window.open(shareUrl, '_blank');
    },

    // 保存到相册
    saveToAlbum() {
      this.showSharePopup = false;
      this.generateShareImage();
    },

    // 日期格式化
    formatDate(date, format = 'YYYY年MM月DD日') {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      if (format === 'YYYYMMDD_HHmmss') {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}_${hours}${minutes}${seconds}`;
      }
      
      return `${year}年${month}月${day}日`;
    },

    // 时间格式化
    formatTime(date) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },

    // 安全的颜色处理
    safeMoodColor(color) {
      const safeColors = {
        '#f39c12': '#f39c12',
        '#3498db': '#3498db', 
        '#9b59b6': '#9b59b6',
        '#95a5a6': '#95a5a6',
        '#e74c3c': '#e74c3c'
      };
      return safeColors[color] || '#3498db';
    },

    // URL验证
    isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    },

    // 生成分享图片 - 修复版本
    async generateShareImage() {
      this.showSharePopup = false;
      
      Toast.loading({
        message: '生成分享图片中...',
        forbidClick: true,
        duration: 0
      });

      try {
        // 等待DOM更新完成
        await this.$nextTick();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const shareElement = this.$refs.shareContent;
        
        if (!shareElement) {
          throw new Error('分享元素未找到');
        }

        // 使用更安全的html2canvas配置
        const canvas = await html2canvas(shareElement, {
          backgroundColor: '#667eea',
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: 375,
          height: shareElement.scrollHeight,
          onclone: (clonedDoc) => {
            // 在克隆的文档中修复可能的问题
            const clonedElement = clonedDoc.querySelector('.share-content');
            if (clonedElement) {
              // 确保所有图片加载完成
              const images = clonedElement.getElementsByTagName('img');
              Array.from(images).forEach(img => {
                img.crossOrigin = 'anonymous';
                // 如果图片加载失败，使用默认头像
                img.onerror = () => {
                  img.src = this.defaultAvatar;
                };
              });
            }
          }
        });

        // 转换为图片URL
        this.shareImageUrl = canvas.toDataURL('image/png', 0.9);
        
        Toast.clear();
        this.showImagePreview = true;
        
      } catch (error) {
        console.error('生成分享图片失败:', error);
        Toast.clear();
        
        // 如果详细版本失败，使用简化版本
        Toast('正在使用简化版本生成图片...');
        setTimeout(() => this.generateSimpleShareImage(), 500);
      }
    },

    // 备用方案：生成简化版分享图片
    async generateSimpleShareImage() {
      try {
        // 创建一个更简单的分享内容
        const simpleShareHtml = this.createSimpleShareHtml();
        
        // 创建临时元素
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = simpleShareHtml;
        tempDiv.style.width = '375px';
        tempDiv.style.padding = '20px';
        tempDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        tempDiv.style.color = 'white';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-1000px';
        tempDiv.style.top = '0';
        
        document.body.appendChild(tempDiv);
        
        const canvas = await html2canvas(tempDiv, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          allowTaint: false
        });
        
        this.shareImageUrl = canvas.toDataURL('image/png');
        document.body.removeChild(tempDiv);
        
        this.showImagePreview = true;
        Toast.clear();
        
      } catch (error) {
        console.error('备用方案也失败了:', error);
        Toast('生成失败，请稍后重试');
      }
    },

    // 创建简化版分享HTML
    createSimpleShareHtml() {
      // 使用base64编码的简单二维码占位符，或者使用在线生成二维码服务
      const qrCodeUrl = this.generateQRCodePlaceholder();
      
      return `
        <div style="text-align: center; padding: 30px 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-family: Arial, sans-serif; min-height: 667px; display: flex; flex-direction: column; justify-content: space-between;">
          <!-- 顶部标题 -->
          <div>
            <h1 style="font-size: 25px; margin-bottom: 10px; font-weight: bold;">格致心灵日记·心灵成长报告</h1>
            <p style="font-size: 16px; opacity: 0.9;">遇见更好的自己</p>
          </div>
          
          <!-- 用户信息 -->
          <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin: 20px 0; backdrop-filter: blur(10px);">
            <div style="font-size: 18px; margin-bottom: 10px; font-weight: bold;">${this.safeUsername}</div>
            <div style="font-size: 14px; opacity: 0.8;">${this.safeUserClass}</div>
          </div>
          
          <!-- 核心数据 -->
          <div style="display: flex; justify-content: space-around; margin: 30px 0;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">${this.reportData.total_records}</div>
              <div style="font-size: 12px;">${this.timeRangeData}记录天数</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">${this.reportData.avg_stress}/10</div>
              <div style="font-size: 12px;">平均压力</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold;">${this.reportData.avg_energy}/10</div>
              <div style="font-size: 12px;">平均精力</div>
            </div>
          </div>
          
          <!-- 二维码区域 -->
          <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 12px; margin: 20px 0; backdrop-filter: blur(10px);">
            <div style="font-size: 14px; margin-bottom: 10px;">扫描二维码记录日记，生成专属报告</div>
            <div style="display: flex; justify-content: center;">
              <img src="${qrCodeUrl}" alt="二维码" style="width: 120px; height: 120px; background: white; padding: 10px; border-radius: 8px;" />
            </div>
          </div>
          
          <!-- 底部信息 -->
          <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
            <div>生成时间: ${this.currentDate} ${this.generationTime}</div>
            <div style="margin-top: 5px;">格致心灵日记 · 遇见更好的自己</div>
          </div>
        </div>
      `;
    },
    generateQRCodePlaceholder() {
      // 方法1: 使用简单的base64占位符
      const simpleQRCode = 'data:image/png;base64,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';
      
      // 方法2: 使用在线二维码生成服务（需要网络）
      const currentUrl = window.location.href.split('#')[0];
      const onlineQRCode = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(currentUrl)}`;
      
      // 方法3: 如果有本地二维码图片，使用绝对路径
      // const localQRCode = window.location.origin + '/static/images/qrcode.png';
      
      return simpleQRCode; // 返回base64占位符，避免跨域问题
    },
    // 保存分享图片
    async saveShareImage() {
      if (!this.shareImageUrl) {
        Toast('请先生成分享图片');
        return;
      }

      this.savingImage = true;
      
      try {
        // 创建下载链接
        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        link.download = `心灵成长报告_${timestamp}.png`;
        link.href = this.shareImageUrl;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Toast.success('图片已保存到相册');
        this.showImagePreview = false;
        
      } catch (error) {
        console.error('保存图片失败:', error);
        Toast('保存失败，请长按图片手动保存');
      } finally {
        this.savingImage = false;
      }
    },

    // 跳转到日记页面
    goToDiary() {
      this.$router.push('/record');
    }
  }
};
</script>

<style scoped>
/* 空数据状态样式 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #7f8c8d;
}

.empty-icon {
  margin-bottom: 20px;
}

.empty-title {
  font-size: 18px;
  margin-bottom: 12px;
  color: #95a5a6;
}

.empty-desc {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 30px;
}

.empty-action {
  width: 120px;
}

/* 其他样式保持不变 */
.chart-container {
  position: relative;
  width: 100%;
  height: 250px;
}

.chart {
  width: 100%;
  height: 100%;
}

.distribution-grid .mood-item {
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
}

.mood-icon {
  margin-right: 12px;
}

.mood-info {
  flex: 1;
}

.mood-name {
  font-weight: bold;
  font-size: 15px;
}

.mood-count {
  font-size: 13px;
  color: #7f8c8d;
}

.mood-percentage {
  font-weight: bold;
  font-size: 16px;
}

.report-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: 100vh;
  padding-bottom: 100px;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
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

/* 用户概览卡片 */
.overview-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-avatar {
  margin-right: 15px;
  border: 2px solid #e4edf9;
}

.user-details {
  flex: 1;
}

.username {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: bold;
}

.user-class {
  margin: 4px 0 0;
  font-size: 14px;
  color: #7f8c8d;
}

.overview-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

/* 卡片通用样式 */
.chart-card,
.mood-distribution-card,
.comparison-card,
.experiment-card,
.insights-card,
.recommendation-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 图表容器 */
.chart-container {
  margin-top: 10px;
}

.chart {
  width: 100%;
}

/* 情绪分布网格 */
.distribution-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mood-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.mood-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mood-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background: white;
}

.mood-info {
  flex: 1;
}

.mood-name {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.mood-count {
  font-size: 12px;
  color: #7f8c8d;
}

.mood-percentage {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
}

/* 关键发现 */
.insights-list {
  display: flex;
  flex-direction: column;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.insight-item:last-child {
  border-bottom: none;
}

.insight-content {
  flex: 1;
  margin-left: 12px;
}

.insight-title {
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.insight-text {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
}

/* 行动建议 */
.recommendations {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
}

.rec-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.rec-content {
  flex: 1;
}

.rec-content h4 {
  margin: 0 0 6px;
  font-size: 15px;
  color: #2c3e50;
  font-weight: 500;
}

.rec-content p {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
}

/* 分享按钮 */
.share-button-container {
  padding: 16px;
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
}

.share-button {
  background: linear-gradient(135deg, #3498db, #2ecc71);
  border: none;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  height: 50px;
  font-size: 16px;
  font-weight: bold;
}

/* 分享弹窗样式 */
.share-popup {
  padding: 20px;
}

.share-popup h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.share-option:active {
  background-color: #f5f5f5;
}

.share-option span {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.cancel-btn {
  margin-top: 10px;
}

/* 图片预览弹窗 */
.image-preview-popup {
  height: 80%;
}

.image-preview {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.share-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.preview-actions {
  margin-top: 20px;
}

/* 分享内容样式 */
.share-content {
  width: 375px;
  min-height: 667px;
  background: #667eea;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
}

/* 使用伪元素创建渐变效果，但更安全 */
.share-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

.share-template {
  padding: 20px;
  position: relative;
  z-index: 1;
}

/* 分享头部 */
.share-header {
  text-align: center;
  padding: 30px 0 20px;
}

.share-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.share-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

/* 用户信息 */
.share-user-info {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 12px;
  margin: 20px 0;
}

.user-avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-details {
  margin-left: 15px;
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.user-class, .report-date {
  font-size: 12px;
  opacity: 0.8;
}

/* 统计数据 */
.share-stats {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

/* 分享区块 */
.share-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 12px;
  margin: 15px 0;
}

.share-section h3 {
  font-size: 16px;
  margin-bottom: 12px;
  border-left: 3px solid #fff;
  padding-left: 8px;
}

/* 情绪分布 */
.mood-distribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mood-share-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.mood-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
}

.mood-name {
  flex: 1;
  font-size: 14px;
}

.mood-percentage {
  font-size: 14px;
  font-weight: bold;
}

/* 关键发现 */
.insights-share {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-share-item {
  display: flex;
  align-items: flex-start;
}

.insight-icon {
  font-size: 16px;
  margin-right: 10px;
  margin-top: 2px;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.insight-text {
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.4;
}

/* 底部 */
.share-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
}

.footer-content {
  font-size: 12px;
  opacity: 0.8;
  line-height: 1.6;
}

.app-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.slogan {
  margin-top: 5px;
  font-style: italic;
}

/* 响应式调整 */
@media (max-width: 360px) {
  .distribution-grid {
    grid-template-columns: 1fr;
  }
  
  .share-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .overview-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-value {
    margin-bottom: 0;
  }
}
.creator-info-chart {
  text-align: center;
  color: #95a5a6;
  font-size: 12px;
  padding: 10px 0;
}
</style>