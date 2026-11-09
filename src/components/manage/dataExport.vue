<template>
  <div class="export-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">数据导出</h1>
        <p class="page-subtitle">导出日记数据与分析结果，服务端统一做权限校验与隐私脱敏</p>
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
              icon="el-icon-folder"
              :loading="exportingDiaryCsv"
              :disabled="!hasPermission"
              @click="doExportDiary('csv')"
            >导出 CSV 压缩包</el-button>
          </div>

          <div class="card-note">
            <i class="el-icon-info"></i>
            导出范围与当前筛选条件一致；标记为私密的日记只保留占位行，不含正文与任何详情。
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
            <span class="form-label">统计区间</span>
            <el-select v-model="analysisParams.days" size="medium" style="width: 100%;">
              <el-option label="最近 7 天" :value="7"></el-option>
              <el-option label="最近 30 天" :value="30"></el-option>
              <el-option label="最近 90 天" :value="90"></el-option>
              <el-option label="最近 180 天" :value="180"></el-option>
            </el-select>
          </div>

          <div class="dimension-title">包含的分析分表</div>
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
            >导出 CSV 压缩包</el-button>
          </div>

          <div class="card-note">
            <i class="el-icon-info"></i>
            全部分析仅基于公开日记独立计算，只输出聚合结果；私密日记仅以条数出现在总量核对中。
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 字段范围 -->
    <el-card class="info-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-document"></i>
        <span>日记数据导出字段范围</span>
      </div>
      <el-table :data="diaryFields" size="small" border style="width: 100%;">
        <el-table-column prop="name" label="字段" width="180"></el-table-column>
        <el-table-column prop="desc" label="说明"></el-table-column>
      </el-table>
      <div class="card-note">完整字段口径也会写入导出文件的《字段口径》工作表。</div>
    </el-card>

    <!-- 隐私规则 -->
    <el-card class="info-card" shadow="hover">
      <div slot="header" class="card-header">
        <i class="el-icon-lock"></i>
        <span>隐私规则</span>
      </div>
      <ol class="privacy-list">
        <li v-for="(rule, index) in privacyRules" :key="index">{{ rule }}</li>
      </ol>
    </el-card>
  </div>
</template>

<script>
import { exportExcel, exportCsvZip, handleExportError } from '@/utils/export';

export default {
  name: 'DataExport',
  data() {
    return {
      dateRange: [],
      diaryParams: {
        name: '',
        class_name: '',
        account: '',
        mood: ''
      },
      analysisParams: {
        days: 30
      },
      exportingDiaryExcel: false,
      exportingDiaryCsv: false,
      exportingAnalysisExcel: false,
      exportingAnalysisCsv: false,
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
      ],
      diaryFields: [
        { name: '日记ID', desc: '记录主键，仅用于核对' },
        { name: '提交时间', desc: 'YYYY-MM-DD HH:MM:SS' },
        { name: '姓名 / 年级 / 班级', desc: '作者基本信息，用于管理核对' },
        { name: '学号(脱敏)', desc: '保留前 4 位与后 2 位，中间掩码' },
        { name: '心情', desc: '高兴 / 平静 / 兴奋 / 疲惫 / 低落' },
        { name: '压力指数 / 积极情绪 / 精力水平', desc: '三项 0-10 的情绪指标' },
        { name: '关联实验', desc: '前端固定实验选项，非自由文本' },
        { name: '今日感悟', desc: '日记正文，仅公开日记输出' },
        { name: '附件数量', desc: '只输出图片张数，不输出图片 URL' },
        { name: '是否私密 / 隐私处理说明', desc: '私密记录的标记与脱敏说明' }
      ],
      privacyRules: [
        '私密日记（仅自己可见）：不导出正文、图片、作者、班级、学号、时间、心情、情绪指标、关联实验等任何详情字段，仅保留一条占位记录与计数。',
        '数据分析只基于公开日记，由导出模块独立计算，不输出任何单条日记的正文、图片或可定位到单篇日记的明细。',
        '高频关键词要求至少出现在 2 篇不同的公开日记中；班级情绪对比要求班级样本数不少于 3，避免小样本反推个人记录。',
        '不导出密码、手机号、邮箱、头像、Token 等账号敏感字段；学号做部分掩码。',
        '所有导出接口都需要有效的登录令牌与后台角色（班主任 / 管理员），导出行为会记录操作者。'
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
        ? exportCsvZip(this.$axios, 'diaries', this.diaryParamsPayload)
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
      const flag = format === 'csv' ? 'exportingAnalysisCsv' : 'exportingAnalysisExcel';
      this[flag] = true;
      const params = { days: this.analysisParams.days };
      const task = format === 'csv'
        ? exportCsvZip(this.$axios, 'analysis', params)
        : exportExcel(this.$axios, 'analysis', params);
      task.then(() => {
        this.$message.success('数据分析结果导出成功');
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
  min-height: 420px;
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

.privacy-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 2;
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
