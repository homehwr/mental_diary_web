<template>
  <div class="diary-list-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">心灵日记列表</h1>
        <p class="page-subtitle">记录成长点滴，感悟心灵旅程</p>
      </div>
    </div>
    
    <!-- 筛选工具栏 -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">姓名：</span>
          <el-input 
            v-model="filterParams.name" 
            placeholder="请输入姓名" 
            size="medium" 
            clearable
            style="width: 200px;"
          ></el-input>
        </div>
        
        <div class="filter-group">
          <span class="filter-label">班级：</span>
          <el-select 
            v-model="filterParams.class" 
            placeholder="请选择班级" 
            size="medium" 
            clearable
            style="width: 240px;"
          >
            <el-option 
              v-for="cls in classOptions" 
              :key="cls.value" 
              :label="cls.label" 
              :value="cls.value"
            ></el-option>
          </el-select>
        </div>
        
        <div class="filter-group">
          <span class="filter-label">心情：</span>
          <el-select 
            v-model="filterParams.mood" 
            placeholder="请选择心情" 
            size="medium" 
            clearable
            style="width: 200px;"
          >
            <el-option 
              v-for="mood in moodOptions" 
              :key="mood.value" 
              :label="mood.label" 
              :value="mood.value"
            ></el-option>
          </el-select>
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">学号：</span>
          <el-input 
            v-model="filterParams.account" 
            placeholder="请输入学号" 
            size="medium" 
            clearable
            style="width: 200px;"
          ></el-input>
        </div>

        <div class="filter-group">
          <span class="filter-label">日期范围：</span>
          <el-date-picker
            v-model="filterParams.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="medium"
            style="width: 300px;"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </div>
        
        <div class="action-buttons">
          <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportData">导出数据</el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 日记表格 -->
    <el-card class="table-card" shadow="hover">
      <div class="table-header">
        <div class="table-title">共 {{ totalItems }} 篇日记</div>
        <div class="table-actions">
          <el-button 
            size="small" 
            icon="el-icon-refresh" 
            @click="refreshData"
            :loading="loading"
          >刷新</el-button>
        </div>
      </div>
      
      <el-table 
        :data="displayedDiaries" 
        style="width: 100%" 
        v-loading="loading"
        element-loading-text="数据加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.7)"
        @sort-change="handleSortChange"
      >
        <el-table-column type="index" width="70" label="序号" align="center"></el-table-column>
        <el-table-column prop="username" label="姓名" width="120" sortable="custom"></el-table-column>
        <el-table-column prop="real_class" label="班级" width="200" sortable="custom"></el-table-column>
        <el-table-column prop="stress" label="压力指数" width="180" sortable="custom">
            <template slot-scope="scope">
                <el-rate
                    v-model="scope.row.stress"
                    disabled
                    :icon-classes="iconClasses"
                    void-icon-class="el-icon-warning"
                    :colors="['#2ECC71', '#F39C12', '#E74C3C']">
                </el-rate>
                <span style="margin-left: 8px; color: #666;">{{ scope.row.stress*2 }}级</span>
            </template>
        </el-table-column>
        <el-table-column label="心情" width="130" sortable="custom">
          <template slot-scope="scope">
            <span class="mood-tag" :class="'mood-' + scope.row.mood">
              {{ getMoodName(scope.row.mood) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="提交时间" width="180" sortable="custom"></el-table-column>
        <el-table-column label="操作" width="190" align="center">
          <template slot-scope="scope">
            <div class="diary-actions">
              <el-button 
                size="mini" 
                class="view-btn" 
                icon="el-icon-view" 
                @click="viewDiary(scope.row)"
              >查看</el-button>
              <el-button 
                size="mini" 
                class="delete-btn" 
                icon="el-icon-delete" 
                @click="deleteDiary(scope.row)"
              >删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 空状态 -->
      <div v-if="displayedDiaries.length === 0 && !loading" class="empty-state">
        <i class="el-icon-notebook-1 empty-icon"></i>
        <p class="empty-text">暂无日记记录</p>
        <el-button type="primary" @click="resetFilters" style="margin-top: 10px;">
          清除筛选条件
        </el-button>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="totalItems > 0">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total, jumper"
          :total="totalItems"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 50]"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 日记详情弹窗组件 -->
    <DiaryDetailDialog
      :visible="dialogVisible"
      :diary="detailDiary"
      :loading="detailLoading"
      @close="handleDialogClose"
    />
  </div>
</template>

<script>
// 导入导出功能所需的库
import * as XLSX from 'xlsx';
// 导入日记详情弹窗组件
import DiaryDetailDialog from './diaryDetailDialog.vue';

export default {
  name: 'DiaryList',
  components: {
    DiaryDetailDialog
  },
  data() {
    return {
        loading: false,
        dialogVisible: false,
        detailLoading: false,
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        filterParams: {
            name: '',
            class: '',
            mood: '',
            dateRange: [],
            account: ''
        },
        // 压力指数图标配置 - 统一使用警告图标
        iconClasses: ['el-icon-warning', 'el-icon-warning', 'el-icon-warning'],
        // 班级选项（已按年级排序）
        classOptions: [],
        moodOptions: [
            { value: '1', label: '高兴' },
            { value: '2', label: '平静' },
            { value: '3', label: '兴奋' },
            { value: '4', label: '疲惫' },
            { value: '5', label: '低落' }
        ],
        diaries: [],
        allDiaries: [], // 存储所有数据用于筛选
        currentSort: { prop: '', order: '' }, // 当前排序状态
        detailDiary: {} // dialog对话框中的详细日记数据
    };
  },
  computed: {
    // 计算当前页显示的数据
    displayedDiaries() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.getFilteredDiaries().slice(start, end);
    }
  },
  watch: {
    // 监听筛选条件变化，更新总条目数
    filterParams: {
        handler() {
                this.totalItems = this.getFilteredDiaries().length;
                this.currentPage = 1; // 重置到第一页
        },
        deep: true
    },
  },
  mounted() {
      this.initClassOptions();
      this.loadDiaries();
  },
  methods: {
    // 初始化班级选项（按年级排序）
    initClassOptions() {
      const classList = [
        '物理学2501', '物理学2502', '电气工程及其自动化2501', '电气工程及其自动化2502', 
        '电子信息工程2501', '电子信息工程2502', '电子科学与技术2501', '电子科学与技术2502', 
        '物理学(公费师范)2501', '物理学(非师范)2501', '电子信息工程2401', '电子信息工程2402', 
        '物理学(公费师范)2401', '电子科学与技术2401', '电子科学与技术2402', '物理学2401', 
        '区块链工程2401', '物理学2301', '物理学2302', '电子信息工程2301', '电子信息工程2302', 
        '区块链工程2301', '物理学(公费师范)2301', '电子科学与技术2301', '物理学2201', '物理学2202', 
        '物理学(公费师范)2201', '物理学(公费师范)2202', '电子信息工程2202', '电子信息工程2201', '电子科学与技术2201'
      ];
      
      // 按年级排序：25级 -> 24级 -> 23级 -> 22级
      // const sortedClasses = classList.sort((a, b) => {
      //   // 提取年级数字（字符串中的前两位数字）
      //   const getGrade = (str) => {
      //     const match = str.match(/\d{2}/);
      //     return match ? parseInt(match[0]) : 0;
      //   };
        
      //   const gradeA = getGrade(a);
      //   const gradeB = getGrade(b);
        
      //   // 按年级降序排列
      //   return gradeB - gradeA;
      // });
      // console.log(sortedClasses);
      // 生成选项
      this.classOptions = classList.map(cls => ({
        value: cls,
        label: cls
      }));
    },
    
    // 加载日记数据
    loadDiaries() {
        this.loading = true;
        
        // 模拟API请求
        this.$axios.get("/diary/getAllDiaries")
            .then(res => {
                this.allDiaries = res.data.diaries || [];
                // 数据加载完成后，如果有account参数，则进行筛选
                if (this.$route.query.account) {
                    this.filterParams.account = this.$route.query.account;
                    // 等待下一个DOM更新周期，确保数据已更新
                    this.$nextTick(() => {
                        this.totalItems = this.getFilteredDiaries().length;
                    });
                } else {
                    this.totalItems = this.allDiaries.length;
                }
                this.loading = false;
            })
            .catch(error => {
                console.error("加载数据失败:", error);
                this.loading = false;
                
                // 如果请求失败，使用模拟数据
                this.$message.error("数据加载失败！");
                if (this.$route.query.account) {
                    this.filterParams.account = this.$route.query.account;
                    this.$nextTick(() => {
                        this.totalItems = this.getFilteredDiaries().length;
                    });
                } else {
                    this.totalItems = this.allDiaries.length;
                }
            });
    },
    
    // 刷新数据
    refreshData() {
      this.loadDiaries();
    },
    
    getFilteredDiaries() {
        let filtered = [...this.allDiaries];
        
        // 姓名筛选
        if (this.filterParams.name) {
        filtered = filtered.filter(diary => 
            diary.username && diary.username.toLowerCase().includes(this.filterParams.name.toLowerCase())
        );
        }
        
        // 班级筛选
        if (this.filterParams.class) {
        filtered = filtered.filter(diary => 
            diary.real_class && diary.real_class === this.filterParams.class
        );
        }
        
        // 心情筛选
        if (this.filterParams.mood) {
        filtered = filtered.filter(diary => 
            diary.mood && diary.mood.toString() === this.filterParams.mood
        );
        }
        // 学号筛选
        if (this.filterParams.account) {
        filtered = filtered.filter(diary => 
            diary.account && diary.account === this.filterParams.account
        );
        }
        
        // 日期范围筛选
        if (this.filterParams.dateRange && this.filterParams.dateRange.length === 2) {
        const startDate = new Date(this.filterParams.dateRange[0]);
        const endDate = new Date(this.filterParams.dateRange[1]);
        endDate.setHours(23, 59, 59, 999); // 包含结束日期当天
        
        filtered = filtered.filter(diary => {
            if (!diary.create_time) return false;
            
            const diaryDate = new Date(diary.create_time);
            return diaryDate >= startDate && diaryDate <= endDate;
        });
        }
        
        // 应用排序
        if (this.currentSort.prop) {
          filtered = this.sortData(filtered, this.currentSort.prop, this.currentSort.order);
        }
        
        return filtered;
    },
    
    // 处理排序变化
    handleSortChange({ column, prop, order }) {
      this.currentSort = { prop, order };
      this.currentPage = 1; // 排序后回到第一页
    },
    
    // 数据排序方法
    sortData(data, prop, order) {
      if (!prop || !order) return data;
      
      return [...data].sort((a, b) => {
        let aVal = a[prop];
        let bVal = b[prop];
        
        // 特殊处理心情列（根据标签文本排序）
        if (prop === 'mood') {
          aVal = this.getMoodName(aVal);
          bVal = this.getMoodName(bVal);
        }
        
        // 处理压力指数（数值排序）
        if (prop === 'stress') {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        }
        
        // 处理日期排序
        if (prop === 'create_time') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        
        // 处理字符串排序（不区分大小写）
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal === bVal) return 0;
        
        if (order === 'ascending') {
          return aVal < bVal ? -1 : 1;
        } else {
          return aVal > bVal ? -1 : 1;
        }
      });
    },

    
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
    
    // 删除日记
    deleteDiary(diary) {
        this.$message.error("无法删除学生的日记！");
    },
    
    // 分页大小变化
    handleSizeChange(size) {
      this.pageSize = size;
      this.currentPage = 1;
    },
    
    // 页码变化
    handlePageChange(page) {
      this.currentPage = page;
    },
    
    // 重置筛选条件
    resetFilters() {
      this.filterParams = {
        name: '',
        class: '',
        mood: '',
        dateRange: []
      };
      this.currentSort = { prop: '', order: '' };
      this.currentPage = 1;
    },
    
    // 导出数据为Excel
    exportData() {
        const filteredDiaries = this.getFilteredDiaries();
        
        if (filteredDiaries.length === 0) {
            this.$message.warning('没有数据可导出');
            return;
        }
        
        try {
            // 准备导出数据
            const exportData = filteredDiaries.map(diary => ({
                姓名: diary.username || '',
                班级: diary.real_class || '',
                压力指数: (diary.stress || 0) * 2 + '级',
                心情: this.getMoodName(diary.mood) || '',
                提交时间: diary.create_time || '',
                日记内容: diary.content || ''
            }));
            
            // 创建工作簿
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);
            
            // 设置列宽
            const colWidths = [
                { wch: 10 }, // 姓名
                { wch: 20 }, // 班级
                { wch: 10 }, // 压力指数
                { wch: 10 }, // 心情
                { wch: 20 }, // 提交时间
                { wch: 50 }  // 日记内容
            ];
            ws['!cols'] = colWidths;
            
            // 添加工作表到工作簿
            XLSX.utils.book_append_sheet(wb, ws, '心灵日记数据');
            
            // 生成Excel文件并下载
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            XLSX.writeFile(wb, `心灵日记数据_${dateStr}.xlsx`);
            
            this.$message.success('数据导出成功');
        } catch (error) {
            console.error('导出数据失败:', error);
            this.$message.error('数据导出失败');
        }
    }
  }
};
</script>

