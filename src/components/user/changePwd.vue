<template>
  <div class="change-password-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="修改密码"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
      class="app-nav-bar"
    />
    
    <!-- 加载动画 -->
    <div class="loading-overlay" v-if="loading">
      <van-loading size="24px" color="#3498db" vertical>加载中...</van-loading>
    </div>
    
    <div style="padding: 16px;">
        <!-- 密码修改表单 -->
        <div class="password-form" v-if="!loading">
        <div class="form-header">
            <van-icon name="lock" size="48px" color="#3498db" />
            <h2>修改密码</h2>
            <p>请填写以下信息修改您的密码</p>
        </div>
        
        <van-form @submit="submitPasswordChange">
            <!-- 旧密码 -->
            <van-field
            v-model="oldPassword"
            label="旧密码"
            placeholder="请输入当前密码"
            :type="showOldPassword ? 'text' : 'password'"
            :rules="[{ required: true, message: '请输入旧密码' }]"
            >
            <template #right-icon>
                <van-icon 
                :name="showOldPassword ? 'eye-o' : 'closed-eye'" 
                @click="showOldPassword = !showOldPassword" 
                />
            </template>
            </van-field>
            
            <!-- 新密码 -->
            <van-field
            v-model="newPassword"
            label="新密码"
            placeholder="请输入新密码"
            :type="showNewPassword ? 'text' : 'password'"
            :rules="[
                { required: true, message: '请输入新密码' },
                { validator: validatePassword, message: '密码需包含字母和数字，长度6-20位' }
            ]"
            >
            <template #right-icon>
                <van-icon 
                :name="showNewPassword ? 'eye-o' : 'closed-eye'" 
                @click="showNewPassword = !showNewPassword" 
                />
            </template>
            </van-field>
            
            <!-- 确认新密码 -->
            <van-field
            v-model="confirmPassword"
            label="确认密码"
            placeholder="请再次输入新密码"
            :type="showConfirmPassword ? 'text' : 'password'"
            :rules="[
                { required: true, message: '请确认新密码' },
                { validator: validateConfirmPassword, message: '两次输入的密码不一致' }
            ]"
            >
            <template #right-icon>
                <van-icon 
                :name="showConfirmPassword ? 'eye-o' : 'closed-eye'" 
                @click="showConfirmPassword = !showConfirmPassword" 
                />
            </template>
            </van-field>
            
            <!-- 密码强度提示 -->
            <div class="password-strength">
            <div class="strength-bar" :class="strengthClass"></div>
            <div class="strength-text">{{ strengthText }}</div>
            </div>
            
            <!-- 提交按钮 -->
            <div class="submit-button">
            <van-button 
                round 
                block 
                type="primary" 
                native-type="submit"
                :loading="submitting"
                loading-text="提交中..."
            >
                确认修改
            </van-button>
            </div>
        </van-form>
        </div>
        
        <!-- 密码要求提示 -->
        <div class="password-tips">
        <h3>密码要求：</h3>
        <ul>
            <li>长度在6-20个字符之间</li>
            <li>必须包含字母和数字</li>
            <li>可以使用特殊字符（如@、#、$等）</li>
            <li>避免使用过于简单的密码</li>
        </ul>
        </div>
    </div>

  </div>
</template>

<script>
import { NavBar, Icon, Button, Field, Form, Loading } from 'vant';

