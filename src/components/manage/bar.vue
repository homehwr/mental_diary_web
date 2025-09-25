<template>
  <div class="admin-container">
    <!-- 顶部导航栏 -->
    <div class="header-nav">
      <div class="header-left">
        <img src="@/assets/wdxy.jpg" alt="物电学院Logo" class="university-logo">
        <div class="logo">
          <i class="el-icon-s-platform logo-icon"></i>
        </div>
        <div class="system-title">格致心灵日记后台管理系统</div>
      </div>
      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar">
            <i class="el-icon-user-solid"></i>
          </div>
          <span class="user-name">管理员</span>
          <el-dropdown>
            <span class="el-dropdown-link">
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-container">
      <!-- 侧边栏菜单 -->
      <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :collapse="isCollapsed"
          :collapse-transition="false"
          router
        >
          <el-menu-item index="/manage/index">
            <i class="el-icon-s-home"></i>
            <span slot="title">控制面板</span>
          </el-menu-item>
          
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-s-custom"></i>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/manage/user/list">用户列表</el-menu-item>
            <el-menu-item index="/manage/user/statistics">用户统计</el-menu-item>
          </el-submenu>
          
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-notebook-2"></i>
              <span>日记管理</span>
            </template>
            <el-menu-item index="/manage/diaryList">日记列表</el-menu-item>
            <el-menu-item index="/manage/diary/analysis">日记分析</el-menu-item>
          </el-submenu>
          
          <el-submenu index="4">
            <template slot="title">
              <i class="el-icon-s-marketing"></i>
              <span>数据统计</span>
            </template>
            <el-menu-item index="/manage/statistics/overview">数据概览</el-menu-item>
            <el-menu-item index="/manage/statistics/trend">趋势分析</el-menu-item>
          </el-submenu>
          
          <el-menu-item index="/manage/settings">
            <i class="el-icon-setting"></i>
            <span slot="title">系统设置</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <div class="collapse-btn" @click="toggleCollapse">
          <i :class="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </div>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  data() {
    return {
      isCollapsed: false,
      activeMenu: '/manage/index'
    };
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    }
  },
  mounted() {
    this.activeMenu = this.$route.path;
  },
  watch: {
    $route(to) {
      this.activeMenu = to.path;
    }
  }
};
</script>

<style scoped>
/* 整体布局样式 */
.admin-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏样式 */
.header-nav {
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.logo-icon {
  font-size: 24px;
  color: white;
}

.system-title {
  font-size: 25px;
  font-weight: bold;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.user-name {
  font-size: 14px;
  margin-right: 8px;
}

/* 主体内容区域样式 */
.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #304156;
  width: 200px;
  height: 100%;
  transition: width 0.3s;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar::-webkit-scrollbar {
  width: 0;
}

.el-menu {
  border-right: none;
}

.el-menu:not(.el-menu--collapse) {
  width: 200px;
}

/* 内容区域样式 */
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
  position: relative;
}

.collapse-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  font-size: 22px;
  cursor: pointer;
  z-index: 100;
  color: #409EFF;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.collapse-btn:hover {
  background-color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    z-index: 100;
    height: calc(100% - 60px);
  }
  
  .sidebar.collapsed {
    width: 0;
  }
  
  .system-title {
    font-size: 16px;
  }
}

.university-logo {
  height: 45px;
  max-width: 100%;
  border-radius: 8px;
  object-fit: contain;
  margin-right: 110px;
}
</style>