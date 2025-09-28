<template>
  <div class="analytics-container">
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
        <div v-for="n in 4" :key="n" class="skeleton-chart"></div>
      </div>
      
      <div class="skeleton-wordcloud">
        <div class="skeleton-wordcloud-item"></div>
      </div>
    </div>
    
    <div v-else>
      <h2 class="analytics-title">日记数据分析</h2>
      
      <!-- 关键指标卡片 -->
      <div class="metric-cards">
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
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
            <div class="metric-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="el-icon-chat-dot-round"></i>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ statsData.avg_words.avg_length.toFixed(4) }}</div>
              <div class="metric-label">平均字数</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="el-icon-data-analysis"></i>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ statsData.positive_rate }}%</div>
              <div class="metric-label">积极情感比例</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="metric-card" shadow="hover">
          <div class="metric-content">
            <div class="metric-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <i class="el-icon-trophy"></i>
            </div>
            <div class="metric-info">
              <div class="metric-value" style="font-size: 18px;">{{ statsData.top_author }}</div>
              <div class="metric-label">最活跃班级</div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 数据图表区域 -->
      <div class="chart-row">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span>日记情感分布</span>
            <el-tooltip content="基于所有日记的情感状态分析" placement="top">
              <i class="el-icon-info" style="color: #909399; margin-left: 5px;"></i>
            </el-tooltip>
          </div>
          <div class="chart-container">
            <div ref="emotionChart" style="height: 300px;" v-if="!loading"></div>
          </div>
        </el-card>
        
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span>日记提交时间分布</span>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              size="mini"
              style="width: 140px; margin-left: 10px;"
              @change="updateTimeChart"
            ></el-date-picker>
          </div>
          <div class="chart-container">
            <div ref="timeChart" style="height: 300px;" v-if="!loading"></div>
          </div>
        </el-card>
      </div>
      
      <!-- 词云和情感趋势 -->
      <div class="chart-row">
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span>热门关键词词云</span>
            <el-tooltip content="词云大小表示关键词出现频率" placement="top">
              <i class="el-icon-info" style="color: #909399; margin-left: 5px;"></i>
            </el-tooltip>
          </div>
          <div class="chart-container">
            <div ref="wordCloud" style="height: 350px;" v-if="!loading"></div>
          </div>
        </el-card>
        
        <el-card class="chart-card" shadow="hover">
          <div slot="header" class="chart-header">
            <span>情感趋势分析</span>
            <el-select v-model="trendRange" size="mini" style="width: 100px;" @change="updateTrendChart">
              <el-option label="最近7天" value="7"></el-option>
              <el-option label="最近30天" value="30"></el-option>
            </el-select>
          </div>
          <div class="chart-container">
            <div ref="trendChart" style="height: 350px;" v-if="!loading"></div>
          </div>
        </el-card>
      </div>
      
      <!-- 词云和情感分析 -->
      <div class="activity-row">
        <el-card class="activity-card" shadow="hover">
          <div slot="header" class="activity-header">
            <span>班级日记活跃度</span>
          </div>
          <div class="chart-container">
            <div ref="classChart" style="height: 300px;" v-if="!loading"></div>
          </div>
        </el-card>
        
        <el-card class="activity-card" shadow="hover">
          <div slot="header" class="activity-header">
            <span>情感关键词关联</span>
            <el-tooltip content="展示不同情感下的高频词汇" placement="top">
              <i class="el-icon-info" style="color: #909399; margin-left: 5px;"></i>
            </el-tooltip>
          </div>
          <div class="chart-container">
            <div ref="relationChart" style="height: 300px;" v-if="!loading"></div>
          </div>
        </el-card>
      </div>
    </div>
    <div class="analytics-footer">
        <p style="margin-bottom: 5px;">© 2025 赣南师范大学物理与电子信息学院 | 格致心灵日记后台管理系统数据分析</p>
        <span style="padding: 0 auto; font-size: xx-small; color: #666;">制作：物理学（公费师范）2201班 黄文瑞</span>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import 'echarts-wordcloud';

