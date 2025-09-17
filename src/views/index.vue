<template>
  <div class="home-page">
    <!-- 顶部学院信息栏 -->
    <div class="university-header">
      <div class="header-background">
        <div class="logo-container">
          <img src="@/assets/wdxy.jpg" alt="物电学院Logo" class="university-logo">
        </div>
        <div class="header-content">
          <div class="app-info">
            <h1 class="app-name">格致心灵日记</h1>
            <p class="app-subtitle">记录成长每一刻</p>
          </div>
          <div>
            <div class="current-time">
              <div class="time">{{ currentTime }}</div>
              <div class="date">{{ currentDate }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 登录状态栏 -->
    <div class="login-status-bar">
      <div class="user-info" v-if="isLoggedIn" @click="viewUserInfo">
        <van-image
          round
          width="50px"
          height="50px"
          :src="$store.state.User.head_img || defaultAvatar"
        />
        <div class="user-details">
          <h3>{{ $store.state.User.username }}</h3>
          <p>{{ $store.state.User.real_class }}</p>
        </div>
        <van-button size="small" plain @click="logout">退出</van-button>
      </div>
      <div class="login-prompt" v-else>
        <p>登录以记录和查看您的心灵成长历程</p>
        <van-button type="primary" size="small" @click="goToLogin">立即登录</van-button>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 登录后的内容 -->
             
      <!-- 平台数据卡片 -->
      <div class="stats-card">
        <h3><van-icon name="bar-chart-o" color="#3498db" /> 平台数据概览</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ visitCount }}</div>
            <div class="stat-label">点击量</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userCount }}</div>
            <div class="stat-label">用户数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ diaryCount }}</div>
            <div class="stat-label">总日记数</div>
          </div>
        </div>
      </div>

      <template v-if="isLoggedIn">
        <!-- 情绪状态卡片 -->
        <div class="mood-card">
          <div class="card-header">
            <h3><van-icon name="smile-comment-o" color="#3498db" /> 今日情绪状态</h3>
            <div class="mood-tag" :style="moodTagStyle" v-if="hasTodayMood">
              {{ todayMood.level }}
            </div>
            <van-tag v-else type="warning" plain>未记录</van-tag>
          </div>
          
          <div class="mood-container" v-if="hasTodayMood">
            <div class="mood-visual">
              <div class="mood-icon" :style="{ backgroundColor: moodIconBg }">
                <van-icon :name="todayMood.icon" :size="50" :color="todayMood.color" />
              </div>
              <div class="mood-description">
                <p class="mood-level">{{ todayMood.level }}</p>
                <p class="mood-desc">{{ todayMood.desc }}</p>
              </div>
            </div>
            
            <div class="mood-details">
              <div class="detail-item">
                <div class="detail-header">
                  <span class="label">压力指数</span>
                  <span class="value">{{ todayMood.stress }}/10</span>
                </div>
                <van-progress 
                  :percentage="todayMood.stress * 10" 
                  stroke-width="8" 
                  color="#e74c3c"
                  track-color="#ebedf0"
                />
              </div>
              <div class="detail-item">
                <div class="detail-header">
                  <span class="label">积极情绪</span>
                  <span class="value">{{ todayMood.positive }}/10</span>
                </div>
                <van-progress 
                  :percentage="todayMood.positive * 10" 
                  stroke-width="8" 
                  color="#2ecc71"
                  track-color="#ebedf0"
                />
              </div>
              <div class="detail-item">
                <div class="detail-header">
                  <span class="label">精力水平</span>
                  <span class="value">{{ todayMood.energy }}/10</span>
                </div>
                <van-progress 
                  :percentage="todayMood.energy * 10" 
                  stroke-width="8" 
                  color="#f39c12"
                  track-color="#ebedf0"
                />
              </div>
            </div>
          </div>
          
          <div class="empty-mood" v-else>
            <van-icon name="smile-comment-o" size="48px" color="#ebedf0" />
            <p class="empty-text">今日尚未记录心情</p>
            <van-button 
              size="small" 
              type="primary" 
              @click="startNewRecord"
              class="empty-button"
            >
              立即记录
            </van-button>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div class="loading-overlay" v-if="loading">
          <van-loading size="24px" color="#3498db" vertical>加载中...</van-loading>
        </div>
        
        <!-- 日历卡片 -->
        <div class="calendar-card">
          <div class="card-header">
            <h3><van-icon name="calendar-o" color="#3498db" /> 本月日历</h3>
            <van-button size="mini" plain type="primary" @click="viewCalendar">查看全部</van-button>
          </div>
          
          <div class="mini-calendar">
            <div class="calendar-header">
              <!-- <van-icon name="arrow-left" @click="prevMonth" /> -->
              <span>{{ calendarTitle }}</span>
              <!-- <van-icon name="arrow" @click="nextMonth" /> -->
            </div>
            
            <div class="calendar-grid">
              <div class="calendar-row days-row">
                <div class="calendar-cell" v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">
                  {{ day }}
                </div>
              </div>
              
              <div class="calendar-row" v-for="(week, index) in calendarWeeks" :key="index">
                <div 
                  class="calendar-cell" 
                  v-for="(day, dayIndex) in week" 
                  :key="dayIndex"
                  :class="{
                    'today': day.isToday,
                    // 'has-record': day.hasRecord,
                    'current-month': day.inCurrentMonth
                  }"
                >
                  {{ day.date }}
                  <!-- <div v-if="day.hasRecord" class="record-indicator"></div> -->
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 快速操作卡片 -->
        <div class="action-card">
          <van-grid :border="false" :column-num="4">
            <van-grid-item @click="startNewRecord">
              <div class="action-icon write">
                <van-icon name="edit" size="24px" />
              </div>
              <span class="action-text">写日记</span>
            </van-grid-item>
            <van-grid-item @click="viewCalendar">
              <div class="action-icon records">
                <van-icon name="notes-o" size="24px" />
              </div>
              <span class="action-text">看记录</span>
            </van-grid-item>
            <van-grid-item @click="viewReport">
              <div class="action-icon report">
                <van-icon name="chart-trending-o" size="24px" />
              </div>
              <span class="action-text">报告</span>
            </van-grid-item>
            <van-grid-item @click="viewXM">
              <div class="action-icon calendar">
                <!-- <van-icon name="calendar-o" size="24px" /> -->
                 <img src="@/assets/小沐.png" alt="" style="height: 70%; object-fit: contain; border-radius: 50%;">
              </div>
              <span class="action-text">智能小沐</span>
            </van-grid-item>
          </van-grid>
        </div>
        
        <!-- 最近记录卡片 -->
        <div class="recent-card">
          <div class="card-header">
            <h3><van-icon name="notes-o" color="#3498db" /> 最近记录</h3>
            <van-button size="mini" plain type="primary" @click="viewCalendar">查看全部</van-button>
          </div>
          
          <div class="record-list" v-if="recentRecords.length > 0">
            <div 
              v-for="(record, index) in recentRecords" 
              :key="index" 
              class="record-item"
              @click="viewRecord(record.id)"
            >
              <div class="record-main">
                <div class="record-date">
                  <span class="day">{{ record.day }}</span>
                  <span class="month">{{ record.month }}</span>
                </div>
                <div class="record-content">
                  <h4 class="record-title">{{ record.experiment || getDefaultTitle(record.mood.moodContent) }}</h4>
                  <p class="record-desc">{{ record.desc }}</p>
                </div>
              </div>
              <div class="record-mood">
                <van-icon :name="record.mood.icon" :color="record.mood.color" size="20px" />
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div class="empty-state" v-else>
            <van-icon name="notes-o" size="48px" color="#ebedf0" />
            <p class="empty-text">暂无记录</p>
            <van-button 
              size="small" 
              type="primary" 
              plain 
              @click="startNewRecord"
              class="empty-button"
            >
              开始记录
            </van-button>
          </div>
        </div>
        
        <!-- 励志语录 -->
        <div class="quote-card">
          <van-icon name="flower-o" color="#3498db" size="24px" />
          <p class="quote-text">{{ dailyQuote.text }}</p>
          <p class="quote-author">— {{ dailyQuote.author }}</p>
        </div>
      </template>
      
      <!-- 未登录时的引导内容 -->
      <div class="login-guide" v-else>
        <div class="guide-card">
          <div class="guide-header">
            <van-icon name="smile-comment-o" size="35px" color="#3498db" />
            <h3 style="margin-top: 5px;"> &nbsp; 欢迎使用格致心灵日记</h3>
          </div>
          <div class="guide-content" style="margin-top: 10px;">
            <p>记录每日心情，追踪心理成长</p>
            <p>分析情绪变化，获得专业建议</p>
            <p>与物理实验结合，探索心灵奥秘</p>
          </div>
          <div class="guide-features">
            <div class="feature-item">
              <van-icon name="completed" color="#2ecc71" />
              <span>每日心情记录</span>
            </div>
            <div class="feature-item">
              <van-icon name="chart-trending-o" color="#3498db" />
              <span>情绪趋势分析</span>
            </div>
            <div class="feature-item">
              <van-icon name="flower-o" color="#9b59b6" />
              <span>心理成长报告</span>
            </div>
          </div>
        </div>
        
        <div class="benefits-card">
          <h3><van-icon name="gift-o" color="#e74c3c" /> 登录后您可以：</h3>
          <ul class="benefits-list" style="margin-top: 10px;">
            <li>记录每日心情和实验感悟</li>
            <li>查看情绪变化趋势图表</li>
            <li>生成个性化心理成长报告</li>
            <li>保存和回顾历史记录</li>
            <li>获得专业心理建议</li>
          </ul>
        </div>
        
      </div>

      <!-- 制作人信息 -->
      <div class="creator-info">
        <p>格致心灵日记 v1.0.1</p>
        <p>© 2025 赣南师范大学物理与电子信息学院</p>
        <p>设计开发: 物公2201黄文瑞</p>
      </div>
    </div>
    
    <!-- 底部按钮 -->
    <div class="action-button-container" v-if="!loading">
      <van-button 
        v-if="isLoggedIn"
        round 
        type="primary" 
        size="large" 
        icon="edit" 
        @click="startNewRecord"
        class="action-button"
        :disabled="hasTodayMood"
      >
        <p v-if="!hasTodayMood">记录今日心情</p><p v-else>今日已记录</p>
      </van-button>
      
      <van-button 
        v-else
        round 
        type="primary" 
        size="large" 
        icon="friends-o"
        @click="goToLogin"
        class="login-button"
      >
        立即登录
      </van-button>
    </div>
  </div>
