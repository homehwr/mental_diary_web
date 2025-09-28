<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    isManageRoute() {
      return this.$route.path.startsWith('/manage');
    }
  },
  watch: {
    isManageRoute: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          document.body.classList.remove('mobile-layout');
          document.body.classList.add('manage-layout');
        } else {
          document.body.classList.remove('manage-layout');
          document.body.classList.add('mobile-layout');
        }
      }
    }
  },
  mounted() {
    // 初始化设置
    if (this.isManageRoute) {
      document.body.classList.add('manage-layout');
    } else {
      document.body.classList.add('mobile-layout');
    }
  }
}
</script>

<style>
/* 管理路由样式 */
.manage-layout {
  /* 管理后台的样式 */
}

/* 移动端样式 */
.mobile-layout {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", STHeiti, "Microsoft Yahei", Tahoma, Simsun, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.mobile-layout * {
  /* margin: 0;
  padding: 0; */
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.mobile-layout #app {
  min-height: 100vh;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  background-color: #fff;
}
</style>