export default {
  components: {
    [NavBar.name]: NavBar,
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Field.name]: Field,
    [Form.name]: Form,
    [Loading.name]: Loading
  },
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      loading: false,
      submitting: false
    };
  },
  computed: {
    // 密码强度计算
    passwordStrength() {
      if (!this.newPassword) return 0;
      
      let strength = 0;
      const length = this.newPassword.length;
      
      // 长度评分
      if (length >= 8) strength += 1;
      if (length >= 12) strength += 1;
      
      // 包含数字
      if (/\d/.test(this.newPassword)) strength += 1;
      
      // 包含字母
      if (/[a-zA-Z]/.test(this.newPassword)) strength += 1;
      
      // 包含特殊字符
      if (/[^a-zA-Z0-9]/.test(this.newPassword)) strength += 1;
      
      return strength;
    },
    
    // 密码强度文本
    strengthText() {
      const strength = this.passwordStrength;
      if (strength === 0) return '无';
      if (strength <= 2) return '弱';
      if (strength <= 4) return '中等';
      return '强';
    },
    
    // 密码强度样式
    strengthClass() {
      const strength = this.passwordStrength;
      if (strength === 0) return '';
      if (strength <= 2) return 'weak';
      if (strength <= 4) return 'medium';
      return 'strong';
    }
  },
  methods: {
    // 密码格式验证
    validatePassword() {
      if (!this.newPassword) return false;
      
      // 长度验证
      if (this.newPassword.length < 6 || this.newPassword.length > 20) {
        return false;
      }
      
      // 必须包含字母和数字
      if (!/[a-zA-Z]/.test(this.newPassword) || !/\d/.test(this.newPassword)) {
        return false;
      }
      
      return true;
    },
    
    // 确认密码验证
    validateConfirmPassword() {
      return this.newPassword === this.confirmPassword;
    },
    
    // 提交密码修改
    submitPasswordChange() {
      this.submitting = true;
      
      // 模拟API请求
        this.submitting = false;
        
        // 实际项目中应调用API修改密码
        this.$axios.post(`/user/setPassword?uid=${this.$store.state.User.uid}`, {
            oldPassword: this.oldPassword,
            newPassword: this.newPassword
        }).then((res) => {
            if (res.status == 400){
                this.$toast.fail(res.response.data.message);
            }
            console.log(res);
            this.$toast.success('密码修改成功');
            this.$router.go(-1);
        }).catch(error => {
          console.error('修改密码失败', error.response.data.message);
          this.$toast.fail('修改密码失败：' + error.response.data.message);
        });
        
        // 模拟成功
        // this.$toast.success('密码修改成功');
        // this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.change-password-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: 100vh;
  /* padding: 16px; */
}

/* 顶部导航栏 */
.app-nav-bar {
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
}

.app-nav-bar /deep/ .van-nav-bar__title,
.app-nav-bar /deep/ .van-nav-bar__text,
.app-nav-bar /deep/ .van-icon {
  color: white !important;
}

/* 加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

/* 表单头部 */
.form-header {
  text-align: center;
  margin: 30px 0;
}

.form-header h2 {
  margin: 16px 0 8px;
  color: #2c3e50;
  font-size: 24px;
}

.form-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

/* 密码表单 */
.password-form {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 密码强度指示器 */
.password-strength {
  margin: 20px 0 30px;
}

.strength-bar {
  height: 6px;
  border-radius: 3px;
  background: #ebedf0;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.5s ease;
}

.strength-bar.weak::after {
  width: 30%;
  background: #e74c3c;
}

.strength-bar.medium::after {
  width: 60%;
  background: #f39c12;
}

.strength-bar.strong::after {
  width: 100%;
  background: #2ecc71;
}

.strength-text {
  text-align: right;
  font-size: 14px;
  color: #7f8c8d;
}

/* 提交按钮 */
.submit-button {
  margin-top: 20px;
}

.submit-button .van-button {
  background: linear-gradient(135deg, #3498db, #2ecc71);
  border: none;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  height: 50px;
  font-size: 16px;
  font-weight: bold;
}

/* 密码要求提示 */
.password-tips {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.password-tips h3 {
  margin: 0 0 12px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 500;
}

.password-tips ul {
  margin: 0;
  padding-left: 20px;
}

.password-tips li {
  margin-bottom: 8px;
  color: #7f8c8d;
  font-size: 14px;
}

.password-tips li:last-child {
  margin-bottom: 0;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .form-header {
    margin: 20px 0;
  }
  
  .form-header h2 {
    font-size: 20px;
  }
  
  .password-form {
    padding: 16px;
  }
  
  .submit-button .van-button {
    height: 46px;
    font-size: 15px;
  }
}
</style>