<template>
  <div class="report-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="心理成长报告"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
      class="app-nav-bar"
    />
    
    <!-- 加载动画 -->
    <div class="loading-overlay" v-if="loading">
      <van-loading size="24px" color="#3498db" vertical>加载报告中...</van-loading>
    </div>
    
    <!-- 报告内容 -->
    <div v-if="!loading" class="report-content">
      <!-- 用户概览卡片 -->
      <div class="overview-card">
        <div class="user-info">
          <van-image
            round
            width="60px"
            height="60px"
            :src="$store.state.User.head_img || defaultAvatar"
            class="user-avatar"
          />
          <div class="user-details">
            <h3 class="username">{{ $store.state.User.username }}</h3>
            <p class="user-class">{{ $store.state.User.real_class }}</p>
          </div>
        </div>
        
        <div class="overview-stats">
          <div class="stat-item">
            <div class="stat-value">{{ reportData.totalRecords }}</div>
            <div class="stat-label">总记录数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ reportData.avgStress }}/10</div>
            <div class="stat-label">平均压力</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ reportData.avgEnergy }}/10</div>
            <div class="stat-label">平均精力</div>
          </div>
        </div>
      </div>
      
      <!-- 情绪趋势图表 -->
      <div class="chart-card">
        <div class="card-header">
          <h3><van-icon name="chart-trending-o" color="#3498db" /> 情绪变化趋势</h3>
          <van-dropdown-menu>
            <van-dropdown-item v-model="timeRange" :options="timeOptions" />
          </van-dropdown-menu>
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
            <div class="mood-percentage">{{ mood.percentage }}%</div>
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
      <div class="experiment-card">
        <div class="card-header">
          <h3><van-icon name="experiment" color="#3498db" /> 实验类型分布</h3>
        </div>
        
        <div class="chart-container">
          <div ref="experimentChart" class="chart" style="height: 250px;"></div>
        </div>
      </div>
      
      <!-- 关键发现 -->
      <div class="insights-card">
        <div class="card-header">
          <h3><van-icon name="bulb-o" color="#3498db" /> 关键发现</h3>
        </div>
        
        <div class="insights-list">
          <div class="insight-item">
            <van-icon name="like-o" color="#2ecc71" size="20" />
            <div class="insight-content">
              <div class="insight-title">积极情绪高峰</div>
              <div class="insight-text">周四通常是您情绪最积极的日子</div>
            </div>
          </div>
          
          <div class="insight-item">
            <van-icon name="fire-o" color="#e74c3c" size="20" />
            <div class="insight-content">
              <div class="insight-title">压力模式</div>
              <div class="insight-text">周五下午压力指数最高，建议提前规划放松活动</div>
            </div>
          </div>
          
          <div class="insight-item">
            <van-icon name="flower-o" color="#9b59b6" size="20" />
            <div class="insight-content">
              <div class="insight-title">最佳实验</div>
              <div class="insight-text">"光的偏振与心态调节"实验对您情绪改善效果最显著</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 行动建议 -->
      <div class="recommendation-card">
        <div class="card-header">
          <h3><van-icon name="guide-o" color="#3498db" /> 行动建议</h3>
        </div>
        
        <div class="recommendations">
          <div class="recommendation-item">
            <div class="rec-icon">
              <van-icon name="music-o" color="#3498db" size="20" />
            </div>
            <div class="rec-content">
              <h4>每日冥想练习</h4>
              <p>每天花10分钟进行正念冥想，有助于降低压力水平</p>
            </div>
          </div>
          
          <div class="recommendation-item">
            <div class="rec-icon">
              <van-icon name="clock-o" color="#f39c12" size="20" />
            </div>
            <div class="rec-content">
              <h4>调整作息时间</h4>
              <p>尝试提前30分钟入睡，精力水平可提升15%</p>
            </div>
          </div>
          
          <div class="recommendation-item">
            <div class="rec-icon">
              <van-icon name="friends-o" color="#2ecc71" size="20" />
            </div>
            <div class="rec-content">
              <h4>增加社交互动</h4>
              <p>每周增加2次与朋友交流，有助于提升积极情绪</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分享按钮 -->
    <div class="share-button-container">
      <van-button 
        round 
        block 
        type="primary" 
        icon="share" 
        class="share-button"
      >
        分享报告
      </van-button>
    </div>
  </div>
</template>

<script>
import { NavBar, Icon, Button, Loading, DropdownMenu, DropdownItem, Image } from 'vant';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

