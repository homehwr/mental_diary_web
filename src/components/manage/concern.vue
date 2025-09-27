<template>
  <div class="focus-students-container" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">重点学生关照</h1>
        <p class="page-subtitle">关注情绪状态不佳的学生，提供及时支持</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-refresh" @click="refreshData">刷新数据</el-button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <!-- <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <i class="el-icon-loading"></i>
        <p>数据加载中...</p>
      </div>
    </div> -->
    
    <!-- 当天情绪不佳学生 -->
    <el-card class="section-card" shadow="hover">
      <div slot="header" class="section-header">
        <div class="section-title">
          <i class="el-icon-warning" style="color: #e6a23c; margin-right: 10px;"></i>
          <span>当天情绪不佳学生</span>
          <el-tag type="warning" style="margin-left: 10px;">{{ todayConcern.length }} 人</el-tag>
        </div>
        <el-button type="text" @click="showTodayConcernHelp">查看说明</el-button>
      </div>
      
      <div v-if="todayConcern.length === 0" class="empty-state">
        <i class="el-icon-success" style="color: #67c23a; font-size: 48px;"></i>
        <p class="empty-text">今日无情绪不佳学生</p>
        <p class="empty-subtext">所有学生情绪状态良好</p>
      </div>
      
      <div v-else class="student-cards">
        <el-card 
          v-for="student in todayConcern" 
          :key="student.username" 
          class="student-card"
          :class="getConcernLevelClass(student.concern_level)"
        >
          <div class="student-header">
            <div class="student-info">
              <div class="student-name">{{ student.username }}</div>
              <div class="student-class">{{ student.class_name }}</div>
            </div>
            <div class="concern-level">
              <el-tag :type="getConcernLevelTag(student.concern_level)">
                关注级别: {{ student.concern_level }}
              </el-tag>
            </div>
          </div>
          
          <div class="student-metrics">
            <div class="metric-row">
              <div class="metric">
                <span class="metric-label">心情:</span>
                <el-tag :type="getMoodTagType(student.mood)">
                  {{ getMoodName(student.mood) }}
                </el-tag>
              </div>
              
              <div class="metric">
                <span class="metric-label">提交时间:</span>
                <span class="metric-value">{{ student.create_time }}</span>
              </div>
            </div>
            
            <div class="metric">
              <span class="metric-label">压力:</span>
              <div class="metric-bar">
                <el-progress 
                  :percentage="student.stress * 10" 
                  :color="getStressColor(student.stress)"
                  :show-text="false"
                ></el-progress>
                <span class="metric-value">{{ student.stress }}/10</span>
              </div>
            </div>
            
            <div class="metric">
              <span class="metric-label">精力:</span>
              <div class="metric-bar">
                <el-progress 
                  :percentage="student.energy * 10" 
                  :color="getEnergyColor(student.energy)"
                  :show-text="false"
                ></el-progress>
                <span class="metric-value">{{ student.energy }}/10</span>
              </div>
            </div>
            
            <div class="metric">
              <span class="metric-label">积极情绪:</span>
              <div class="metric-bar">
                <el-progress 
                  :percentage="student.positive * 10" 
                  :color="getPositiveColor(student.positive)"
                  :show-text="false"
                ></el-progress>
                <span class="metric-value">{{ student.positive }}/10</span>
              </div>
            </div>
          </div>
          
          <div class="student-footer">
            <!-- <el-button type="text" icon="el-icon-view" @click="viewDiary(student)">查看详情</el-button> -->
            <el-button type="text" icon="el-icon-chat-line-round" @click="contactStudent(student.username)">联系学生</el-button>
            <el-button type="text" icon="el-icon-notebook-2" @click="viewDiary(student)">查看日记</el-button>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 连续情绪不佳学生 -->
    <el-card class="section-card" shadow="hover">
      <div slot="header" class="section-header">
        <div class="section-title">
          <i class="el-icon-error" style="color: #f56c6c; margin-right: 10px;"></i>
          <span>连续情绪不佳学生</span>
          <el-tag type="danger" style="margin-left: 10px;">{{ continuousConcern.length }} 人</el-tag>
        </div>
        <el-button type="text" @click="showContinuousConcernHelp">查看说明</el-button>
      </div>
      
      <div v-if="continuousConcern.length === 0" class="empty-state">
        <i class="el-icon-success" style="color: #67c23a; font-size: 48px;"></i>
        <p class="empty-text">无连续情绪不佳学生</p>
        <p class="empty-subtext">所有学生情绪状态稳定</p>
      </div>
      
      <div v-else class="student-cards">
        <el-card 
          v-for="student in continuousConcern" 
          :key="student.username" 
          class="student-card continuous-card"
        >
          <div class="student-header">
            <div class="student-info">
              <div class="student-name">{{ student.username }}</div>
              <div class="student-class">{{ student.class_name }}</div>
            </div>
            <div class="continuous-days">
              <el-tag type="danger">
                连续 {{ student.continuous_days }} 天情绪不佳
              </el-tag>
            </div>
          </div>
          
          <div class="trend-chart">
            <div ref="trendChart" :id="'trend-chart-' + student.username" style="height: 150px;"></div>
          </div>
          
          <div class="student-footer">
            <el-button type="text" icon="el-icon-view" @click="viewDiary(student)">查看详情</el-button>
            <!-- <el-button type="text" icon="el-icon-user" @click="assignCounselor(student.username)">分配心理辅导员</el-button>
            <el-button type="text" icon="el-icon-bell" @click="setReminder(student.username)">设置提醒</el-button> -->
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 日记详情弹窗组件 -->
    <DiaryDetailDialog
      :visible="dialogVisible"
      :diary="detailDiary"
      :loading="detailLoading"
      @close="handleDialogClose"
    />
    
    <!-- 帮助对话框 -->
    <el-dialog
      title="关注说明"
      :visible.sync="helpDialogVisible"
      width="600px"
    >
      <div v-if="currentHelpType === 'today'">
        <h3>当天情绪不佳学生</h3>
        <p>此列表显示当天情绪状态不佳的学生，筛选标准包括：</p>
        <ul>
          <li>心情为疲惫或低落</li>
          <li>压力值 &gt; 7（0-10范围）</li>
          <li>精力值 &lt; 3（0-10范围）</li>
          <li>积极情绪 &lt; 3（0-10范围）</li>
        </ul>
        <p>关注级别根据情绪状态严重程度计算，级别越高表示需要更多关注。</p>
      </div>
      
      <div v-else>
        <h3>连续情绪不佳学生</h3>
        <p>此列表显示连续3天及以上情绪状态不佳的学生。</p>
        <p>连续情绪不佳可能表明学生面临持续的压力或困难，需要特别关注和支持。</p>
        <p>建议措施：</p>
        <ul>
          <li>安排心理辅导员进行一对一沟通</li>
          <li>联系家长了解情况</li>
          <li>提供额外的心理支持资源</li>
          <li>定期跟进学生情绪状态</li>
        </ul>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="helpDialogVisible = false">我知道了</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import DiaryDetailDialog from './diaryDetailDialog.vue';

