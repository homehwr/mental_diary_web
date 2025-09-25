<template>
  <div id="app" :class="{'mobile-layout': !isManageRoute}">
    <!-- 路由视图容器 -->
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
  }
}
</script>

<style>
/* 移动端全局样式 - 只对非管理路由生效 */
.mobile-layout * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.mobile-layout html, 
.mobile-layout body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", STHeiti, "Microsoft Yahei", Tahoma, Simsun, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f9fa;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.mobile-layout #app {
  min-height: 100vh;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  background-color: #fff;
}
</style>