export default {
  components: {
    [NavBar.name]: NavBar,
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Image.name]: Image
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
    //   user: {
    //     username: '物理探索者',
    //     real_class: '2025级物理一班',
    //     avatar: 'https://img.yzcdn.cn/vant/cat.jpeg'
    //   },
      defaultAvatar: 'https://img.yzcdn.cn/vant/user-active.png',
      reportData: {
        totalRecords: 24,
        avgStress: 5.2,
        avgEnergy: 6.8,
        moodTrend: [
          { date: '9/1', mood: 3 },
          { date: '9/2', mood: 4 },
          { date: '9/3', mood: 2 },
          { date: '9/4', mood: 3 },
          { date: '9/5', mood: 5 },
          { date: '9/6', mood: 4 },
          { date: '9/7', mood: 3 }
        ],
        moodDistribution: [
          { name: '高兴', count: 6, percentage: 25 },
          { name: '平静', count: 8, percentage: 33 },
          { name: '疲惫', count: 5, percentage: 21 },
          { name: '低落', count: 3, percentage: 13 },
          { name: '兴奋', count: 2, percentage: 8 }
        ],
        stressEnergy: [
          { time: '周一', stress: 4.5, energy: 7.2 },
          { time: '周二', stress: 5.1, energy: 6.8 },
          { time: '周三', stress: 4.8, energy: 6.5 },
          { time: '周四', stress: 3.9, energy: 7.5 },
          { time: '周五', stress: 6.2, energy: 5.8 },
          { time: '周六', stress: 4.0, energy: 7.0 },
          { time: '周日', stress: 3.5, energy: 7.8 }
        ],
        experiments: [
          { name: '光的偏振', count: 8 },
          { name: '共振实验', count: 6 },
          { name: '熵增原理', count: 5 },
          { name: '磁场力', count: 3 },
          { name: '其他', count: 2 }
        ]
      },
      moodChart: null,
      stressEnergyChart: null,
      experimentChart: null
    };
  },
  computed: {
    moodDistribution() {
      return this.reportData.moodDistribution.map(item => {
        return {
          ...item,
          icon: this.getMoodIcon(item.name),
          color: this.getMoodColor(item.name)
        };
      });
    }
  },
  mounted() {
    // 模拟加载数据
    setTimeout(() => {
      this.loading = false;
      this.$nextTick(() => {
        this.initCharts();
      });
    }, 1500);
    this.$message.error("页面数据及功能仍在完善中...");
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.moodChart) {
      this.moodChart.dispose();
    }
    if (this.stressEnergyChart) {
      this.stressEnergyChart.dispose();
    }
    if (this.experimentChart) {
      this.experimentChart.dispose();
    }
  },
  methods: {
    // 初始化图表
    initCharts() {
      this.initMoodChart();
      this.initStressEnergyChart();
      this.initExperimentChart();
    },
    
    // 初始化情绪趋势图
    initMoodChart() {
      this.moodChart = echarts.init(this.$refs.moodChart);
      
      const option = {
        tooltip: {
          trigger: 'axis'
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
          data: this.reportData.moodTrend.map(item => item.date),
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          }
        },
        yAxis: {
          type: 'value',
          min: 1,
          max: 5,
          axisLabel: {
            formatter: (value) => {
              const moods = ['', '低落', '疲惫', '平静', '高兴', '兴奋'];
              return moods[value] || '';
            }
          },
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [
          {
            name: '情绪指数',
            type: 'line',
            data: this.reportData.moodTrend.map(item => item.mood),
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
      window.addEventListener('resize', () => {
        this.moodChart.resize();
      });
    },
    
    // 初始化压力精力对比图
    initStressEnergyChart() {
      this.stressEnergyChart = echarts.init(this.$refs.stressEnergyChart);
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['压力指数', '精力水平'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.reportData.stressEnergy.map(item => item.time),
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 10,
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [
          {
            name: '压力指数',
            type: 'bar',
            data: this.reportData.stressEnergy.map(item => item.stress),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#e74c3c' },
                { offset: 1, color: '#f5b7b1' }
              ])
            },
            barWidth: '20%'
          },
          {
            name: '精力水平',
            type: 'bar',
            data: this.reportData.stressEnergy.map(item => item.energy),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2ecc71' },
                { offset: 1, color: '#a9dfbf' }
              ])
            },
            barWidth: '20%'
          }
        ]
      };
      
      this.stressEnergyChart.setOption(option);
      
      // 响应式调整
      window.addEventListener('resize', () => {
        this.stressEnergyChart.resize();
      });
    },
    
    // 初始化实验类型分布图
    initExperimentChart() {
      this.experimentChart = echarts.init(this.$refs.experimentChart);
      
      const colors = ['#3498db', '#9b59b6', '#2ecc71', '#f39c12', '#e74c3c'];
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          formatter: (name) => {
            const item = this.reportData.experiments.find(item => item.name === name);
            return `${name} ${item.count}次`;
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
              show: false,
              position: 'center'
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
            data: this.reportData.experiments.map((item, index) => ({
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
      
      // 响应式调整
      window.addEventListener('resize', () => {
        this.experimentChart.resize();
      });
    },
    
    // 获取心情图标
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
    
    // 获取心情颜色
    getMoodColor(mood) {
      const colors = {
        '高兴': '#f39c12',
        '平静': '#3498db',
        '兴奋': '#9b59b6',
        '疲惫': '#95a5a6',
        '低落': '#e74c3c'
      };
      return colors[mood] || '#3498db';
    }
  }
};
</script>

<style scoped>
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

/* 响应式调整 */
@media (max-width: 480px) {
  .distribution-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header .van-dropdown-menu {
    margin-top: 10px;
    align-self: flex-end;
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
</style>