export default {
  name: 'FocusStudents',
  components: {
    DiaryDetailDialog
  },
  data() {
    return {
      loading: false,
      todayConcern: [],
      continuousConcern: [],
      helpDialogVisible: false,
      currentHelpType: 'today',
      trendCharts: {},
      dialogVisible: false,
      detailLoading: false,
      detailDiary: {} // dialog对话框中的详细日记数据
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        // 并行加载数据
        const [todayRes, continuousRes] = await Promise.all([
          this.$axios.get('/diary/todayConcern'),
          this.$axios.get('/diary/continuousConcern')
        ]);
        console.log(todayRes, continuousRes)
        if (todayRes.data.success) {
          this.todayConcern = todayRes.data.students;
        } else {
            console.log('获取当天情绪不佳学生失败: ' + todayRes.data.message);
          this.$message.error('获取当天情绪不佳学生失败: ' + todayRes.data.message);
        }
        
        if (continuousRes.data.success) {
          this.continuousConcern = continuousRes.data.students;
          // 渲染趋势图
          this.$nextTick(() => {
            this.renderTrendCharts();
          });
        } else {
            console.log('获取连续情绪不佳学生失败: ' + continuousRes.data.message);
          this.$message.error('获取连续情绪不佳学生失败: ' + continuousRes.data.message);
        }
      } catch (error) {
        this.$message.error('数据加载失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    refreshData() {
      // 清除缓存并重新加载
      this.$axios.delete('/api/concern/clear-cache').then(() => {
        this.loadData();
        this.$message.success('数据已刷新');
      }).catch(error => {
        this.$message.error('刷新失败: ' + error.message);
      });
    },
    // 查看日记详情
    viewDiary(diary) {
      this.detailLoading = true;
      this.dialogVisible = true;
      
      this.$axios.get(`/diary/getById?id=${diary.id}&recommend=false`).then(res => {
        this.detailDiary = res.data[0] || {};
        this.detailDiary.username = diary.username;
        this.detailDiary.real_class = diary.real_class;
        this.detailDiary.account = diary.account;
        this.detailLoading = false;
      }).catch(error => {
        console.error("获取日记详情失败:", error);
        this.detailLoading = false;
        this.$message.error("获取日记详情失败！");
      });
    },
    
    // 关闭弹窗时的处理
    handleDialogClose() {
      this.dialogVisible = false;
      this.detailDiary = {};
    },
    
    renderTrendCharts() {
      // 为每个连续情绪不佳学生渲染趋势图
      this.continuousConcern.forEach(student => {
        const chartId = 'trend-chart-' + student.username;
        const chartDom = document.getElementById(chartId);
        
        if (chartDom) {
          const chart = echarts.init(chartDom);
          
          // 模拟趋势数据（实际应用中应从API获取）
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
              data: ['1天前', '2天前', '3天前', '4天前', '5天前', '6天前', '今天'],
              axisLine: {
                lineStyle: {
                  color: '#DCDFE6'
                }
              }
            },
            yAxis: {
              type: 'value',
              min: 0,
              max: 100,
              axisLine: {
                lineStyle: {
                  color: '#DCDFE6'
                }
              },
              splitLine: {
                lineStyle: {
                  color: '#EBEEF5'
                }
              }
            },
            series: [
              {
                name: '情绪状态',
                type: 'line',
                smooth: true,
                data: [65, 72, 80, 75, 85, 90, 95],
                itemStyle: {
                  color: '#f56c6c'
                },
                lineStyle: {
                  width: 3
                },
                areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(245, 108, 108, 0.5)' },
                    { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
                  ])
                }
              }
            ]
          };
          
          chart.setOption(option);
          this.trendCharts[student.username] = chart;
        }
      });
    },
    
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
    
    getConcernLevelTag(level) {
      if (level >= 80) return 'danger';
      if (level >= 60) return 'warning';
      return 'info';
    },
    
    getConcernLevelClass(level) {
      if (level >= 80) return 'high-concern';
      if (level >= 60) return 'medium-concern';
      return 'low-concern';
    },
    
    getStressColor(stress) {
      if (stress > 7) return '#f56c6c'; // 高压力 - 红色
      if (stress > 5) return '#e6a23c'; // 中压力 - 黄色
      return '#67c23a'; // 低压力 - 绿色
    },
    
    getEnergyColor(energy) {
      if (energy < 3) return '#f56c6c'; // 低精力 - 红色
      if (energy < 5) return '#e6a23c'; // 中精力 - 黄色
      return '#67c23a'; // 高精力 - 绿色
    },
    
    getPositiveColor(positive) {
      if (positive < 3) return '#f56c6c'; // 低积极情绪 - 红色
      if (positive < 5) return '#e6a23c'; // 中积极情绪 - 黄色
      return '#67c23a'; // 高积极情绪 - 绿色
    },
    
    showTodayConcernHelp() {
      this.currentHelpType = 'today';
      this.helpDialogVisible = true;
    },
    
    showContinuousConcernHelp() {
      this.currentHelpType = 'continuous';
      this.helpDialogVisible = true;
    },
    
    viewStudent(username) {
      this.$router.push(`/student/detail/${username}`);
    },
    
    contactStudent(username) {
      this.$message.info(`联系学生: ${username}`);
    },
    
    assignCounselor(username) {
      this.$prompt('请输入辅导员姓名', '分配心理辅导员', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{2,20}$/,
        inputErrorMessage: '姓名长度应为2-20个字符'
      }).then(({ value }) => {
        this.$message.success(`已为 ${username} 分配辅导员: ${value}`);
      }).catch(() => {
        // 取消操作
      });
    },
    
    setReminder(username) {
      this.$prompt('请输入提醒内容', '设置提醒', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{5,100}$/,
        inputErrorMessage: '提醒内容长度应为5-100个字符'
      }).then(({ value }) => {
        this.$message.success(`已为 ${username} 设置提醒: ${value}`);
      }).catch(() => {
        // 取消操作
      });
    }
  }
};
</script>