</template>

<script>
import { NavBar, Image, Icon, Tag, Grid, GridItem, Button, Progress, Loading, Toast } from 'vant';
import dayjs from 'dayjs';

export default {
  components: {
    [NavBar.name]: NavBar,
    [Image.name]: Image,
    [Icon.name]: Icon,
    [Tag.name]: Tag,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [Button.name]: Button,
    [Progress.name]: Progress,
    [Loading.name]: Loading
  },
  data() {
    // 生成日历数据
    const today = dayjs();
    const startOfMonth = dayjs().startOf('month');
    const endOfMonth = dayjs().endOf('month');
    
    // 计算日历开始日期（上个月的最后几天）
    const startDay = startOfMonth.day();
    const startDate = startOfMonth.subtract(startDay, 'day');
    
    // 生成日历数据
    const weeks = [];
    let currentDate = startDate;
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      
      for (let day = 0; day < 7; day++) {
        const date = currentDate.date();
        const isToday = currentDate.isSame(today, 'day');
        const inCurrentMonth = currentDate.month() === today.month();
        const hasRecord = Math.random() > 0.5; // 模拟有记录的日期
        
        weekDays.push({
          date,
          isToday,
          inCurrentMonth,
          hasRecord
        });
        
        currentDate = currentDate.add(1, 'day');
      }
      
      weeks.push(weekDays);
      
      // 如果已经生成到月末，提前结束
      if (currentDate.isAfter(endOfMonth)) {
        break;
      }
    }
    
    return {
      isLoggedIn: false, // 登录状态
      currentTime: dayjs().format('HH:mm'),
      currentDate: dayjs().format('YYYY年MM月DD日 dddd'),
      calendarTitle: dayjs().format('YYYY年MM月'),
      calendarWeeks: weeks,
      defaultAvatar: 'https://img.yzcdn.cn/vant/user-active.png',
      moods: [
        { value: '1', icon: 'smile-o', label: '高兴', color: '#f39c12' },
        { value: '2', icon: 'smile-comment-o', label: '平静', color: '#3498db' },
        { value: '3', icon: 'good-job-o', label: '兴奋', color: '#9b59b6' },
        { value: '4', icon: 'eye-o', label: '疲惫', color: '#95a5a6' },
        { value: '5', icon: 'down', label: '低落', color: '#e74c3c' }
      ],
      recentRecords: [],
      dailyQuote: {
        text: '物理学不仅告诉我们自然如何运作，更教导我们如何与自然和谐相处。',
        author: '理查德·费曼'
      },
      timeInterval: null,
      hasTodayMood: false, // 今日是否记录心情
      todayMood: {
        level: "平静",
        desc: "感觉稳定且专注",
        icon: "smile-comment-o",
        color: "#3498db",
        stress: 3,
        positive: 7,
        energy: 6
      },
      loading: false, // 加载状态
      
      // 新增：平台统计数据
      visitCount: null,
      userCount: null,
      diaryCount: null
    };
  },
  computed: {
    moodTagStyle() {
      if (!this.hasTodayMood) return {};
      
      const moodConfig = this.moods.find(m => m.label === this.todayMood.level);
      if (!moodConfig) return {};
      
      return {
        background: moodConfig.color,
        color: '#fff',
        border: `1px solid ${moodConfig.color}`
      };
    },
    moodIconBg() {
      return this.todayMood.color + '20'; // 添加透明度
    }
  },
  mounted() {
    if (!this.isLoggedIn) {
      this.loadStats();
    }

    // 更新时间
    this.timeInterval = setInterval(() => {
      this.currentTime = dayjs().format('HH:mm');
      this.currentDate = dayjs().format('YYYY年MM月DD日 dddd');
    }, 60000);

    // 检查登录状态
    this.checkLoginStatus();

  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
  methods: {
    checkLoginStatus() {
      if (this.$store.state.User.uid) {
        this.isLoggedIn = true;
        this.loadData();
      } else {
        this.isLoggedIn = false;
        // 未登录时只加载统计数据
        this.loadStats();
      }
    },

    loadStats() {
      // 尝试从本地缓存获取统计数据
      const cachedStats = localStorage.getItem('stats_cache');
      if (cachedStats) {
        console.log('缓存', cachedStats);
        const { data, timestamp } = JSON.parse(cachedStats);
        // 如果缓存未过期（5分钟内），使用缓存数据
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          this.visitCount = data.visit_count;
          this.userCount = data.user_count;
          this.diaryCount = data.diary_count;
          return;
        }
      }
      
      // 没有缓存或缓存过期，请求数据
      this.$axios.get('/stats/stats').then(res => {
        console.log(res)
        if (res.data) {
          this.visitCount = res.data.visit_count;
          this.userCount = res.data.user_count;
          this.diaryCount = res.data.diary_count;
          
          // 更新缓存
          localStorage.setItem('stats_cache', JSON.stringify({
            data: {
              visit_count: res.data.visit_count,
              user_count: res.data.user_count,
              diary_count: res.data.diary_count
            },
            timestamp: Date.now()
          }));
        }
      }).catch(error => {
        console.error('获取统计数据失败', error);
      });
    },

    loadData() {
      this.loading = true;
      
      // 并行加载所有数据
      Promise.all([
        this.loadStats(), // 加载统计数据
        this.loadTodayMood(),
        this.loadRecentRecords()
      ])
      .catch(error => {
        console.error('加载数据失败', error);
        // Toast.fail('数据加载失败');
      })
      .finally(() => {
        this.loading = false;
      });
    },
    
    loadTodayMood() {
      if (!this.$store.state.User.uid) return Promise.resolve();
      
      return new Promise((resolve, reject) => {
        this.$axios.get(`/diary/getTodayDiary?uid=${this.$store.state.User.uid}`)
          .then((res) => {
            const todayDiary = res.data;
            if (todayDiary) {
              if (this.isToday(todayDiary.create_time)) {
                const moodConfig = this.moods.find(m => m.label === todayDiary.mood.toString());
                
                if (moodConfig) {
                  this.todayMood = {
                    level: moodConfig.label,
                    desc: todayDiary.content.length > 50 ? 
                          todayDiary.content.substring(0, 50) + '...' : 
                          todayDiary.content,
                    icon: moodConfig.icon,
                    color: moodConfig.color,
                    stress: todayDiary.stress,
                    positive: todayDiary.positive,
                    energy: todayDiary.energy
                  };
                  
                  this.hasTodayMood = true;
                }
              }
            }
            resolve();
          })
          .catch(error => {
            console.error('获取今日心情失败', error);
            reject(error);
          });
      });
    },
    
    loadRecentRecords() {
      if (!this.$store.state.User.uid) return Promise.resolve();
      
      return new Promise((resolve, reject) => {
        this.$axios.get(`/diary/getLatestDiaries?uid=${this.$store.state.User.uid}`)
          .then((res) => {
            const diaries = res.data;
            // 取前三条记录
            this.recentRecords = diaries.slice(0, 3).map(diary => {
              const date = new Date(diary.create_time);
              const moodConfig = this.moods.find(m => m.label === diary.mood.toString());
              
              return {
                id: diary.id,
                experiment: diary.experiment,
                day: date.getDate().toString(),
                month: (date.getMonth() + 1) + '月',
                desc: diary.content.length > 30 ? diary.content.substring(0, 30) + '...' : diary.content,
                mood: {
                  icon: moodConfig ? moodConfig.icon : 'question-o',
                  color: moodConfig ? moodConfig.color : '#95a5a6',
                  moodContent: diary.mood
                }
              };
            });
            resolve();
          })
          .catch(error => {
            console.error('获取最近记录失败', error);
            reject(error);
          });
      });
    },
    
    isToday(dateString) {
      const inputDate = new Date(dateString);
      const today = new Date();
      
      return (
        inputDate.getFullYear() === today.getFullYear() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getDate() === today.getDate()
      );
    },
    
    goToLogin() {
      this.$router.push('/login');
    },
    
    logout() {
      this.isLoggedIn = false;
      this.clearUserInfo(); // 清除用户信息
      localStorage.removeItem('token'); // 清除token
      this.$router.push('/login');
    },
    
    clearUserInfo() {
      this.$store.commit('SET_USER', null);
      this.$store.commit('SET_TOKEN', null);
    },
    
    startNewRecord() {
      this.$router.push('/record');
    },
    
    viewReport() {
      Toast.fail("功能未开放");
      // this.$router.push('/report');
    },
    
    viewXM() {
      window.location.href = "weixin://dl/business/?appid=wxd5201eb08d2fa15c&path=pages/agentChat/index&query=showAuthDirectly%3D1%26id%3DhiNeHDvorMaX"
    },
    
    viewCalendar() {
      this.$router.push('/calendar');
    },
    
    viewRecord(id) {
      this.$router.push(`/detail?id=${id}`);
    },

    viewUserInfo(){
      this.$router.push('/info');
    },

    // 获取默认标题
    getDefaultTitle(mood) {
      console.log(mood);
      const defaultTitles = {
        '高兴': '愉快的一天',
        '平静': '平静的时光',
        '兴奋': '兴奋的时刻',
        '疲惫': '疲惫的体验',
        '低落': '低落的情绪'
      };
      return defaultTitles[mood] || '我的心情记录';
    },
    
  }
};
</script>

