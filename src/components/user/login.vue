<template>
  <div class="login-page">
    <!-- 顶部装饰元素 -->
    <div class="decoration-top">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>
    
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 应用Logo和名称 -->
      <div class="app-header">
        <div class="app-logo">
          <van-icon name="flower-o" size="50px" color="#3498db" />
        </div>
        <h1 class="app-name">格致心灵日记</h1>
        <p class="app-subtitle">记录成长每一刻</p>
      </div>
      
      <!-- 登录表单 -->
      <div class="login-form">
        <!-- 学号输入 -->
        <van-field
          v-model="userInfo.account"
          label="学号"
          placeholder="请输入学号"
          left-icon="user-o"
          clearable
          :border="false"
        />
        
        <!-- 密码输入 -->
        <van-field
          v-model="userInfo.password"
          label="密码"
          placeholder="请输入密码"
          type="password"
          left-icon="lock"
          clearable
          :border="false"
        />
        
        <!-- 验证码 -->
        <div class="captcha-container">
          <van-field
            v-model="userInfo.code"
            label="验证码"
            placeholder="请输入验证码"
            left-icon="shield-o"
            :border="false"
          />
          <div class="captcha-image" @click="refreshCaptcha">
            <img :src="captchaImage" alt="验证码图片">
          </div>
        </div>
        
        <!-- 记住密码和忘记密码 -->
        <div class="remember-forgot">
          <van-checkbox v-model="rememberPassword" shape="square" icon-size="16px">
            记住密码
          </van-checkbox>
          <a href="#" class="forgot-password">忘记密码?</a>
        </div>
        
        <!-- 登录按钮 -->
        <van-button 
          round 
          block 
          type="primary" 
          size="large" 
          @click="handleLogin"
          class="login-button"
          :loading="isLogging"
          loading-text="登录中..."
        >
          登录
        </van-button>
        
        <!-- 注册提示 -->
        <div class="register-tip">
          还没有账号? <a href="#" class="register-link">立即注册</a>
        </div>
        <div class="register-tip" style="font-size: smaller;">提示：初始密码是姓名首字母大写@学号，登录后可修改</div>
        <div class="register-tip" style="font-size: smaller; margin-top:0">例如小明学号是1234，密码：XM@1234</div>
      </div>
    </div>
    
    <!-- 底部装饰元素 -->
    <div class="decoration-bottom">
      <div class="circle circle1"></div>
      <div class="circle circle2"></div>
      <div class="circle circle3"></div>
    </div>
    
    <!-- 底部版权信息 -->
    <div class="footer">
      <p>© 2025 赣南师范大学物理与电子信息学院</p>
    </div>
  </div>
</template>

<script>
import { Field, Button, Checkbox, Icon, Toast } from 'vant';

export default {
  components: {
    [Field.name]: Field,
    [Button.name]: Button,
    [Checkbox.name]: Checkbox,
    [Icon.name]: Icon
  },
  data() {
    return {
      rememberPassword: false,
      captchaImage: this.$apiUrl + '/image/code?' + Date.now(),
      userInfo: {
        account: "",
        password: "",
        code: ""
      },
      isLogging: false
    };
  },
  created() {
    console.log(localStorage.getItem('token'));
    if (localStorage.getItem('token')){
      this.getExistToken();
    }
    
  },
  mounted(){
    // console.log('token: '+ JSON.parse(localStorage.getItem('token')));
  },
  methods: {
    handleLogin() {
      // 表单验证
      if (!this.userInfo.account) {
        Toast.fail('请输入学号');
        return;
      }
      
      if (!this.userInfo.password) {
        Toast.fail('请输入密码');
        return;
      }
      
      if (!this.userInfo.code) {
        Toast.fail('请输入验证码');
        return;
      }
      
      this.isLogging = true;
      
      this.$axios({
        method: "post",
        url: "/login/",
        data: {
          account: this.userInfo.account,
          password: this.userInfo.password,
          code: this.userInfo.code,
          remember: this.rememberPassword
        },
      })
      .then(res => {
        this.isLogging = false;
        
        if (res.data.status === "error") {
          Toast.fail(res.data.message);
          
          if (res.data.message === '验证码已过期，请重新获取！') {
            this.refreshCaptcha();
          }
        } else if (res.data.status === 'success') {
          const data = res.data.data;
          this.setStoreState(data);
          this.$axios.post('/stats/record-visit');
          Toast.success('登录成功！欢迎 ' + data.username);
          
          this.$router.push('/');
        }
      })
      .catch(error => {
        this.isLogging = false;
        Toast.fail('登录请求失败，请重试');
        console.error('登录请求失败:', error);
      });
    },
    
    refreshCaptcha() {
      // 添加时间戳防止缓存
      this.captchaImage = this.$apiUrl + '/image/code?' + Date.now();
    },
    
    getExistToken() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          this.$axios.get(`/user/getToken?token=${token}`)
          .then(res => {
            this.setStoreState(res.data);
            this.$router.push('/');
          })
        } catch (error) {
          console.error('获取Token失败:', error);
        }
      }
    },
    
    setStoreState(data) {
      this.$store.commit('SET_USER', {  
        uid: data.uid,  
        username: data.username,  
        account: data.account,  
        real_class: data.real_class,  
        grade: data.grade,  
        head_img: data.head_img,  
        duty: data.duty,  
        gender: data.gender,  
        telephone: data.telephone,  
        email: data.email,  
      });  
      this.$store.commit('SET_TOKEN', data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
  }
};
</script>