// 数据缓存
const dataCache = {
  statsData: null,
  moodDistribution: null,
  popularTags: null,
  cacheTime: 0,
  CACHE_DURATION: 5 * 60 * 1000 // 5分钟缓存
};

export default {
  name: 'Analytics',
  data() {
    return {
      loading: true,
      statsData: {
        diary_count: 0,
        avg_words: 0,
        positive_rate: 0,
        top_author: ''
      },
      timeRange: 'all',
      trendRange: '7',
      selectedDate: new Date().toISOString().split('T')[0], // 默认今天
      moodDistribution: [],
      popularTags: [],
      timeDistributionData: [], // 时间分布数据
      emotionTrendData: { // 情感趋势数据
        dates: [],
        positive_counts: [],
        negative_counts: []
      },
      emotionChart: null,
      timeChart: null,
      wordCloud: null,
      trendChart: null,
      classChart: null,
      relationChart: null,
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
    if (this.timeChart) {
      this.timeChart.dispose();
    }
    if (this.wordCloud) {
      this.wordCloud.dispose();
    }
    if (this.trendChart) {
      this.trendChart.dispose();
    }
    if (this.classChart) {
      this.classChart.dispose();
    }
    if (this.relationChart) {
      this.relationChart.dispose();
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
      
      if (this.$refs.timeChart) {
        this.timeChart = echarts.init(this.$refs.timeChart);
      }
      
      if (this.$refs.wordCloud) {
        this.wordCloud = echarts.init(this.$refs.wordCloud);
      }
      
      if (this.$refs.trendChart) {
        this.trendChart = echarts.init(this.$refs.trendChart);
      }
      
      if (this.$refs.classChart) {
        this.classChart = echarts.init(this.$refs.classChart);
      }
      
      if (this.$refs.relationChart) {
        this.relationChart = echarts.init(this.$refs.relationChart);
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
          this.classActivityData = dataCache.classActivityData;
          this.timeDistributionData = dataCache.timeDistributionData;
          this.emotionTrendData = dataCache.emotionTrendData;
        } else {
          // 并发请求数据
          const [statsRes, moodRes, tagsRes, classRes, timeRes, trendRes] = await Promise.all([
            this.$axios.get('/stats/stats'),
            this.$axios.get('/stats/mood-distribution'),
            this.$axios.get('/stats/word-cloud'),
            this.$axios.get('/stats/class-activity'),
            this.$axios.get(`/stats/diary-time-distribution?date=${this.selectedDate}`),
            this.$axios.get(`/stats/emotion-trend?range_days=${this.trendRange}`)
          ]);
          
          if (statsRes.data.success) {
            this.statsData = {
              ...statsRes.data,
              positive_rate: 0, // 初始化为0，后面计算
              top_author: '' // 初始化为空，后面计算
            };
            dataCache.statsData = this.statsData;
          }
          
          if (moodRes.data.success) {
            this.moodDistribution = moodRes.data.mood_counts;
            dataCache.moodDistribution = moodRes.data.mood_counts;
          }
          
          if (tagsRes.data.success) {
            this.popularTags = tagsRes.data.tags;
            dataCache.popularTags = tagsRes.data.tags;
          }
          
          // 处理班级活跃度数据
          if (classRes.data.success) {
            this.classActivityData = classRes.data.classes.reverse();
            dataCache.classActivityData = classRes.data.classes;
          } else {
            // 如果接口失败，使用模拟数据
            this.classActivityData = this.getDefaultClassData();
          }
          
          // 处理时间分布数据
          if (timeRes.data.success) {
            this.timeDistributionData = timeRes.data.hourly_counts;
            dataCache.timeDistributionData = timeRes.data.hourly_counts;
          } else {
            this.$message.error('时间分布数据加载失败');
          }
          
          // 处理情感趋势数据
          if (trendRes.data.success) {
            this.emotionTrendData = {
              dates: trendRes.data.dates,
              positive_counts: trendRes.data.positive_counts,
              negative_counts: trendRes.data.negative_counts
            };
            dataCache.emotionTrendData = this.emotionTrendData;
          } else {
            this.$message.error('情感趋势数据加载失败');
          }
          
          // 更新缓存时间
          dataCache.cacheTime = Date.now();
          
          // 计算积极情绪比例
          if (this.moodDistribution.length > 0 && this.statsData.diary_count > 0) {
            const positiveMood = this.moodDistribution
              .filter(item => [1, 3].includes(item.mood_id))
              .reduce((sum, item) => sum + item.count, 0);
            
            this.statsData.positive_rate = parseFloat(
              (positiveMood / this.statsData.diary_count * 100).toFixed(1)
            );
          }
          
          // 获取最活跃班级
          if (this.classActivityData && this.classActivityData.length > 0) {
            const topClass = this.classActivityData.reduce((prev, current) => 
              (prev.diary_count > current.diary_count) ? prev : current
            );
            this.statsData.top_author = topClass.class_name;
          }
        }
        
      } catch (error) {
        console.error('数据加载失败:', error);
        this.$message.error('数据加载失败: ' + error.message);
      } finally {
        this.loading = false;
        // 等待DOM更新后初始化图表
        this.$nextTick(() => {
          this.initCharts();
          this.updateEmotionChart();
          this.updateTimeChart();
          this.updateWordCloud();
          this.updateTrendChart();
          this.updateClassChart();
          this.updateRelationChart();
        });
      }
    },
    
    // 获取默认班级数据（模拟数据）
    getDefaultClassData() {
      return [
        { class_name: "物理学2201", diary_count: 156 },
        { class_name: "物理学2202", diary_count: 142 },
        { class_name: "电子信息2201", diary_count: 125 },
        { class_name: "电子信息2202", diary_count: 118 },
        { class_name: "通信工程2201", diary_count: 98 },
        { class_name: "通信工程2202", diary_count: 87 }
      ];
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
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
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
    
    // 更新日记提交时间分布图表
    async updateTimeChart() {
      if (!this.timeChart) return;
      
      try {
        // 请求指定日期的时间分布数据
        const response = await this.$axios.get(`/stats/diary-time-distribution?date=${this.selectedDate}`);
        
        if (response.data.success) {
          this.timeDistributionData = response.data.hourly_counts;
          
          const option = {
            tooltip: {
              trigger: 'axis',
              formatter: '时间: {b}<br/>日记数量: {c}'
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: Array.from({length: 24}, (_, i) => `${i}点`),
              axisLine: {
                lineStyle: {
                  color: '#999'
                }
              }
            },
            yAxis: {
              type: 'value',
              name: '日记数量',
              axisLine: {
                lineStyle: {
                  color: '#999'
                }
              }
            },
            series: [
              {
                name: '日记提交',
                type: 'bar',
                barWidth: '60%',
                data: this.timeDistributionData,
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' }
                  ])
                },
                emphasis: {
                  itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: '#2378f7' },
                      { offset: 0.7, color: '#2378f7' },
                      { offset: 1, color: '#83bff6' }
                    ])
                  }
                }
              }
            ]
          };
          
          this.timeChart.setOption(option);
        } else {
          this.$message.error('时间分布数据加载失败: ' + response.data.message);
        }
      } catch (error) {
        console.error('时间分布数据请求失败:', error);
        this.$message.error('时间分布数据请求失败');
      }
    },
    
    updateWordCloud() {
      if (!this.wordCloud || this.popularTags.length === 0) return;
      
      const option = {
        tooltip: {
          show: true
        },
        series: [{
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '120%',
          height: '120%',
          right: null,
          bottom: null,
          sizeRange: [15, 85],
          rotationRange: [-90, 90],
          rotationStep: 45,
          gridSize: 8,
          drawOutOfBound: false,
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: function () {
              return 'rgb(' + [
                Math.round(Math.random() * 160 + 40),
                Math.round(Math.random() * 160 + 40),
                Math.round(Math.random() * 160 + 40)
              ].join(',') + ')';
            }
          },
          emphasis: {
            focus: 'self',
            textStyle: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          data: this.popularTags.map(tag => ({
            name: tag.name,
            value: tag.count
          }))
        }]
      };
      
      this.wordCloud.setOption(option);
    },
    
    // 更新情感趋势图表
    async updateTrendChart() {
      if (!this.trendChart) return;
      
      try {
        // 请求情感趋势数据
        const response = await this.$axios.get(`/stats/emotion-trend?range_days=${this.trendRange}`);
        
        if (response.data.success) {
          this.emotionTrendData = {
            dates: response.data.dates,
            positive_counts: response.data.positive_counts,
            negative_counts: response.data.negative_counts
          };
          
          const option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                label: {
                  backgroundColor: '#6a7985'
                }
              }
            },
            legend: {
              data: ['积极情感', '消极情感'],
              right: 10,
              top: 10
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: [
              {
                type: 'category',
                boundaryGap: false,
                data: this.emotionTrendData.dates
              }
            ],
            yAxis: [
              {
                type: 'value',
                name: '日记数量'
              }
            ],
            series: [
              {
                name: '积极情感',
                type: 'line',
                // stack: '总量',
                smooth: true,
                lineStyle: {
                  width: 3,
                  color: '#36a3f7'
                },
                showSymbol: false,
                areaStyle: {
                  opacity: 0.8,
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(54, 163, 247, 0.5)' },
                    { offset: 1, color: 'rgba(54, 163, 247, 0.1)' }
                  ])
                },
                emphasis: {
                  focus: 'series'
                },
                data: this.emotionTrendData.positive_counts
              },
              {
                name: '消极情感',
                type: 'line',
                // stack: '总量',
                smooth: true,
                lineStyle: {
                  width: 3,
                  color: '#ff4d4f'
                },
                showSymbol: false,
                areaStyle: {
                  opacity: 0.8,
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(255, 77, 79, 0.5)' },
                    { offset: 1, color: 'rgba(255, 77, 79, 0.1)' }
                  ])
                },
                emphasis: {
                  focus: 'series'
                },
                data: this.emotionTrendData.negative_counts
              }
            ]
          };
          
          this.trendChart.setOption(option);
        } else {
          this.$message.error('情感趋势数据加载失败: ' + response.data.message);
        }
      } catch (error) {
        console.error('情感趋势数据请求失败:', error);
        this.$message.error('情感趋势数据请求失败');
      }
    },
    
    updateClassChart() {
      if (!this.classChart || !this.classActivityData || this.classActivityData.length === 0) return;
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}: {c}篇日记'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01],
          name: '日记数量',
          nameLocation: 'end',
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          }
        },
        yAxis: {
          type: 'category',
          data: this.classActivityData.map(item => item.class_name),
          axisLine: {
            lineStyle: {
              color: '#999'
            }
          }
        },
        series: [
          {
            name: '日记数量',
            type: 'bar',
            data: this.classActivityData.map(item => item.diary_count),
            itemStyle: {
              color: (params) => {
                const colorList = [
                  '#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae',
                  '#749f83', '#ca8622', '#bda29a','#6e7074', '#546570'
                ];
                return colorList[params.dataIndex % colorList.length];
              }
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{c}篇'
            }
          }
        ]
      };
      
      this.classChart.setOption(option);
    },
    
    updateRelationChart() {
      if (!this.relationChart) return;
      
      // 模拟情感关键词关联数据
      const option = {
        tooltip: {},
        legend: {
          data: ['高兴', '平静', '兴奋', '疲惫', '低落']
        },
        series: [
          {
            type: 'graph',
            layout: 'force',
            symbolSize: 50,
            focusNodeAdjacency: true,
            roam: true,
            label: {
              show: true,
              position: 'right'
            },
            force: {
              repulsion: 100
            },
            data: [
              {name: '高兴', category: 0, symbolSize: 60},
              {name: '平静', category: 1, symbolSize: 50},
              {name: '兴奋', category: 2, symbolSize: 40},
              {name: '疲惫', category: 3, symbolSize: 35},
              {name: '低落', category: 4, symbolSize: 30},
              {name: '成功', category: 0, symbolSize: 25},
              {name: '快乐', category: 0, symbolSize: 25},
              {name: '放松', category: 1, symbolSize: 20},
              {name: '安静', category: 1, symbolSize: 20},
              {name: '激动', category: 2, symbolSize: 20},
              {name: '期待', category: 2, symbolSize: 20},
              {name: '困倦', category: 3, symbolSize: 20},
              {name: '压力', category: 3, symbolSize: 20},
              {name: '难过', category: 4, symbolSize: 20},
              {name: '失望', category: 4, symbolSize: 20}
            ],
            links: [
              {source: '高兴', target: '成功'},
              {source: '高兴', target: '快乐'},
              {source: '平静', target: '放松'},
              {source: '平静', target: '安静'},
              {source: '兴奋', target: '激动'},
              {source: '兴奋', target: '期待'},
              {source: '疲惫', target: '困倦'},
              {source: '疲惫', target: '压力'},
              {source: '低落', target: '难过'},
              {source: '低落', target: '失望'}
            ],
            categories: [
              {name: '高兴', itemStyle: {color: '#FFD700'}},
              {name: '平静', itemStyle: {color: '#87CEEB'}},
              {name: '兴奋', itemStyle: {color: '#FF6347'}},
              {name: '疲惫', itemStyle: {color: '#A9A9A9'}},
              {name: '低落', itemStyle: {color: '#4682B4'}}
            ],
            lineStyle: {
              color: 'source',
              curveness: 0.3
            }
          }
        ]
      };
      
      this.relationChart.setOption(option);
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
    
    handleResize() {
      if (this.emotionChart) {
        this.emotionChart.resize();
      }
      if (this.timeChart) {
        this.timeChart.resize();
      }
      if (this.wordCloud) {
        this.wordCloud.resize();
      }
      if (this.trendChart) {
        this.trendChart.resize();
      }
      if (this.classChart) {
        this.classChart.resize();
      }
      if (this.relationChart) {
        this.relationChart.resize();
      }
    }
  },
  watch: {
    timeRange() {
      this.updateTimeChart();
    },
    trendRange() {
      this.updateTrendChart();
    }
  }
};
</script>

