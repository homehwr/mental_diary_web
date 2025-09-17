<template>
  <div class="user-profile-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="个人信息"
      left-text="返回"
      left-arrow
      @click-left="$router.go(-1)"
      class="app-nav-bar"
    />
    
    <!-- 加载动画 -->
    <div class="loading-overlay" v-if="loading">
      <van-loading size="24px" color="#3498db" vertical>加载中...</van-loading>
    </div>
    
    <!-- 内容区域 -->
    <div v-if="!loading">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-container">
          <van-uploader 
            :after-read="uploadAvatar" 
            :max-size="5 * 1024 * 1024" 
            @oversize="onOversize"
            :before-read="beforeAvatarUpload"
          >
            <van-image
              round
              width="100px"
              height="100px"
              :src="$store.state.User.head_img || defaultAvatar"
              class="user-avatar"
            />
            <div class="edit-overlay">
              <van-icon name="edit" size="20" color="white" />
            </div>
          </van-uploader>
        </div>
        <p class="avatar-hint">点击头像修改</p>
      </div>
      
      <!-- 用户信息表单 -->
      <div class="user-form">
        <van-cell-group inset>
          <!-- 姓名（不可编辑） -->
          <van-field
            v-model="$store.state.User.username"
            label="姓名"
            input-align="right"
            readonly
          />
          
          <!-- 班级（不可编辑） -->
          <van-field
            v-model="$store.state.User.real_class"
            label="班级"
            input-align="right"
            readonly
          />

        <div class="gender-field">
            <van-field
            readonly
            clickable
            
            label="性别"
            input-align="right"
            @click="showGenderPicker = true"
            >
            <template #right-icon>
                <div class="gender-display">
                <!-- <van-icon :name="genderIcon" size="18px" /> -->
                <span>{{ displayGender || '请选择' }}</span>
                <van-icon name="arrow" />
                </div>
            </template>
            </van-field>

            <van-popup v-model="showGenderPicker" position="bottom" round>
            <van-picker
                show-toolbar
                title="选择性别"
                :columns="genderOptions"
                @confirm="onGenderConfirm"
                @cancel="showGenderPicker = false"
            />
            </van-popup>
        </div>
          
          <!-- 邮箱 -->
          <van-field
            v-model="displayEmail"
            label="邮箱"
            placeholder="请输入邮箱"
            input-align="right"
          />
          
          <!-- 手机号 -->
          <van-field
            v-model="displayPhone"
            label="手机号"
            placeholder="请输入手机号"
            input-align="right"
          />
        </van-cell-group>
      </div>
      
      <!-- 保存按钮 -->
      <div class="save-button-container">
        <van-button 
          round 
          block 
          type="primary" 
          size="large" 
          @click="saveProfile"
          :loading="saving"
          loading-text="保存中..."
        >
          保存修改
        </van-button>
      </div>

      <!-- 修改密码按钮 -->
      <div class="change-password-card">
        <van-cell 
          title="修改密码" 
          is-link 
          @click="changePassword"
          center
        >
          <template #icon>
            <van-icon name="lock" size="20" color="#3498db" class="password-icon" />
          </template>
        </van-cell>
      </div>
      

    </div>
  </div>
</template>

<script>
import { NavBar, Image, Icon, Button, Field, CellGroup, Uploader, Loading, Toast, Cell } from 'vant';

