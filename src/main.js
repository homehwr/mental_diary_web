import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import apiClient from './utils/axios'
import CryptoJS from 'crypto-js'

// 引入 Vant2
import Vant from 'vant'
import 'vant/lib/index.css' // 关键：引入 Vant 样式
Vue.use(Vant)

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.config.productionTip = false

const testUrl = 'http://localhost:8000';

const web = 'http://parliy.com:89/api';

const trueUrl = testUrl;

// const trueUrl = web;

export default trueUrl;

const API_SECRET_KEY = 'BuYaoGaoWoHaoMa-123!@#MMD'
const API_CLIENT_ID = 'vue-frontend-mental-diary'

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 生成时间戳
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).substring(2, 15); // 添加随机数
  
  // 只使用路径部分，不包含查询参数
  const url = new URL(config.url, config.baseURL);
  const path = url.pathname; // 只使用路径，忽略查询参数
  
  // 构建签名字符串 - 只包含方法、路径、时间戳和随机数
  const signString = `${config.method.toUpperCase()}${path}${timestamp}${nonce}`;
  
  const signature = CryptoJS.HmacSHA256(signString, API_SECRET_KEY).toString();
  
  // 添加安全头
  config.headers['X-API-Client'] = API_CLIENT_ID;
  config.headers['X-API-Timestamp'] = timestamp;
  config.headers['X-API-Signature'] = signature;
  config.headers['X-API-Nonce'] = nonce;
  
  // 添加 CSRF 令牌
  const csrftoken = getCookie('csrftoken');
  if (csrftoken) {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  
  // 调试输出
  // console.log("Frontend sign string:", signString);
  // console.log("Frontend signature:", signature);
  
  return config;
}, function (error) {
  return Promise.reject(error);
});

// 获取 cookie 函数
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

axios.defaults.withCredentials = true; // 跨域请求发送cookies
Vue.prototype.$axios = axios;
Vue.prototype.$apiClient = apiClient;

axios.defaults.baseURL = trueUrl;
// 定义全局变量（后端路由），通过this.$apiUrl访问
Vue.prototype.$apiUrl = trueUrl;


new Vue({
  router,
  store,
  el: '#app',
  render: h => h(App)
}).$mount('#app')
