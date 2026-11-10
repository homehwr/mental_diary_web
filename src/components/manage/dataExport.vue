<template>
  <div class="export-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">数据导出</h1>
        <p class="page-subtitle">日记数据一个工作表，分析报告可导出多分表 Excel / CSV 或带图表的 PDF</p>
      </div>
      <div class="operator-tag" v-if="hasPermission">
        <i class="el-icon-user-solid"></i>
        当前操作者：{{ currentUser.username }}（{{ dutyLabel }}）
      </div>
    </div>

    <el-alert
      v-if="!hasPermission"
      title="当前账号无数据导出权限，请使用班主任或管理员账号登录"
      type="error"
      :closable="false"
      show-icon
      style="margin-bottom: 20px;"
    ></el-alert>

    <el-row :gutter="20">
      <!-- 日记数据导出 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="export-card" shadow="hover">
          <div slot="header" class="card-header">
            <i class="el-icon-notebook-2"></i>
            <span>日记数据导出</span>
          </div>

          <div class="form-item">
            <span class="form-label">日期范围</span>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              size="medium"
              style="width: 100%;"
            ></el-date-picker>
          </div>

          <div class="form-item">
            <span class="form-label">姓名</span>
            <el-input v-model="diaryParams.name" placeholder="留空为全部姓名，支持模糊匹配" clearable size="medium"></el-input>
          </div>

          <div class="form-item">
            <span class="form-label">班级</span>
            <el-input v-model="diaryParams.class_name" placeholder="留空为全部班级" clearable size="medium"></el-input>
          </div>

          <div class="form-item">
            <span class="form-label">学号</span>
            <el-input v-model="diaryParams.account" placeholder="留空为全部学号" clearable size="medium"></el-input>
          </div>

          <div class="form-item">
            <span class="form-label">心情</span>
            <el-select v-model="diaryParams.mood" placeholder="全部心情" clearable size="medium" style="width: 100%;">
              <el-option v-for="mood in moodOptions" :key="mood.value" :label="mood.label" :value="mood.value"></el-option>
            </el-select>
          </div>

          <div class="export-actions">
            <el-button
              type="primary"
              icon="el-icon-download"
              :loading="exportingDiaryExcel"
              :disabled="!hasPermission"
              @click="doExportDiary('excel')"
            >导出 Excel</el-button>
            <el-button
              icon="el-icon-document"
              :loading="exportingDiaryCsv"
              :disabled="!hasPermission"
              @click="doExportDiary('csv')"
            >导出 CSV 文件</el-button>
          </div>

          <div class="card-note">
            <i class="el-icon-info"></i>
            只输出「日记数据」一张表；私密日记只保留占位行，不含正文与任何详情。
          </div>
        </el-card>
      </el-col>

      <!-- 数据分析结果导出 -->
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="export-card" shadow="hover">
          <div slot="header" class="card-header">
            <i class="el-icon-s-marketing"></i>
            <span>数据分析结果导出</span>
          </div>

          <div class="form-item">
            <span class="form-label">统计区间（默认全部时间）</span>
            <el-select v-model="analysisParams.days" size="medium" style="width: 100%;">
              <el-option label="全部时间" :value="0"></el-option>
              <el-option label="最近 7 天" :value="7"></el-option>
              <el-option label="最近 30 天" :value="30"></el-option>
              <el-option label="最近 90 天" :value="90"></el-option>
              <el-option label="最近 1 年" :value="365"></el-option>
              <el-option label="最近 3 年" :value="1095"></el-option>
            </el-select>
          </div>

          <div class="form-item">
            <span class="form-label">自定义日期范围（可选，优先级更高，跨度不限）</span>
            <el-date-picker
              v-model="analysisDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              size="medium"
              style="width: 100%;"
            ></el-date-picker>
          </div>

          <div class="dimension-title">报告包含的分表</div>
          <div class="dimension-tags">
            <el-tag v-for="item in analysisSheets" :key="item" size="small" type="info">{{ item }}</el-tag>
          </div>

          <div class="export-actions">
            <el-button
              type="success"
              icon="el-icon-download"
              :loading="exportingAnalysisExcel"
              :disabled="!hasPermission"
              @click="doExportAnalysis('excel')"
            >导出 Excel</el-button>
            <el-button
              icon="el-icon-folder"
              :loading="exportingAnalysisCsv"
              :disabled="!hasPermission"
              @click="doExportAnalysis('csv')"
            >导出 CSV 包</el-button>
            <el-button
              type="warning"
              icon="el-icon-document"
              :loading="exportingAnalysisPdf"
              :disabled="!hasPermission"
              @click="doExportAnalysis('pdf')"
            >导出 PDF 报告</el-button>
          </div>

          <div class="card-note">
            <i class="el-icon-info"></i>
            默认覆盖全部历史数据；PDF 为 3 页带图表报告（指标卡、环形图、折线、柱状、分组柱状、表格）。
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 简明说明 -->
    <el-card class="info-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-info"></i>
        <span>导出说明</span>
      </div>
      <p class="info-text">
        <b>日记字段：</b>日记ID、提交时间、姓名、年级、班级、学号(脱敏)、心情、压力指数 / 积极情绪 / 精力水平、关联实验、今日感悟、附件数量、是否私密、隐私处理说明。
      </p>
      <p class="info-text">
        <b>分析报告：</b>Excel 与 CSV 包含概览、情绪分布、每日趋势、时段分布、班级活跃度、每周情绪节奏、班级情绪对比、记录习惯、实验类型分布、高频关键词等分表；PDF 为 3 页图表版。
      </p>
      <p class="info-text">
        <b>隐私：</b>私密日记只保留占位行，不含正文与任何详情；分析仅基于公开日记，不输出任何单条日记明细。
      </p>
      <p class="info-text">
        <b>权限：</b>仅班主任与管理员可导出，服务端校验登录令牌并记录操作者。
      </p>
    </el-card>
  </div>