<style scoped>
.home-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: 100vh;
  padding-bottom: 90px;
}

/* 顶部学院信息栏 */
.university-header {
  position: relative;
  z-index: 10;
}

.header-background {
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  padding: 16px 12px 14px;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 20px rgba(52, 152, 219, 0.3);
  color: white;
}

.logo-container {
  text-align: center;
  margin-bottom: 8px;
}

.university-logo {
  height: 45px;
  max-width: 100%;
  border-radius: 8px;
  object-fit: contain;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.app-info {
  flex: 1;
  min-width: 0; /* 防止文本溢出 */
  text-align: center;
}

.app-name {
  margin: 0;
  font-size: 26px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.current-time {
  text-align: right;
  flex-shrink: 0;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.current-time .time {
  font-size: 16px;
  font-weight: bold;
  line-height: 1.2;
  white-space: nowrap;
}

.current-time .date {
  font-size: 12px;
  margin-top: 2px;
  opacity: 0.9;
  line-height: 1.2;
  white-space: nowrap;
}

/* 登录状态栏 */
.login-status-bar {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin: 10px 16px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 5;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info .van-image {
  margin-right: 12px;
}

.user-details {
  flex: 1;
}

.user-details h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.user-details p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #7f8c8d;
}

.login-prompt {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-prompt p {
  margin: 0;
  font-size: 14px;
  color: #2c3e50;
}

/* 主内容区 */
.main-content {
  padding: 0 16px;
}

/* 卡片通用样式 */
.mood-card,
.calendar-card,
.action-card,
.recent-card,
.quote-card,
.guide-card,
.benefits-card,
.stats-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

.guide-header{
  display: flex;
}

/* 情绪卡片 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.card-header h3 .van-icon {
  margin-right: 8px;
}

.mood-container {
  display: flex;
  flex-direction: column;
}

.mood-visual {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.mood-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.mood-description {
  flex: 1;
}

.mood-level {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: bold;
}

.mood-desc {
  margin: 4px 0 0;
  font-size: 14px;
  color: #7f8c8d;
}

.mood-details {
  display: flex;
  flex-direction: column;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.detail-header .label {
  font-size: 14px;
  color: #7f8c8d;
}

.detail-header .value {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

/* 今日未记录状态 */
.empty-mood {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  text-align: center;
}

.empty-mood .van-icon {
  margin-bottom: 16px;
}

.empty-text {
  margin: 0 0 16px;
  color: #95a5a6;
  font-size: 16px;
}

.empty-button {
  width: 120px;
}

/* 日历卡片 */
.calendar-card {
  margin-top: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: #3498db;
  font-weight: 500;
  font-size: 16px;
}

.calendar-header .van-icon {
  font-size: 18px;
  cursor: pointer;
}

.mini-calendar {
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
}

.calendar-row {
  display: flex;
  justify-content: space-between;
}

.calendar-row.days-row {
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.calendar-cell {
  width: 14.28%; /* 100% / 7 */
  text-align: center;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  position: relative;
  color: #7f8c8d;
}

.calendar-row.days-row .calendar-cell {
  font-weight: bold;
  color: #3498db;
}

.calendar-cell.today {
  background: rgba(52, 152, 219, 0.1);
  border-radius: 50%;
  color: #3498db;
  font-weight: bold;
}

.calendar-cell.has-record::after {
  content: "";
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #3498db;
}

.calendar-cell:not(.current-month) {
  color: #ccc;
}

/* 快速操作卡片 */
.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.action-icon.write {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.action-icon.records {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.action-icon.report {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.action-icon.calendar {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

.action-text {
  font-size: 12px;
  color: #2c3e50;
}

/* 最近记录卡片 */
.record-list {
  display: flex;
  flex-direction: column;
}

.record-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.record-item:hover {
  background-color: #f8f9fa;
}

.record-item:last-child {
  border-bottom: none;
}

.record-main {
  display: flex;
  align-items: center;
  flex: 1;
}

.record-date {
  min-width: 50px;
  text-align: center;
  margin-right: 16px;
}

.record-date .day {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #3498db;
}

.record-date .month {
  display: block;
  font-size: 12px;
  color: #7f8c8d;
}

.record-content {
  flex: 1;
}

.record-title {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 4px;
}

.record-desc {
  margin: 0;
  font-size: 14px;
  color: #7f8c8d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.record-mood {
  margin-left: 12px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  text-align: center;
}

.empty-text {
  margin: 16px 0;
  color: #95a5a6;
  font-size: 16px;
}

.empty-button {
  width: 120px;
}

/* 励志语录卡片 */
.quote-card {
  text-align: center;
  padding: 25px 20px;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%);
  border: 1px solid rgba(52, 152, 219, 0.2);
  border-radius: 16px;
}

.quote-text {
  font-size: 16px;
  color: #2c3e50;
  font-style: italic;
  line-height: 1.6;
  margin: 16px 0;
}

.quote-author {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

/* 新增：平台数据卡片样式 */
.stats-card {
  margin-top: 16px;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

/* 制作人信息 */
.creator-info {
  text-align: center;
  color: #95a5a6;
  font-size: 12px;
  padding: 20px 0;
  line-height: 1.8;
}

/* 底部按钮容器 */
.action-button-container {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 300px;
  z-index: 100;
}

.action-button {
  background: linear-gradient(to right, #3498db, #2ecc71);
  border: none;
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
  font-weight: bold;
  height: 50px;
}

.login-button {
  background: linear-gradient(to right, #3498db, #9b59b6);
  border: none;
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.4);
  font-weight: bold;
  height: 50px;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .header-content {
    /* flex-direction: column; */
    align-items: flex-start;
  }
  
  .current-time {
    text-align: left;
    margin-top: 12px;
    float: right;
  }
  
  .mood-visual {
    flex-direction: column;
    text-align: center;
  }
  
  .mood-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .calendar-cell {
    font-size: 12px;
    height: 28px;
    line-height: 28px;
  }
  
  .app-name {
    font-size: 25px;
  }
  
  .app-subtitle {
    font-size: 12px;
  }
  
  .current-time .time {
    font-size: 18px;
  }
  
  .current-time .date {
    font-size: 12px;
  }
  
  .login-prompt {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .login-prompt .van-button {
    margin-top: 12px;
    width: 100%;
  }
  
  .record-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .record-mood {
    margin-left: 15px;
    margin-top: 10px;
  }
  
  /* 响应式调整：平台数据卡片 */
  .stat-value {
    font-size: 22px;
  }
  
  .stat-label {
    font-size: 12px;
  }
}

/* 动画效果 */
.action-icon {
  transition: all 0.3s ease;
}

.action-icon:active {
  transform: scale(0.95);
}

.record-item {
  transition: all 0.2s ease;
}

.record-item:active {
  background-color: #f5f7fa;
}

.action-button, .login-button {
  transition: all 0.3s ease;
}

.action-button:active, .login-button:active {
  transform: translateX(-50%) scale(0.98);
}

/* 心情图标背景 */
.mood-icon {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 低落心情特殊样式 */
.mood-icon[style*="background-color: #e74c3c20"] {
  background: rgba(231, 76, 60, 0.1) !important;
}

/* 疲惫心情特殊样式 */
.mood-icon[style*="background-color: #95a5a620"] {
  background: rgba(149, 165, 166, 0.1) !important;
}

.loading-overlay {
  position: absolute;
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

.mood-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

@media (max-width: 400px) {
  .header-background {
    padding: 14px 10px 12px;
  }
  
  .app-name {
    font-size: 24px;
  }
  
  .app-subtitle {
    font-size: 11px;
  }
  
  .current-time .time {
    font-size: 15px;
  }
  
  .current-time .date {
    font-size: 11px;
  }
  
}

@media (max-width: 360px) {
  .app-name {
    font-size: 20px;
  }
  
  .current-time .time {
    font-size: 14px;
  }
}

@media (max-width: 320px) {
  .app-name {
    font-size: 18px;
  }
  
  .app-subtitle {
    font-size: 10px;
  }
  
  .current-time {
    margin-left: 8px;
  }
  
  .current-time .time {
    font-size: 13px;
  }
  
  .current-time .date {
    font-size: 10px;
  }
}
</style>