<style scoped>
.analytics-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.analytics-title {
  margin-bottom: 20px;
  color: #304156;
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.metric-card {
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.metric-content {
  display: flex;
  align-items: center;
  padding: 15px;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.metric-card:hover .metric-icon {
  transform: scale(1.1) rotate(5deg);
}

.metric-icon i {
  font-size: 28px;
  color: white;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #304156;
  margin-bottom: 5px;
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
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #304156;
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
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: none;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #304156;
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
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  height: 90px;
  backdrop-filter: blur(10px);
}

.skeleton-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: #e4e7ed;
  margin-right: 15px;
  animation: pulse 1.5s infinite;
}

.skeleton-info {
  flex: 1;
}

.skeleton-value {
  height: 28px;
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
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  animation: pulse 1.5s infinite;
  backdrop-filter: blur(10px);
}

.skeleton-wordcloud {
  margin-bottom: 20px;
}

.skeleton-wordcloud-item {
  height: 400px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  animation: pulse 1.5s infinite;
  backdrop-filter: blur(10px);
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
  
  .skeleton-charts {
    grid-template-columns: 1fr;
  }
}

.analytics-footer {
  text-align: center;
  padding: 15px;
  color: #666;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  margin-top: 20px;
  backdrop-filter: blur(10px);
}

</style>