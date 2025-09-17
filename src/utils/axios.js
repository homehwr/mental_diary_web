// src/utils/axios.js
import axios from 'axios';
import trueUrl from './../main.js'


// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: trueUrl,
  timeout: 10000, // 请求超时时间
});

// 请求拦截器 - 添加 Authorization 头
apiClient.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('auth_token');
    
    // 如果 token 存在，添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理全局错误
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 处理 401 未授权错误
    if (error.response && error.response.status === 401) {
      // 清除 token 并重定向到登录页
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;