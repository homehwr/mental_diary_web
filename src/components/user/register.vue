<template>
    <div>
        <!-- 顶部导航栏 -->
        <van-nav-bar
            title="用户注册"
            left-text="返回"
            left-arrow
            @click-left="$router.go(-1)"
            class="app-nav-bar"
        />
        <div class="register-page">
            
            <!-- 注册表单卡片 -->
            <div class="register-card">
            <div class="card-header">
                <h2>创建新账户</h2>
                <p>请填写以下信息完成注册</p>
            </div>
            
            <van-form @submit="onSubmit" class="register-form">
                <!-- 姓名 -->
                <van-field
                v-model="formData.name"
                name="姓名"
                label="姓名"
                placeholder="请输入真实姓名"
                :rules="[{ required: true, message: '请填写姓名' }]"
                left-icon="contact"
                />
                
                <!-- 班级 -->
                <van-field
                v-model="formData.class"
                name="班级"
                label="班级"
                placeholder="例如：物理学(公费师范)2201"
                :rules="[{ required: true, message: '请填写班级' }]"
                left-icon="friends-o"
                />
                
                <!-- 年级 -->
                <van-field
                v-model="formData.grade"
                name="年级"
                label="年级"
                placeholder="例如：2022"
                :rules="[{ required: true, message: '请填写年级' }]"
                left-icon="bars"
                />
                
                <!-- 学号 -->
                <van-field
                v-model="formData.studentId"
                name="学号"
                label="学号"
                placeholder="请输入学号"
                :rules="[{ required: true, message: '请填写学号' }]"
                left-icon="idcard"
                />
                
                <!-- 性别 -->
                <van-field
                name="性别"
                label="性别"
                class="gender-field"
                >
                <template #input>
                    <van-radio-group v-model="formData.gender" direction="horizontal">
                    <van-radio name="1" icon-size="18px">男</van-radio>
                    <van-radio name="2" icon-size="18px">女</van-radio>
                    </van-radio-group>
                </template>
                </van-field>
                
                <!-- 密码 -->
                <van-field
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                name="密码"
                label="密码"
                placeholder="请设置登录密码（字母+数字）"
                :rules="[
                    { required: true, message: '请设置密码' },
                    { validator: validatePasswordStrength, message: '密码需包含字母和数字' }
                ]"
                left-icon="lock"
                >
                <template #right-icon>
                    <van-icon 
                    :name="showPassword ? 'eye-o' : 'closed-eye'" 
                    size="18"
                    @click="showPassword = !showPassword"
                    />
                </template>
                </van-field>
                
                <!-- 密码强度提示 -->
                <div class="password-strength">
                  <div class="strength-meter">
                    <div class="strength-meter-inner" :style="{ 
                      width: passwordStrength + '%', 
                      backgroundColor: strengthColor 
                    }"></div>
                  </div>
                  <div class="strength-text">{{ strengthText }}</div>
                </div>
                
                <!-- 确认密码 -->
                <van-field
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                name="确认密码"
                label="确认密码"
                placeholder="请再次输入密码"
                :rules="[{ validator: validatePassword, message: '两次密码不一致' }]"
                left-icon="lock"
                >
                <template #right-icon>
                    <van-icon 
                    :name="showConfirmPassword ? 'eye-o' : 'closed-eye'" 
                    size="18"
                    @click="showConfirmPassword = !showConfirmPassword"
                    />
                </template>
                </van-field>
                
                <!-- 提交按钮 -->
                <div class="submit-button">
                <van-button 
                    round 
                    block 
                    type="primary" 
                    native-type="submit"
                    :loading="loading"
                    loading-text="注册中..."
                >
                    立即注册
                </van-button>
                </div>
            </van-form>
            
            <!-- 底部登录链接 -->
            <div class="login-link">
                已有账号？<router-link to="/login">立即登录</router-link>
            </div>
            </div>
        </div>   
    </div>
</template>

<script>
import { NavBar, Form, Field, RadioGroup, Radio, Button, Toast } from 'vant';

