import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import apiClient from './utils/axios'

// 引入 Vant2
import Vant from 'vant'
import 'vant/lib/index.css' // 关键：引入 Vant 样式
Vue.use(Vant)

Vue.config.productionTip = false

const testUrl = 'http://localhost:8000';

const web = 'http://42.194.183.221:89/api';

// const trueUrl = testUrl;

const trueUrl = web;

export default trueUrl;

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  const csrftoken = getCookie('csrftoken'); // 获取 CSRF 令牌
  config.headers['X-CSRFToken'] = csrftoken; // 设置 CSRF 令牌`
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
      // Does this cookie string begin with the name we want?
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
  render: h => h(App)
}).$mount('#app')
