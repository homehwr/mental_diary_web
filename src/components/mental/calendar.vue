<template>
  <div class="records-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="我的记录"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
      class="app-nav-bar"
    />
    
    <!-- 全局加载动画 -->
    <div class="global-loading-overlay" v-if="globalLoading">
      <div class="loading-content">
        <van-loading size="36px" color="#3498db" vertical>加载数据中...</van-loading>
      </div>
    </div>
    
    <!-- 日期选择器 -->
    <div class="date-selector">
      <div class="date-display">
        <van-icon name="arrow-left" @click="prevDay" class="nav-icon" />
        <div class="date-info">
          <div class="date-text">{{ selectedDateText }}</div>
          <div class="day-text">{{ dayOfWeek }}</div>
        </div>
        <van-icon name="arrow" @click="nextDay" class="nav-icon" />
      </div>
      <van-button 
        round 
        size="small" 
        icon="replay" 
        @click="refreshRecords"
        class="refresh-button"
        :loading="refreshing"
        loading-text="刷新中..."
      >
        刷新
      </van-button>
    </div>
    
    <!-- 月份选择器 -->
    <div class="month-selector">
      <van-icon name="arrow-left" @click="prevMonth" class="month-nav" />
      <div class="current-month">{{ currentMonthText }}</div>
      <van-icon name="arrow" @click="nextMonth" class="month-nav" />
    </div>
    
    <!-- 日历视图 -->
    <div class="calendar-view">
      <div class="weekdays">
        <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>
      
      <div class="calendar-grid">
        <div 
          v-for="(day, index) in calendarDays" 
          :key="index" 
          class="calendar-day"
          :class="{
            'other-month': !day.inCurrentMonth,
            'today': day.isToday,
            'has-record': day.hasRecord,
            'selected': day.isSelected
          }"
          @click="selectDate(day.date)"
        >
          {{ day.date.getDate() }}
          <div v-if="day.hasRecord" class="record-indicator"></div>
        </div>
      </div>
    </div>
    
    <!-- 记录列表 -->
    <div class="records-list">
      <div class="section-header">
        <div class="section-title">当日记录</div>
        <div class="record-count">{{ records.length }} 条记录</div>
      </div>
      
      <!-- 记录列表加载动画 -->
      <div class="records-loading" v-if="recordsLoading">
        <van-loading size="24px" vertical>加载记录中...</van-loading>
      </div>
      
      <div v-else>
        <div v-if="records.length > 0">
          <div 
            v-for="(record, index) in records" 
            :key="index" 
            class="record-item"
            @click="viewRecordDetail(record.id)"
          >
            <div class="record-time">{{ formatTime(record.create_time) }}</div>
            <div class="record-content">
              <div class="record-title">
                <van-icon :name="getMoodIcon(record.mood)" :color="getMoodColor(record.mood)" size="16" />
                {{ record.experiment || getDefaultTitle(record.mood) }}
              </div>
              <div class="record-desc">{{ record.content }}</div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <van-icon name="notes-o" class="empty-icon" />
          <div class="empty-text">当日暂无记录</div>
          <div class="empty-subtext">选择其他日期查看记录</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { NavBar, Icon, Button, Loading } from 'vant';
import dayjs from 'dayjs';