export default {
  components: {
    [NavBar.name]: NavBar,
    [Image.name]: Image,
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Field.name]: Field,
    [CellGroup.name]: CellGroup,
    [Uploader.name]: Uploader,
    [Loading.name]: Loading,
    [Cell.name]: Cell
  },
  data() {
    return {
      defaultAvatar: 'https://img.yzcdn.cn/vant/user-active.png',
      loading: false,
      saving: false,
      showGenderPicker: false,
      genderOptions: [
        { text: '男', value: '男' },
        { text: '女', value: '女' },
      ],
      displayGender: this.$store.state.User.gender,
      displayEmail: this.$store.state.User.email,
      displayPhone: this.$store.state.User.telephone,
      uploading: false // 上传状态
    };
  },
  mounted() {
    this.loadUserProfile();
  },
  methods: {
    // 加载用户信息
    loadUserProfile() {
      // this.loading = true;
      
      // // 模拟API请求
      // setTimeout(() => {
      //   this.loading = false;
      // }, 800);
    },
    
    // 上传前验证
    beforeAvatarUpload(file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        Toast.fail('只允许上传JPG/PNG/GIF/WEBP格式的图片');
        return false;
      }
      
      // 验证文件大小
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        Toast.fail('图片大小不能超过5MB');
        return false;
      }
      
      return true;
    },
    
    // 上传头像
    uploadAvatar(file) {
      // 显示上传状态
      this.uploading = true;
      Toast.loading({
        message: '头像上传中...',
        forbidClick: true,
        duration: 0
      });
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', file.file);
      
      // 调用后端API上传头像
      this.$axios.post('http://parliy.com:89/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        const { url, filename } = response.data;
        
        // 更新Vuex中的用户头像
        this.$store.commit('UPDATE_USER_INFO', {
          head_img: url
        });
        
        // 更新本地显示
        this.$store.state.User.head_img = url;
        
        Toast.success('头像更新成功');
        
        // 可选：调用后端API更新用户头像URL
        this.updateAvatarUrl(url);
      })
      .catch(error => {
        console.error('头像上传失败:', error);
        Toast.fail('头像上传失败，请重试');
      })
      .finally(() => {
        this.uploading = false;
        Toast.clear();
      });
    },
    
    // 更新后端用户头像URL
    updateAvatarUrl(avatarUrl) {
      this.$axios.put(`/user/updateAvatar?uid=${this.$store.state.User.uid}`, {
        head_img: avatarUrl
      })
      .then(() => {
        console.log('用户头像URL更新成功');
      })
      .catch(error => {
        console.error('更新头像URL失败:', error);
      });
    },
    
    // 文件过大提示
    onOversize() {
      Toast('图片大小不能超过5MB');
    },
    
    // 保存个人信息
    saveProfile() {
      this.saving = true;
      // 验证手机号格式
      if (this.displayPhone && !this.validatePhone(this.displayPhone)) {
        Toast.fail('手机号格式不正确');
        this.saving = false;
        return;
      }
      
      // 验证邮箱格式
      if (this.displayEmail && !this.validateEmail(this.displayEmail)) {
        Toast.fail('邮箱格式不正确');
        this.saving = false;
        return;
      }
      let gend;
      if (this.displayGender == '男'){
        gend = '1'
      } else {
        gend = '2'
      }
      const user = {
        gender: gend,
        email: this.displayEmail,
        telephone: this.displayPhone 
      }
      // 实际项目中应调用API保存用户信息
      this.$axios.put(`/user/updateUserInfo?uid=${this.$store.state.User.uid}`, user, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(() => {

        this.$store.commit('UPDATE_USER_INFO', {
          user
        });
        Toast.success('个人信息已更新');
        this.saving = false;
      })
      .catch(err => {
        Toast.fail('出错啦：', err);
        this.saving = false;
      })

    },
    
    // 修改密码
    changePassword() {
      this.$router.push('/change-password');
    },

    onGenderConfirm(pickerValue) {
      this.displayGender = pickerValue.value;
      this.showGenderPicker = false;
    },
    
    // 手机号验证方法
    validatePhone(phone) {
      // 中国大陆手机号正则（1开头，11位数字）
      const phoneRegex = /^1[3-9]\d{9}$/;
      return phoneRegex.test(phone);
    },

    // 邮箱验证方法
    validateEmail(email) {
      // 基础邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
  }
};
</script>

<style scoped>
.user-profile-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: 100vh;
  padding-bottom: 30px;
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

/* 头像区域 */
.avatar-section {
  padding: 40px 0 20px;
  text-align: center;
  background: white;
  margin: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 10px;
}

.user-avatar {
  border: 3px solid #e4edf9;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.edit-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: rgba(52, 152, 219, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-overlay:hover {
  background: rgba(52, 152, 219, 1);
  transform: scale(1.1);
}

.avatar-hint {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

/* 用户信息表单 */
.user-form {
  margin: 16px;
}

/* 修改密码卡片 */
.change-password-card {
  background: white;
  border-radius: 16px;
  margin: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.password-icon {
  margin-right: 10px;
}

/* 保存按钮 */
.save-button-container {
  padding: 20px 16px 0;
}

.save-button-container .van-button {
  background: linear-gradient(135deg, #3498db, #2ecc71);
  border: none;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  font-weight: bold;
  height: 50px;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .avatar-section {
    padding: 30px 0 15px;
  }
  
  .user-avatar {
    width: 90px;
    height: 90px;
  }
  
  .edit-overlay {
    width: 32px;
    height: 32px;
  }
}
.gender-field {
  margin: 12px 0;
}

.gender-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #323233;
}

.van-field__label {
  font-weight: bold;
  color: #2c3e50;
}

</style>