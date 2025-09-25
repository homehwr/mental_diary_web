<template>
  <div class="dashboard-container">
    <!-- 加载动画 -->
    <div v-if="loading" class="loading-container">
      <div class="skeleton-cards">
        <div v-for="n in 4" :key="n" class="skeleton-card">
          <div class="skeleton-icon"></div>
          <div class="skeleton-info">
            <div class="skeleton-value"></div>
            <div class="skeleton-label"></div>
          </div>
        </div>
      </div>
      
      <div class="skeleton-charts">
        <div v-for="n in 2" :key="n" class="skeleton-chart"></div>
      </div>
      
      <div class="skeleton-activities">
        <div v-for="n in 2" :key="n" class="skeleton-activity"></div>
      </div>
      
      <div class="skeleton-system">
        <div class="skeleton-status"></div>
      </div>
    </div>
    
    <div v-else>
      <h2 class="dashboard-title">控制面板</h2>
      
      <!-- 关键指标卡片 -->
      <div class="metric-cards">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon" style="background-color: #3498db;">
              <i class="el-icon-user-solid"></i>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ statsData.user_count }}</div>
              <div class="metric-label">用户总数</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon" style="background-color: #2ecc71;">
              <i class="el-icon-s-opportunity"></i>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ statsData.active_users }}</div>
              <div class="metric-label">今日活跃用户</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon" style="background-color: #e74c3c;">
              <i class="el-icon-notebook-2"></i>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ statsData.diary_count }}</div>
              <div class="metric-label">日记总数</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon" style="background-color: #f39c12;">
              <i class="el-icon-thumb"></i>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ statsData.visit_count }}</div>
              <div class="metric-label">点击量</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 数据图表区域 -->
      <div class="chart-row">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span>一周内日记情感分布</span>
            <el-tooltip content="基于最近7天日记的情感状态分析" placement="top">
              <i class="el-icon-info" style="color: #909399; margin-left: 5px;"></i>
            </el-tooltip>
          </div>
          <div class="chart-container">
            <div ref="emotionChart" style="height: 300px;" v-if="!loading"></div>
          </div>
        </el-card>
        
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span>日记提交趋势</span>
            <el-select v-model="diaryChartRange" size="mini" style="width: 100px;" @change="updateDiaryChart">
              <el-option label="最近7天" value="7"></el-option>
              <el-option label="最近30天" value="30"></el-option>
            </el-select>
          </div>
          <div class="chart-container">
            <div ref="diaryChart" style="height: 300px;" v-if="!loading"></div>
          </div>
        </el-card>
      </div>
      
      <!-- 最近活动区域 -->
      <div class="activity-row">
        <el-card class="activity-card" shadow="hover">
          <div slot="header" class="activity-header">
            <span>热门日记标签</span>
          </div>
          <div class="tag-cloud">
            <el-tag 
              v-for="(tag, index) in popularTags" 
              :key="index"
              :type="tagTypes[Math.random().toFixed(2)*100 % tagTypes.length]"
              size="medium"
              class="tag-item"
              effect="dark"
            >
              {{ tag.name }} ({{ tag.count }})
            </el-tag>
          </div>
        </el-card>
        
        <el-card class="activity-card" shadow="hover">
          <div slot="header" class="activity-header">
            <span>最新提交的日记</span>
            <el-button type="text" @click="goToDiaryList">查看全部</el-button>
          </div>
          <el-table :data="recentDiaries" style="width: 100%" v-loading="tableLoading">
            <el-table-column prop="mood" label="心情">
              <template slot-scope="scope">
                <el-tag 
                  :type="getMoodTagType(scope.row.mood)" 
                  :color="getMoodColor(scope.row.mood)"
                  effect="dark"
                  class="mood-tag"
                >
                  {{ getMoodName(scope.row.mood) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="author" label="姓名"></el-table-column>
            <el-table-column prop="class" label="班级" width="180"></el-table-column>
            <el-table-column prop="date" label="提交时间" width="150"></el-table-column>
            <!-- <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="viewDiary(scope.row)">查看</el-button>
              </template>
            </el-table-column> -->
          </el-table>
        </el-card>
      </div>
      
      <!-- 系统状态 -->
      <el-card class="system-status" shadow="hover">
        <div slot="header" class="system-header">
          <span>系统状态</span>
        </div>
        <div class="status-items">
          <div class="status-item">
            <div class="status-label">服务器状态</div>
            <div class="status-value">
              <el-tag type="success" effect="dark">运行正常</el-tag>
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">数据库状态</div>
            <div class="status-value">
              <el-tag type="success" effect="dark">连接正常</el-tag>
            </div>
          </div>
          <div class="status-item">
            <div class="status-label">缓存状态</div>
            <div class="status-value">
              <el-tag type="success" effect="dark">正常</el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <div class="dashboard-footer">
        <p style="margin-bottom: 5px;">© 2025 赣南师范大学物理与电子信息学院 | 格致心灵日记后台管理系统数据看板</p>
        <span style="padding: 0 auto; font-size: xx-small; color: #666;">制作：物理学（公费师范）2201班 黄文瑞</span>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

// 数据缓存
const dataCache = {
  statsData: null,
  moodDistribution: null,
  popularTags: null,
  cacheTime: 0,
  CACHE_DURATION: 5 * 60 * 1000 // 5分钟缓存
};

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: true,
      tableLoading: false,
      statsData: {
        user_count: 0,
        active_users: 0,
        diary_count: 0,
        visit_count: 0
      },
      diaryTrendData: {
        dates: [],
        counts: []
      },
      moodDistribution: [],
      diaryChartRange: '7',
      popularTags: [],
      tagTypes: ['', 'success', 'info', 'warning', 'danger'],
      recentDiaries: [],
      emotionChart: null,
      diaryChart: null,
      chartsInitialized: false
    };
  },
  mounted() {
    this.loadAllData();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.emotionChart) {
      this.emotionChart.dispose();
    }
    if (this.diaryChart) {
      this.diaryChart.dispose();
    }
  },
  methods: {
    // 检查缓存是否有效
    isCacheValid() {
      return dataCache.cacheTime && (Date.now() - dataCache.cacheTime) < dataCache.CACHE_DURATION;
    },
    
    // 初始化图表
    initCharts() {
      if (this.chartsInitialized) return;
      
      // 确保DOM元素存在
      if (this.$refs.emotionChart) {
        this.emotionChart = echarts.init(this.$refs.emotionChart);
      }
      
      if (this.$refs.diaryChart) {
        this.diaryChart = echarts.init(this.$refs.diaryChart);
      }
      
      this.chartsInitialized = true;
    },
    
    // 加载所有数据（使用并发请求优化）
    async loadAllData() {
      this.loading = true;
      
      try {
        // 检查缓存
        if (this.isCacheValid()) {
          this.statsData = dataCache.statsData;
          this.moodDistribution = dataCache.moodDistribution;
          this.popularTags = dataCache.popularTags;
        } else {
          // 并发请求数据
          const [statsRes, moodRes, tagsRes] = await Promise.all([
            this.$axios.get('/stats/stats'),
            this.$axios.get('/stats/mood-distribution'),
            this.$axios.get('/stats/popular-tags')
          ]);
          
          if (statsRes.data.success) {
            this.statsData = statsRes.data;
            dataCache.statsData = statsRes.data;
          }
          
          if (moodRes.data.success) {
            this.moodDistribution = moodRes.data.mood_counts;
            dataCache.moodDistribution = moodRes.data.mood_counts;
          }
          
          if (tagsRes.data.success) {
            this.popularTags = tagsRes.data.tags;
            dataCache.popularTags = tagsRes.data.tags;
          }
          
          // 更新缓存时间
          dataCache.cacheTime = Date.now();
        }
        
        // 加载日记趋势数据（不缓存，因为范围可能变化）
        await this.loadDiaryTrendData();
        
        // 加载最近日记（不缓存，因为数据实时性要求高）
        this.tableLoading = true;
        const recentRes = await this.$axios.get('/diary/getRecent');
        if (recentRes.data.success) {
          this.recentDiaries = recentRes.data.diaries;
        }
        this.tableLoading = false;
        
      } catch (error) {
        console.error('数据加载失败:', error);
        this.$message.error('数据加载失败，请稍后重试');
      } finally {
        this.loading = false;
        // 等待DOM更新后初始化图表
        this.$nextTick(() => {
          this.initCharts();
          this.updateEmotionChart();
          this.updateDiaryChart();
        });
      }
    },
    
    async loadDiaryTrendData() {
      try {
        const res = await this.$axios.get('/stats/diary-trend', {
          params: { range: this.diaryChartRange }
        });
        
        if (res.data.success) {
          this.diaryTrendData = res.data;
        }
      } catch (error) {
        console.error('获取日记趋势数据失败:', error);
      }
    },
    
    updateEmotionChart() {
      if (!this.emotionChart || this.moodDistribution.length === 0) return;
      
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: this.moodDistribution.map(item => item.mood_name)
        },
        series: [
          {
            name: '情感分布',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.moodDistribution.map(item => ({
              value: item.count,
              name: item.mood_name,
              itemStyle: {
                color: this.getMoodColor(item.mood_id)
              }
            }))
          }
        ]
      };
      
      this.emotionChart.setOption(option);
    },
    
    updateDiaryChart() {
      if (!this.diaryChart || this.diaryTrendData.dates.length === 0) return;
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.diaryTrendData.dates
        },
        yAxis: {
          type: 'value',
          name: '日记数量'
        },
        series: [
          {
            name: '日记提交',
            type: 'line',
            smooth: true,
            data: this.diaryTrendData.counts,
            itemStyle: {
              color: '#2ecc71'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(46, 204, 113, 0.5)' },
                { offset: 1, color: 'rgba(46, 204, 113, 0.1)' }
              ])
            }
          }
        ]
      };
      
      this.diaryChart.setOption(option);
    },

    // 根据情感ID获取颜色
    getMoodColor(moodId) {
      const moodColors = {
        1: '#FFD700', // 高兴 - 金色
        2: '#87CEEB', // 平静 - 天蓝色
        3: '#FF6347', // 兴奋 - 番茄红
        4: '#A9A9A9', // 疲惫 - 灰色
        5: '#4682B4'  // 低落 - 钢蓝色
      };
      return moodColors[moodId] || '#999';
    },
    
    // 根据情感ID获取标签类型
    getMoodTagType(moodId) {
      const moodTagTypes = {
        1: 'success', // 高兴
        2: '',        // 平静
        3: 'danger',  // 兴奋
        4: 'info',    // 疲惫
        5: 'warning'  // 低落
      };
      return moodTagTypes[moodId] || '';
    },
    
    // 根据情感ID获取名称
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

    handleResize() {
      if (this.emotionChart) {
        this.emotionChart.resize();
      }
      if (this.diaryChart) {
        this.diaryChart.resize();
      }
    },
    
    goToUserList() {
      this.$router.push('/manage/user/list');
    },
    
    goToDiaryList() {
      this.$router.push('/manage/diaryList');
    },
    
    viewUser(user) {
      this.$router.push(`/manage/user/detail/${user.id}`);
    },
    
    viewDiary(diary) {
      this.$router.push(`/manage/diary/detail/${diary.id}`);
    }
  },
  watch: {
    diaryChartRange() {
      this.loadDiaryTrendData().then(() => {
        this.updateDiaryChart();
      });
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  min-height: 100vh;
}

.dashboard-title {
  margin-bottom: 20px;
  color: #304156;
  font-size: 24px;
  font-weight: bold;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.15) !important;
}