<style scoped>
.focus-students-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #304156;
  margin-bottom: 5px;
}

.page-subtitle {
  font-size: 16px;
  color: #909399;
}

.section-card {
  border-radius: 10px;
  margin-bottom: 30px;
  transition: transform 0.3s;
}

.section-card:hover {
  transform: translateY(-5px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #304156;
}

.student-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.student-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.student-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}

.student-card.high-concern {
  border-top: 4px solid #f56c6c;
}

.student-card.medium-concern {
  border-top: 4px solid #e6a23c;
}

.student-card.low-concern {
  border-top: 4px solid #409eff;
}

.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 16px;
  font-weight: bold;
  color: #304156;
}

.student-class {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.concern-level {
  margin-left: 10px;
}

.continuous-days {
  margin-left: 10px;
}

.student-metrics {
  margin-bottom: 15px;
}

.metric-row {
  display: flex;
  margin-bottom: 10px;
}

.metric {
  margin-bottom: 10px;
}

.metric-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 14px;
  color: #909399;
  margin-left: 10px;
}

.metric-bar {
  display: flex;
  align-items: center;
}

.metric-bar .el-progress {
  flex: 1;
}

.metric-bar .metric-value {
  width: 60px;
  text-align: right;
}

.student-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.student-footer .el-button {
  margin-left: 10px;
}

.trend-chart {
  height: 150px;
  margin: 15px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.empty-text {
  font-size: 16px;
  color: #606266;
  margin: 15px 0;
}

.empty-subtext {
  font-size: 14px;
  color: #909399;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
}

.loading-content i {
  font-size: 48px;
  color: #409eff;
  animation: spin 2s linear infinite;
}

.loading-content p {
  margin-top: 15px;
  font-size: 16px;
  color: #606266;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .student-cards {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>