export default {
  components: {
    [NavBar.name]: NavBar,
    [Form.name]: Form,
    [Field.name]: Field,
    [RadioGroup.name]: RadioGroup,
    [Radio.name]: Radio,
    [Button.name]: Button
  },
  data() {
    return {
      formData: {
        name: '',
        class: '',
        studentId: '',
        grade: '',
        gender: '1',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      showPassword: false,
      showConfirmPassword: false,
      passwordStrength: 0,
      strengthColor: '#ff4d4f',
      strengthText: '弱'
    };
  },
  watch: {
    'formData.password'(newVal) {
      this.calculatePasswordStrength(newVal);
    }
  },
  methods: {
    // 验证密码一致性
    validatePassword(val) {
      return val === this.formData.password;
    },
    
    // 验证密码强度（必须包含字母和数字）
    validatePasswordStrength(val) {
      if (!val) return false;
      
      // 检查是否同时包含字母和数字
      const hasLetter = /[a-zA-Z]/.test(val);
      const hasNumber = /\d/.test(val);
      
      return hasLetter && hasNumber;
    },
    
    // 计算密码强度
    calculatePasswordStrength(password) {
      if (!password) {
        this.passwordStrength = 0;
        this.strengthColor = '#ff4d4f';
        this.strengthText = '弱';
        return;
      }
      
      let strength = 0;
      
      // 长度评分
      if (password.length >= 8) strength += 25;
      if (password.length >= 12) strength += 15;
      
      // 复杂度评分
      if (/[a-z]/.test(password)) strength += 10;
      if (/[A-Z]/.test(password)) strength += 15;
      if (/\d/.test(password)) strength += 15;
      if (/[^A-Za-z0-9]/.test(password)) strength += 20;
      
      // 限制最大为100
      strength = Math.min(strength, 100);
      
      this.passwordStrength = strength;
      
      // 设置颜色和文本
      if (strength < 40) {
        this.strengthColor = '#ff4d4f';
        this.strengthText = '弱';
      } else if (strength < 70) {
        this.strengthColor = '#faad14';
        this.strengthText = '中等';
      } else {
        this.strengthColor = '#52c41a';
        this.strengthText = '强';
      }
    },
    
    // 提交表单
    async onSubmit() {
      // 确保密码强度验证通过
      if (!this.validatePasswordStrength(this.formData.password)) {
        Toast.fail('密码需包含字母和数字');
        return;
      }
      
      const user = {
        username: this.formData.name,
        account: this.formData.studentId,
        real_class: this.formData.class,
        grade: this.formData.grade,
        gender: this.formData.gender,
        duty: 0,
        password: this.formData.password
      };
      
      this.loading = true;
      
      try {
        const response = await this.$axios.post('/user/addUserInfo', user);
        
        // 根据后端返回的状态码处理
        if (response.status === 201) {
          // 注册成功提示
          Toast.success({
            message: '注册成功！',
            duration: 1500,
            onClose: () => {
              // 跳转到登录页面
              this.$router.push('/login');
            }
          });
        } else {
          // 处理其他状态码
          Toast.fail(`注册失败: ${response.data.message || '未知错误'}`);
        }
      } catch (error) {
        // 处理错误响应
        if (error.response) {
          // 400错误处理（账号已存在）
          if (error.response.status === 400) {
            Toast.fail('该学号/账号已被注册');
          } else {
            Toast.fail(`注册失败: ${error.response.data.error || '服务器错误'}`);
          }
        } else {
          // 网络错误
          Toast.fail('网络错误，请检查连接');
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.register-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: 100vh;
  padding: 16px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.app-nav-bar {
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-nav-bar /deep/ .van-nav-bar__title,
.app-nav-bar /deep/ .van-nav-bar__text,
.app-nav-bar /deep/ .van-icon {
  color: white !important;
}

/* 注册卡片 */
.register-card {
  background: white;
  border-radius: 16px;
  padding: 28px 24px;
  margin-top: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.register-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, #3498db, #2ecc71);
}

.card-header {
  text-align: center;
  margin-bottom: 28px;
  position: relative;
}

.card-header h2 {
  margin: 0;
  font-size: 26px;
  color: #2c3e50;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.card-header p {
  margin: 10px 0 0;
  font-size: 15px;
  color: #7f8c8d;
  font-weight: 400;
}

/* 表单样式 */
.register-form {
  margin-top: 10px;
}

/deep/ .van-field {
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
}

/deep/ .van-field:last-child {
  border-bottom: none;
}

/deep/ .van-field__label {
  width: 80px;
  color: #34495e;
  font-weight: 500;
  font-size: 15px;
}

/deep/ .van-field__control {
  font-size: 15px;
}

/deep/ .van-field__left-icon {
  color: #3498db;
  font-size: 18px;
  margin-right: 8px;
}

.gender-field {
  padding: 14px 0;
}

/deep/ .van-radio {
  margin-right: 24px;
}

/* 密码强度指示器 */
.password-strength {
  margin: -10px 16px 15px;
  display: flex;
  flex-direction: column;
}

.strength-meter {
  height: 6px;
  border-radius: 3px;
  transition: all 0.3s;
  background: #f0f0f0;
  overflow: hidden;
}

.strength-meter-inner {
  height: 100%;
  width: 0%;
  transition: all 0.3s;
}

.strength-text {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 5px;
  align-self: flex-end;
}

/* 提交按钮 */
.submit-button {
  margin-top: 32px;
}

/deep/ .van-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #3498db, #2ecc71);
  border: none;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;
  border-radius: 12px;
}

/deep/ .van-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);
}

/deep/ .van-button--loading {
  opacity: 0.9;
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #7f8c8d;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.login-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.login-link a:hover {
  text-decoration: underline;
  color: #2980b9;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .register-card {
    padding: 24px 16px;
    border-radius: 14px;
  }
  
  .card-header h2 {
    font-size: 24px;
  }
  
  .card-header p {
    font-size: 14px;
  }
  
  /deep/ .van-field__label {
    width: 70px;
    font-size: 14px;
  }
  
  /deep/ .van-field__control {
    font-size: 14px;
  }
  
  /deep/ .van-button {
    height: 46px;
    font-size: 15px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.register-card {
  animation: fadeIn 0.5s ease-out;
}

/deep/ .van-field {
  transition: all 0.3s;
}

/deep/ .van-field:focus-within {
  border-bottom-color: #3498db;
}
</style>