.metric-content {
  display: flex;
  align-items: center;
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  transition: transform 0.3s ease;
}

.metric-card:hover .metric-icon {
  transform: scale(1.1);
}

.metric-icon i {
  font-size: 24px;
  color: white;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  color: #304156;
}

.metric-label {
  font-size: 14px;
  color: #909399;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.15) !important;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
}

.activity-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.activity-card {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.15) !important;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 0;
}

.tag-item {
  margin: 5px;
  transition: transform 0.2s ease;
}

.tag-item:hover {
  transform: scale(1.05);
}

.mood-tag {
  font-weight: bold;
  border: none !important;
  min-width: 60px;
  text-align: center;
}

.system-status {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.system-status:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.15) !important;
}

.system-header {
  font-weight: bold;
}

.status-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.status-label {
  width: 120px;
  font-size: 14px;
  color: #606266;
}

.status-value {
  flex: 1;
}

/* 加载动画样式 */
.loading-container {
  padding: 20px;
}

.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.skeleton-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  height: 90px;
}

.skeleton-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: #e4e7ed;
  margin-right: 15px;
  animation: pulse 1.5s infinite;
}

.skeleton-info {
  flex: 1;
}

.skeleton-value {
  height: 24px;
  width: 60px;
  background: #e4e7ed;
  margin-bottom: 8px;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-label {
  height: 14px;
  width: 100px;
  background: #e4e7ed;
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

.skeleton-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.skeleton-chart {
  height: 350px;
  background: #f5f7fa;
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-activities {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.skeleton-activity {
  height: 300px;
  background: #f5f7fa;
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-system {
  margin-bottom: 20px;
}

.skeleton-status {
  height: 100px;
  background: #f5f7fa;
  border-radius: 8px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 1200px) {
  .chart-row,
  .activity-row {
    grid-template-columns: 1fr;
  }
  
  .skeleton-charts,
  .skeleton-activities {
    grid-template-columns: 1fr;
  }
}

.dashboard-footer {
  text-align: center;
  padding: 10px;
  color: var(--footer-color);
  font-size: 0.9rem;
  background: var(--footer-bg);
  border-top: 1px solid var(--border-color);
  
  .light & {
    --footer-color: #666;
    --footer-bg: white;
    --border-color: #eee;
  }
  
  .dark & {
    --footer-color: #aaa;
    --footer-bg: #1a1a1a;
    --border-color: #333;
  }
}

</style>