export default {
  name: 'RecordsPage',
  components: {
    [NavBar.name]: NavBar,
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Loading.name]: Loading
  },
  data() {
    // 设置起始日期为2025年7月1日
    const startDate = new Date(2025, 6, 1);
    const today = new Date();
    
    return {
      minDate: startDate,
      maxDate: today,
      selectedDate: today,
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      records: [],
      calendarDays: [],
      recordedDates: [],
      globalLoading: true, // 全局加载状态
      recordsLoading: false, // 记录列表加载状态
      refreshing: false // 刷新状态
    };
  },
  computed: {
    selectedDateText() {
      return dayjs(this.selectedDate).format('YYYY年MM月DD日');
    },
    dayOfWeek() {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return days[this.selectedDate.getDay()];
    },
    currentMonthText() {
      return `${this.currentYear}年${this.currentMonth + 1}月`;
    }
  },
  mounted() {
    this.loadInitialData();
  },
  methods: {
    // 加载初始数据
    async loadInitialData() {
      this.globalLoading = true;
      
      try {
        // 先获取有记录的日期
        await this.fetchRecordedDates();
        
        // 然后生成日历
        this.generateCalendarDays();
        
        // 最后加载当前日期的记录
        await this.loadRecordsForDate(this.selectedDate);
      } catch (error) {
        console.error('加载数据失败:', error);
        this.$toast('加载数据失败，请稍后重试');
      } finally {
        this.globalLoading = false;
      }
    },
    
    // 获取有记录的日期
    async fetchRecordedDates() {
      try {
        const response = await this.$axios.get(`/diary/getUserDiaryDates?uid=${this.$store.state.User.uid}`);
        this.recordedDates = response.data;
      } catch (error) {
        console.error('获取有记录的日期错误:', error);
        this.$toast('获取日期信息失败');
        throw error;
      }
    },
    
    // 生成日历日期
    generateCalendarDays() {
      const days = [];
      const firstDay = new Date(this.currentYear, this.currentMonth, 1);
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
      const firstDayOfWeek = firstDay.getDay();
      
      // 添加上个月的最后几天
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(firstDay);
        date.setDate(date.getDate() - (firstDayOfWeek - i));
        days.push(this.createDayObject(date, false));
      }
      
      // 添加当月的所有天
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(this.currentYear, this.currentMonth, i);
        days.push(this.createDayObject(date, true));
      }
      
      // 添加下个月的前几天
      const lastDayOfWeek = lastDay.getDay();
      for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
        const date = new Date(lastDay);
        date.setDate(date.getDate() + i);
        days.push(this.createDayObject(date, false));
      }
      
      this.calendarDays = days;
    },
    
    // 创建日期对象
    createDayObject(date, inCurrentMonth) {
      const dateStr = dayjs(date).format('YYYY-MM-DD');
      const today = new Date();
      
      return {
        date: date,
        dateStr: dateStr,
        isToday: date.toDateString() === today.toDateString(),
        hasRecord: this.recordedDates.includes(dateStr),
        inCurrentMonth: inCurrentMonth,
        isSelected: date.toDateString() === this.selectedDate.toDateString()
      };
    },
    
    // 选择日期
    async selectDate(date) {
      if (date > this.maxDate) return;
      
      // 保存旧月份
      const oldMonth = this.currentMonth;
      const oldYear = this.currentYear;
      
      this.selectedDate = date;
      
      // 获取新日期的月份和年份
      const newMonth = date.getMonth();
      const newYear = date.getFullYear();
      
      // 如果月份或年份发生变化，则更新当前月份和年份
      if (oldMonth !== newMonth || oldYear !== newYear) {
        this.currentMonth = newMonth;
        this.currentYear = newYear;
        this.generateCalendarDays();
      } else {
        // 仅重新生成日历
        this.generateCalendarDays();
      }
      
      // 加载记录
      await this.loadRecordsForDate(date);
    },
    
    // 加载记录
    async loadRecordsForDate(date) {
      this.recordsLoading = true;
      
      try {
        const dateStr = dayjs(date).format('YYYY-MM-DD');
        const response = await this.$axios.get('/diary/getDiaryByDate', {
          params: {
            uid: this.$store.state.User.uid,
            date_str: dateStr
          }
        });
        
        if (response.status === 200) {
          this.records = response.data;
        } else if (response.status === 404) {
          this.records = [];
        }
      } catch (error) {
        console.error('获取日记错误:', error);
        // this.$toast('获取记录失败，请稍后重试');
        this.records = [];
      } finally {
        this.recordsLoading = false;
      }
    },
    
    // 格式化时间
    formatTime(timeString) {
      if (!timeString) return '';
      return timeString.split('T')[1].split('.')[0].substring(0, 5);
    },
    
    // 获取心情图标
    getMoodIcon(mood) {
      const moodIcons = {
        '高兴': 'smile-o',
        '平静': 'smile-comment-o',
        '兴奋': 'good-job-o',
        '疲惫': 'eye-o',
        '低落': 'down'
      };
      return moodIcons[mood] || 'smile-o';
    },
    
    // 获取心情颜色
    getMoodColor(mood) {
      const moodColors = {
        '高兴': '#f39c12',
        '平静': '#3498db',
        '兴奋': '#9b59b6',
        '疲惫': '#95a5a6',
        '低落': '#e74c3c'
      };
      return moodColors[mood] || '#3498db';
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
    
    // 刷新记录
    async refreshRecords() {
      this.refreshing = true;
      await this.loadRecordsForDate(this.selectedDate);
      this.refreshing = false;
    },
    
    // 查看记录详情
    viewRecordDetail(id) {
      this.$router.push(`/detail?id=${id}`);
    },
    
    // 前一天
    async prevDay() {
      const newDate = new Date(this.selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      if (newDate >= this.minDate) {
        await this.selectDate(newDate);
      }
    },
    
    // 后一天
    async nextDay() {
      const newDate = new Date(this.selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      if (newDate <= this.maxDate) {
        await this.selectDate(newDate);
      }
    },
    
    // 上个月
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this.generateCalendarDays();
    },
    
    // 下个月
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      
      const currentDate = new Date();
      if (this.currentYear > currentDate.getFullYear() || 
          (this.currentYear === currentDate.getFullYear() && this.currentMonth > currentDate.getMonth())) {
        this.currentYear = currentDate.getFullYear();
        this.currentMonth = currentDate.getMonth();
      }
      
      this.generateCalendarDays();
    }
  }
};
</script>