<style scoped>
.login-page {
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 装饰元素 */
.decoration-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 150px;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100px;
  background-size: 50% 100px;
}

.wave1 {
  background: radial-gradient(ellipse at center, rgba(52, 152, 219, 0.2) 0%, rgba(52, 152, 219, 0) 70%);
  animation: wave-animation 10s linear infinite;
}

.wave2 {
  background: radial-gradient(ellipse at center, rgba(46, 204, 113, 0.2) 0%, rgba(46, 204, 113, 0) 70%);
  animation: wave-animation 8s linear infinite;
  animation-delay: -2s;
  bottom: 20px;
}

.wave3 {
  background: radial-gradient(ellipse at center, rgba(155, 89, 182, 0.1) 0%, rgba(155, 89, 182, 0) 70%);
  animation: wave-animation 12s linear infinite;
  animation-delay: -4s;
  bottom: 40px;
}

.decoration-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
}

.circle1 {
  width: 200px;
  height: 200px;
  background: rgba(52, 152, 219, 0.1);
  bottom: -100px;
  left: -50px;
}

.circle2 {
  width: 150px;
  height: 150px;
  background: rgba(46, 204, 113, 0.1);
  bottom: -75px;
  right: 30px;
}

.circle3 {
  width: 100px;
  height: 100px;
  background: rgba(155, 89, 182, 0.1);
  bottom: 20px;
  right: -50px;
}

/* 登录卡片 */
.login-card {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  padding: 30px 25px;
  z-index: 10;
  position: relative;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
}

.app-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(46, 204, 113, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.app-name {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
  font-weight: bold;
}

.app-subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 5px 0 0;
}

/* 登录表单 */
.login-form {
  margin-top: 20px;
}

.van-field {
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 15px;
  padding: 12px 16px;
  border: 1px solid #ebedf0;
  transition: all 0.3s ease;
}

.van-field:focus-within {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.login-form ::v-deep .van-field__label {
  flex: 0 0 45px !important;
  max-width: 45px !important;
  color: #2c3e50;
}

.van-field__control {
  color: #34495e;
}

/* 验证码容器 */
.captcha-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.captcha-container .van-field {
  flex: 1;
  margin-right: 10px;
  margin-bottom: 0;
}

.captcha-image {
  width: 120px;
  height: 44px;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ebedf0;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.captcha-image:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 记住密码和忘记密码 */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.van-checkbox {
  color: #7f8c8d;
  font-size: 14px;
}

.forgot-password {
  color: #3498db;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* 登录按钮 */
.login-button {
  background: linear-gradient(to right, #3498db, #2ecc71);
  border: none;
  height: 50px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* 注册提示 */
.register-tip {
  text-align: center;
  margin-top: 15px;
  color: #7f8c8d;
  font-size: 14px;
}

.register-link {
  color: #3498db;
  text-decoration: none;
  margin-left: 5px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.register-link:hover {
  text-decoration: underline;
}

/* 底部版权信息 */
.footer {
  position: absolute;
  bottom: 20px;
  text-align: center;
  width: 100%;
  color: #7f8c8d;
  font-size: 12px;
  z-index: 10;
}

/* 动画效果 */
@keyframes wave-animation {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .login-card {
    padding: 25px 20px;
  }
  
  .app-logo {
    width: 70px;
    height: 70px;
  }
  
  .app-name {
    font-size: 22px;
  }
  
  .captcha-container .van-field {
    flex: 1;
  }
  
  .captcha-image {
    width: 92px;
  }
}
</style>