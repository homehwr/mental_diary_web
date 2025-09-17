import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: null,
    User: {
      uid: '',
      username: '',
      account: '',
      real_class: '',
      grade: '',
      head_img: '',
      duty: '',
      gender: '',
      telephone: '',
      email: '',
    }
  },
  getters: {
    getToken: state => state.token,
    getUserInfo: state => state.User,
  },
  mutations: {
    SET_USER(state, user) {
      state.User = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
    },
    clearUserInfo(state) {
      // 清除用户信息
      state.User = {
        uid: '',
        username: '',
        account: '',
        real_class: '',
        grade: '',
        head_img: '',
        duty: '',
        gender: '',
        telephone: '',
        email: '',
      };
      // 清除 token
      state.token = null;
    },
    UPDATE_USER_IMG(state, img) {
      state.User.head_img = img;
    },
    UPDATE_USER_INFO(state, userInfo) {
      // 更新用户信息
      state.User = { ...state.User, ...userInfo };
    }
  },
  actions: {
    setToken({ commit }, token) {
      commit('SET_TOKEN', token);
    },
    setUser({ commit }, userInfo) {
      commit('SET_USER', userInfo);
    },
    clearUserInfo({ commit }) {
      commit('clearUserInfo');
    },
    updateUserImg({ commit }, img) {
      commit('UPDATE_USER_IMG', img);
    },
    updateUserInfo({ commit }, userInfo) {
      commit('UPDATE_USER_INFO', userInfo);
    }
  },
  plugins: [
    // 添加 vuex-persistedstate 插件
    createPersistedState({
      // 配置选项（可选）
      key: 'vuex_store', // 存储的键名，默认为 'vuex'
      paths: [
        // 指定需要持久化的状态路径
        'token',
        'User'
      ],
      storage: window.localStorage, // 存储位置，默认为 localStorage
      reducer: (state) => ({
        // 自定义持久化内容
        token: state.token,
        User: state.User
      }),
      filter: (mutation) => {
        // 可选：只持久化特定 mutation 的更改
        return true; // 这里持久化所有 mutation
      }
    })
  ],
  modules: {
  }
})