<style scoped>
.records-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: 100vh;
  padding-bottom: 20px;
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

/* 日期选择器 */
.date-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.date-display {
  display: flex;
  align-items: center;
  flex: 1;
}

.nav-icon {
  font-size: 20px;
  color: #3498db;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.3s;
}

.nav-icon:active {
  transform: scale(1.2);
}

.date-info {
  flex: 1;
  text-align: center;
}

.date-text {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.day-text {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 4px;
}

.refresh-button {
  background: linear-gradient(135deg, #3498db, #2ecc71);
  color: white;
  border: none;
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  padding: 0 16px;
  transition: transform 0.3s;
}

.refresh-button:active {
  transform: scale(0.98);
}

/* 月份选择器 */
.month-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  background: white;
  margin: 0 16px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.month-nav {
  font-size: 18px;
  color: #3498db;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.3s;
}

.month-nav:active {
  transform: scale(1.2);
}

.current-month {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 20px;
}

/* 日历视图 */
.calendar-view {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin: 0 16px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 12px;
  font-weight: bold;
  color: #3498db;
}

.weekday {
  padding: 4px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1/1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  padding: 4px;
  transition: all 0.3s;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.today {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  font-weight: bold;
}

.calendar-day.has-record::after {
  content: "";
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #2ecc71;
}

.calendar-day.selected {
  background: linear-gradient(135deg, #3498db, #2ecc71);
  color: white;
  font-weight: bold;
}

.calendar-day.selected::after {
  background: white;
}

/* 记录列表 */
.records-list {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 0 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.record-count {
  font-size: 14px;
  color: #7f8c8d;
}

.record-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  transition: background-color 0.3s;
}

.record-item:last-child {
  border-bottom: none;
}

.record-item:hover {
  background-color: #f8f9fa;
}

.record-time {
  min-width: 70px;
  color: #3498db;
  font-weight: 500;
  font-size: 14px;
  margin-top: 4px;
}

.record-content {
  flex: 1;
  padding-right: 10px;
}

.record-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.record-title .van-icon {
  margin-right: 8px;
}

.record-desc {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
}

.record-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: #7f8c8d;
}

.stat-item .van-icon {
  margin-right: 4px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #ebedf0;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #95a5a6;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 14px;
  color: #bdc3c7;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .date-selector {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-display {
    margin-bottom: 12px;
  }
  
  .refresh-button {
    width: 100%;
  }
  
  .record-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .record-time {
    margin-bottom: 8px;
  }
  
  .record-stats {
    flex-direction: row;
    margin-top: 10px;
    width: 100%;
    justify-content: space-around;
  }
  
  .calendar-grid {
    gap: 2px;
  }
  
  .calendar-day {
    font-size: 12px;
  }
  
  .month-selector {
    margin: 0 8px;
  }
  
  .current-month {
    font-size: 16px;
    margin: 0 10px;
  }
}

.full-loading {
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

.records-loading {
  height: 200px; /* 给一个最小高度，避免页面跳动 */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>