</template>

<script>
import {
  exportExcel,
  exportServerFile,
  exportAnalysisPdf,
  handleExportError
} from '@/utils/export';

export default {
  name: 'DataExport',
  data() {
    return {
      dateRange: [],
      analysisDateRange: [],
      diaryParams: {
        name: '',
        class_name: '',
        account: '',
        mood: ''
      },
      analysisParams: {
        days: 0
      },
      exportingDiaryExcel: false,
      exportingDiaryCsv: false,
      exportingAnalysisExcel: false,
      exportingAnalysisCsv: false,
      exportingAnalysisPdf: false,
      moodOptions: [
        { value: '1', label: '高兴' },
        { value: '2', label: '平静' },
        { value: '3', label: '兴奋' },
        { value: '4', label: '疲惫' },
        { value: '5', label: '低落' }
      ],
      analysisSheets: [
        '导出说明', '分析概览', '情绪分布', '每日提交趋势', '提交时段分布',
        '班级活跃度', '每周情绪节奏', '班级情绪对比', '记录习惯',
        '实验类型分布', '高频关键词', '字段口径'
      ]
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.User || {};
    },
    dutyLabel() {
      return { 0: '学生', 1: '班主任', 2: '管理员' }[Number(this.currentUser.duty || 0)] || '未知角色';
    },
    hasPermission() {
      return Number(this.currentUser.duty || 0) >= 1;
    },
    diaryParamsPayload() {
      const params = {
        name: this.diaryParams.name,
        class_name: this.diaryParams.class_name,
        account: this.diaryParams.account,
        mood: this.diaryParams.mood
      };
      if (this.dateRange && this.dateRange.length === 2) {
        params.start_date = this.dateRange[0];
        params.end_date = this.dateRange[1];
      }
      return params;
    },
    analysisParamsPayload() {
      const params = { days: this.analysisParams.days };
      if (this.analysisDateRange && this.analysisDateRange.length === 2) {
        params.start_date = this.analysisDateRange[0];
        params.end_date = this.analysisDateRange[1];
      }
      return params;
    }
  },
  methods: {
    doExportDiary(format) {
      if (!this.hasPermission) {
        this.$message.error('当前账号无数据导出权限');
        return;
      }
      const flag = format === 'csv' ? 'exportingDiaryCsv' : 'exportingDiaryExcel';
      this[flag] = true;
      const task = format === 'csv'
        ? exportServerFile(this.$axios, 'diaries', this.diaryParamsPayload)
        : exportExcel(this.$axios, 'diaries', this.diaryParamsPayload);
      task.then(() => {
        this.$message.success('日记数据导出成功');
      }).catch(error => {
        handleExportError(this, error);
      }).finally(() => {
        this[flag] = false;
      });
    },
    doExportAnalysis(format) {
      if (!this.hasPermission) {
        this.$message.error('当前账号无数据导出权限');
        return;
      }
      if (['excel', 'csv', 'pdf'].indexOf(format) < 0) return;
      const flag = format === 'pdf' ? 'exportingAnalysisPdf'
        : (format === 'csv' ? 'exportingAnalysisCsv' : 'exportingAnalysisExcel');
      this[flag] = true;
      const params = this.analysisParamsPayload;
      let task;
      if (format === 'pdf') {
        task = exportAnalysisPdf(this.$axios, params);
      } else if (format === 'csv') {
        task = exportServerFile(this.$axios, 'analysis', params);
      } else {
        task = exportExcel(this.$axios, 'analysis', params);
      }
      task.then(() => {
        this.$message.success(format === 'pdf' ? 'PDF 分析报告导出成功' : '数据分析结果导出成功');
      }).catch(error => {
        handleExportError(this, error);
      }).finally(() => {
        this[flag] = false;
      });
    }
  }
};
</script>

<style scoped>
.export-container {
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
  color: #303133;
  margin: 0 0 8px;
}

.page-subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.operator-tag {
  color: #606266;
  font-size: 14px;
  background: #f4f4f5;
  border-radius: 20px;
  padding: 8px 16px;
}

.operator-tag i {
  color: #409EFF;
  margin-right: 6px;
}

.export-card,
.info-card {
  margin-bottom: 20px;
  min-height: 480px;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header i {
  color: #409EFF;
  margin-right: 8px;
  font-size: 18px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #606266;
  font-weight: 600;
  margin-bottom: 8px;
}

.dimension-title {
  font-size: 14px;
  color: #606266;
  font-weight: 600;
  margin: 8px 0 12px;
}

.dimension-tags .el-tag {
  margin: 0 8px 8px 0;
}

.export-actions {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #ebeef5;
}

.card-note {
  margin-top: 16px;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 10px 12px;
}

.card-note i {
  color: #409EFF;
  margin-right: 6px;
}

.info-card {
  min-height: 0;
}

.info-text {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.info-text b {
  color: #303133;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .operator-tag {
    margin-top: 12px;
  }
}
</style>