<style scoped>
.diary-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #304156;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 16px;
  color: #909399;
  margin-top: 5px;
}

.filter-card {
  border-radius: 10px;
  margin-bottom: 25px;
  transition: transform 0.3s;
  border: 1px solid #e6e6e6;
}

.filter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex: 1;
}

.table-card {
  border-radius: 10px;
  transition: transform 0.3s;
  border: 1px solid #e6e6e6;
}

.table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.table-title {
  font-size: 18px;
  font-weight: bold;
  color: #304156;
}

.table-actions {
  display: flex;
  gap: 10px;
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

.mood-1 { /* 高兴 */
  background: linear-gradient(135deg, #FFE57F, #FFD54F);
  color: #E65100;
  box-shadow: 0 2px 4px rgba(255, 214, 0, 0.3);
}

.mood-2 { /* 平静 */
  background: linear-gradient(135deg, #81D4FA, #4FC3F7);
  color: #01579B;
  box-shadow: 0 2px 4px rgba(129, 212, 250, 0.3);
}

.mood-3 { /* 兴奋 */
  background: linear-gradient(135deg, #FFAB91, #FF8A65);
  color: #BF360C;
  box-shadow: 0 2px 4px rgba(255, 138, 101, 0.3);
}

.mood-4 { /* 疲惫 */
  background: linear-gradient(135deg, #E0E0E0, #BDBDBD);
  color: #424242;
  box-shadow: 0 2px 4px rgba(189, 189, 189, 0.3);
}

.mood-5 { /* 低落 */
  background: linear-gradient(135deg, #90CAF9, #64B5F6);
  color: #0D47A1;
  box-shadow: 0 2px 4px rgba(100, 181, 246, 0.3);
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

.diary-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.view-btn {
  background: linear-gradient(135deg, #409EFF, #337ecc);
  border: none;
  color: white;
  transition: all 0.3s;
}

.view-btn:hover {
  background: linear-gradient(135deg, #337ecc, #2666a3);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.4);
}

.delete-btn {
  background: linear-gradient(135deg, #F56C6C, #d65454);
  border: none;
  color: white;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #d65454, #b84040);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.4);
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;
}

.empty-icon {
  font-size: 80px;
  color: #dcdfe6;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-text {
  font-size: 18px;
  color: #909399;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 压力指数样式优化 */
::v-deep .el-rate {
  display: inline-flex;
  align-items: center;
}

::v-deep .el-rate__icon {
  font-size: 18px;
}

/* 加载动画优化 */
::v-deep .el-loading-spinner {
  margin-top: -20px;
}

::v-deep .el-loading-spinner .el-icon-loading {
  font-size: 32px;
  color: #409eff;
}

::v-deep .el-loading-spinner .el-loading-text {
  margin-top: 10px;
  color: #409eff;
  font-size: 14px;
}

/* 表格样式优化 */
::v-deep .el-table {
  border-radius: 8px;
  overflow: hidden;
}

::v-deep .el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

::v-deep .el-table .el-table__row:hover td {
  background-color: #f0f7ff !important;
}

/* 日记详情弹窗样式 */
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

/* 响应式设计 */
@media (max-width: 992px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .table-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .info-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .diary-list-container {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .action-buttons {
    justify-content: flex-start;
    width: 100%;
    margin-top: 10px;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .el-input, .el-select, .el-date-editor {
    width: 100% !important;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .diary-actions {
    flex-direction: column;
    gap: 5px;
  }
  
  .view-btn, .delete-btn {
    width: 100%;
  }
  
  ::v-deep .diary-detail-dialog {
    width: 95% !important;
  }
  
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>