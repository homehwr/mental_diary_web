<template>
  <div class="admin-container">
    <!-- 顶部导航栏 -->
    <div class="header-nav">
      <div class="header-left">
        <img src="@/assets/wdxy.png" alt="物电学院Logo" class="university-logo">
        <div class="mobile-menu-btn" @click="toggleMobileMenu">
          <i class="el-icon-s-fold"></i>
        </div>
        <div class="logo">
          <i class="el-icon-s-platform logo-icon"></i>
        </div>
        <div class="system-title">格致心灵日记后台管理系统</div>
      </div>
      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar">
            <van-image v-if="$store.state.User.head_img"
              round
              width="50px"
              :src="$store.state.User.head_img || defaultAvatar"
            />
            <i v-else class="el-icon-user-solid"></i>
          </div>
          <span class="user-name">{{ $store.state.User.username }}</span>
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 侧边栏遮罩层 -->
    <div class="sidebar-overlay" :class="{ 'mobile-open': mobileMenuOpen }" @click="closeMobileMenu"></div>

    <!-- 主体内容区域 -->
    <div class="main-container">
      <!-- 侧边栏菜单 -->
      <div class="sidebar" :class="{ 'collapsed': isCollapsed, 'mobile-open': mobileMenuOpen }">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          :collapse="isCollapsed"
          :collapse-transition="false"
          router
          @select="closeMobileMenu"
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
            <el-menu-item index="/manage/UserList">用户列表</el-menu-item>
            <el-menu-item index="">用户统计</el-menu-item>
          </el-submenu>
          
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-notebook-2"></i>
              <span>日记管理</span>
            </template>
            <el-menu-item index="/manage/diaryList">日记列表</el-menu-item>
            <el-menu-item index="/manage/concern">重点学生关照</el-menu-item>
          </el-submenu>
          
          <el-submenu index="4">
            <template slot="title">
              <i class="el-icon-s-marketing"></i>
              <span>数据统计</span>
            </template>
            <el-menu-item index="/manage/statistics">日记数据分析</el-menu-item>
          </el-submenu>
          
          <el-menu-item index="">
            <i class="el-icon-setting"></i>
            <span slot="title">系统设置</span>
          </el-menu-item>

          <el-menu-item index="/">
            <i class="el-icon-mobile-phone"></i>
            <span slot="title">返回主页面</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <div class="collapse-btn" @click="toggleCollapse">
          <i :class="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"></i>
        </div>
        <div class="content-area">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Image } from 'vant';

export default {
  name: 'AdminLayout',
  components: {
    [Image.name]: Image,
  },
  data() {
    return {
      isCollapsed: false,
      activeMenu: '/manage/index',
      mobileMenuOpen: false
    };
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
    },
    handleCommand(command) {
      if (command === 'logout') {
        this.logout();
      } else if (command === 'profile') {
        this.$message.info('个人中心功能开发中');
      }
    },
    logout() {
      this.$confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.clearUserInfo();
        localStorage.removeItem('token');
        this.$router.push('/login');
        this.$message.success('退出成功');
      }).catch(() => {
        this.$message.info('已取消退出');
      });
    },
    clearUserInfo() {
      this.$store.commit('SET_USER', null);
      this.$store.commit('SET_TOKEN', null);
    },
  },
  mounted() {
    if (!this.$store.state.User.duty){
      this.$message.error("您当前无权限进入管理后台！");
      this.$router.push('/');
      return; 
    }
    this.activeMenu = this.$route.path;
  },
  watch: {
    $route(to) {
      this.activeMenu = to.path;
      this.closeMobileMenu();
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
  background-color: #f5f7fa;
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
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  position: relative;
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
  transition: all 0.3s ease;
}

.logo:hover {
  transform: rotate(15deg);
  background-color: rgba(255, 255, 255, 0.3);
}

.logo-icon {
  font-size: 24px;
  color: white;
}

.system-title {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 1px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 30px;
  transition: all 0.3s ease;
  position: relative;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.user-info:hover .user-avatar {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.8);
}

.user-avatar i {
  font-size: 24px;
  color: white;
}

.user-name {
  font-size: 16px;
  margin-right: 10px;
  font-weight: 500;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  transition: transform 0.3s;
}

.user-info:hover .el-dropdown-link {
  transform: translateY(1px);
}

/* 主体内容区域样式 */
.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #304156;
  width: 220px;
  height: 100%;
  transition: all 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
}

.el-menu {
  border-right: none;
  transition: all 0.3s ease;
}

.el-menu:not(.el-menu--collapse) {
  width: 220px;
}

.el-menu-item, .el-submenu__title {
  height: 56px;
  line-height: 56px;
  transition: all 0.2s;
}

.el-menu-item:hover, .el-submenu__title:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* .el-menu-item.is-active {
  background-color: #6ecfea !important;
  color: white !important;
} */

.el-menu-item i, .el-submenu__title i {
  margin-right: 12px;
  font-size: 18px;
}

/* 内容区域样式 */
.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: #f0f2f5;
  position: relative;
  transition: all 0.3s ease;
}

.collapse-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 24px;
  cursor: pointer;
  z-index: 100;
  color: #409EFF;
  background-color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
  color: #67c23a;
}

.content-area {
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-top: 50px;
  min-height: 400px;
  animation: fadeIn 0.5s ease;
}

.university-logo {
  height: 45px;
  max-width: 100%;
  border-radius: 8px;
  object-fit: contain;
  margin-right: 15px;
  transition: all 0.3s ease;
}

.university-logo:hover {
  transform: scale(1.05);
}

.mobile-menu-btn {
  display: none;
  font-size: 24px;
  cursor: pointer;
  margin-right: 15px;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .system-title {
    font-size: 18px;
  }
  
  .user-name {
    display: none;
  }
  
  .content {
    padding: 20px 15px;
  }
}

@media (max-width: 768px) {
  .header-nav {
    padding: 0 15px;
  }
  
  .system-title {
    font-size: 16px;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .sidebar {
    position: fixed;
    left: -220px;
    top: 60px;
    height: calc(100% - 60px);
    z-index: 999;
    transition: left 0.3s ease;
  }
  
  .sidebar.mobile-open {
    left: 0;
  }
  
  .sidebar-overlay.mobile-open {
    display: block;
  }
  
  .sidebar.collapsed {
    width: 0;
    left: -64px;
  }
  
  .content {
    padding: 15px;
  }
  
  .collapse-btn {
    display: none;
  }
  
  .user-info {
    padding: 5px 10px;
  }
}

@media (max-width: 480px) {
  .header-left {
    flex-wrap: wrap;
  }
  
  .system-title {
    font-size: 14px;
  }
  
  .university-logo {
    height: 35px;
    margin-right: 10px;
  }
  
  .logo {
    width: 35px;
    height: 35px;
    margin-right: 10px;
  }
  
  .logo-icon {
    font-size: 20px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>