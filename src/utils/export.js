// src/utils/export.js
// 管理员后台数据导出：统一封装导出接口调用、XLSX 生成与文件下载。
// 权限校验与隐私脱敏全部在服务端完成，这里只负责展示与落盘。
import * as XLSX from 'xlsx';

const DIARIES_PATH = '/export/diaries';
const ANALYSIS_PATH = '/export/analysis';
const OVERVIEW_PATH = '/export/analysis-overview';
const PDF_PATH = '/export/analysis-pdf';

// 登录后 token 存于 localStorage.token；兼容旧版 auth_token
function authHeaders() {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  return token ? { Authorization: 'Bearer ' + token } : {};
}

// 空值不传给后端，避免 Ninja 把 '' 解析成非法的 int 参数
function cleanParams(params) {
  const result = {};
  Object.keys(params || {}).forEach(key => {
    const value = params[key];
    if (value === '' || value === null || value === undefined) return;
    result[key] = value;
  });
  return result;
}

function timeStamp() {
  const d = new Date();
  const pad = n => (n < 10 ? '0' + n : '' + n);
  return '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate())
    + '_' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
}

function errorMessage(data, fallback) {
  return (data && data.message) || fallback;
}

/** 获取服务端已完成权限校验与隐私脱敏的导出数据 */
export function fetchExportPayload(axiosInstance, path, params) {
  return axiosInstance.get(path, {
    params: cleanParams(params),
    headers: authHeaders()
  }).then(res => {
    if (!res.data || res.data.success === false) {
      throw new Error(errorMessage(res.data, '导出数据获取失败'));
    }
    return res.data;
  });
}

/** 把服务端返回的 sheets 结构组装成多工作表工作簿 */
export function buildWorkbook(payload) {
  const workbook = XLSX.utils.book_new();
  (payload.sheets || []).forEach(sheet => {
    const columns = sheet.columns || [];
    const header = {};
    columns.forEach(column => { header[column.label] = ''; });

    const data = (sheet.rows || []).map(row => {
      const item = {};
      columns.forEach(column => {
        const value = row[column.key];
        item[column.label] = (value === undefined || value === null) ? '' : value;
      });
      return item;
    });

    const worksheet = XLSX.utils.json_to_sheet(data.length ? data : [header]);
    worksheet['!cols'] = columns.map(column => ({
      wch: Math.min(60, Math.max(12, column.label.length * 2 + 8))
    }));
    XLSX.utils.book_append_sheet(workbook, worksheet, (sheet.name || '分表').slice(0, 31));
  });
  return workbook;
}

/** 导出为 XLSX（Excel / WPS 可直接打开） */
export function exportExcel(axiosInstance, type, params) {
  const path = type === 'analysis' ? ANALYSIS_PATH : DIARIES_PATH;
  return fetchExportPayload(axiosInstance, path, params).then(payload => {
    XLSX.writeFile(buildWorkbook(payload), payload.file_name || ('格致心灵日记_导出_' + timeStamp() + '.xlsx'));
    return payload;
  });
}

/** 服务端直出的文件下载（CSV / ZIP / PDF 共用） */
function downloadServerFile(axiosInstance, path, params, filename) {
  return axiosInstance.get(path, {
    params: cleanParams(params),
    headers: authHeaders(),
    responseType: 'blob'
  }).then(res => new Promise((resolve, reject) => {
    const blob = res.data;
    const blobType = blob && blob.type ? blob.type : '';
    // 后端鉴权失败或生成失败时返回 JSON，需要解析出具体提示
    if (blobType.indexOf('application/json') >= 0) {
      const reader = new FileReader();
      reader.onload = () => {
        let message = '导出失败';
        try { message = errorMessage(JSON.parse(reader.result), message); } catch (e) { /* 忽略 */ }
        reject(new Error(message));
      };
      reader.onerror = () => reject(new Error('导出失败'));
      reader.readAsText(blob);
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    resolve(filename);
  }));
}

/**
 * 服务端直出通道：日记导出为单个 CSV，分析报告为多分表 CSV 压缩包。
 * 不依赖前端组装，便于脚本与归档使用。
 */
export function exportServerFile(axiosInstance, type, params) {
  const isAnalysis = type === 'analysis';
  const path = isAnalysis ? ANALYSIS_PATH : DIARIES_PATH;
  const label = isAnalysis ? '分析报告' : '日记数据';
  const ext = isAnalysis ? 'zip' : 'csv';
  return downloadServerFile(
    axiosInstance,
    path,
    Object.assign({}, params, { format: 'csv' }),
    '格致心灵日记_' + label + '_' + timeStamp() + '.' + ext
  );
}

/** 带图表的多页 PDF 分析报告（服务端生成） */
export function exportAnalysisPdf(axiosInstance, params) {
  return downloadServerFile(
    axiosInstance,
    PDF_PATH,
    params,
    '格致心灵日记_分析报告_' + timeStamp() + '.pdf'
  );
}

/** 数据分析页展示用的新增分析维度 */
export function fetchAnalysisOverview(axiosInstance, params) {
  const query = (typeof params === 'number') ? { days: params } : (params || {});
  return axiosInstance.get(OVERVIEW_PATH, {
    params: cleanParams(query),
    headers: authHeaders()
  }).then(res => {
    if (!res.data || res.data.success === false) {
      throw new Error(errorMessage(res.data, '分析数据获取失败'));
    }
    return res.data;
  });
}

/** 统一处理导出错误提示 */
export function handleExportError(vm, error) {
  const message = (error && error.response && error.response.data && error.response.data.message)
    || (error && error.message) || '导出失败，请稍后重试';
  if (vm && vm.$message) vm.$message.error(message);
  return message;
}
