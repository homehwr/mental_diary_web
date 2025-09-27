<template>
  <div class="user-list-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="addUser">添加用户</el-button>
      </div>
    </div>
    
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <el-card shadow="hover">
        <div class="filter-content">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索姓名、账号或班级"
            prefix-icon="el-icon-search"
            clearable
            @clear="handleSearch"
            @keyup.enter.native="handleSearch"
            style="width: 300px; margin-right: 15px;"
          ></el-input>
          
          <el-select v-model="filterRole" placeholder="所有角色" clearable style="width: 120px; margin-right: 15px;">
            <el-option label="普通学生" :value="0"></el-option>
            <!-- <el-option label="班主任" :value="1"></el-option> -->
            <el-option label="管理员" :value="1"></el-option>
          </el-select>
          
          <el-select v-model="filterGrade" placeholder="所有年级" clearable style="width: 120px; margin-right: 15px;">
            <el-option v-for="grade in gradeOptions" :key="grade" :label="grade" :value="grade"></el-option>
          </el-select>
          
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 用户列表 -->
    <div class="user-list-section">
      <el-card shadow="hover">
        <el-table
          :data="filteredUsers"
          v-loading="loading"
          style="width: 100%"
          stripe
          :header-cell-style="{background: '#f5f7fa', color: '#606266'}"
        >
        <el-table-column type="index" width="70" label="序号" align="center"></el-table-column>
          <el-table-column label="用户信息" width="190">
            <template slot-scope="scope">
              <div class="user-info-cell">
                <div class="user-avatar">
                  <img v-if="scope.row.head_img" :src="scope.row.head_img" alt="头像">
                  <div v-else class="avatar-placeholder">
                    <i class="el-icon-user-solid"></i>
                  </div>
                </div>
                <div class="user-details">
                  <div class="username">{{ scope.row.username }}</div>
                  <div class="account">{{ scope.row.account }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="grade" label="年级" width="100"></el-table-column>
          
          <el-table-column prop="real_class" label="班级" width="180"></el-table-column>
          
          <el-table-column label="性别" width="80">
            <template slot-scope="scope">
              <el-tag :type="scope.row.gender === 1 ? 'primary' : 'danger'" size="small">
                {{ scope.row.gender === 1 ? '男' : scope.row.gender === 2 ? '女' : '未知' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="角色" width="120">
            <template slot-scope="scope">
              <el-tag :type="getRoleTagType(scope.row.duty)" size="small">
                {{ getRoleName(scope.row.duty) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="telephone" label="联系电话" width="150"></el-table-column>
          
          <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
          
          <el-table-column label="操作" width="320" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="warning"
                icon="el-icon-eye"
                size="mini"
                @click="gotoDiary(scope.row.account)"
              >查看日记</el-button>
              <el-button
                type="success"
                icon="el-icon-refresh"
                size="mini"
                @click="resetUserPwd(scope.row.uid)"
              >重置密码</el-button>
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="editUser(scope.row)"
              >编辑</el-button>
              <!-- <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteUser(scope.row.uid)"
              >删除</el-button> -->
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalUsers"
          ></el-pagination>
        </div>
      </el-card>
    </div>
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="userForm" ref="userForm" label-width="100px" :rules="formRules">
        <el-form-item label="姓名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入姓名"></el-input>
        </el-form-item>
        
        <el-form-item label="账号" prop="account">
          <el-input v-model="userForm.account" placeholder="请输入账号"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="isAddMode">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item label="年级" prop="grade">
          <el-select v-model="userForm.grade" placeholder="请选择年级">
            <el-option v-for="grade in gradeOptions" :key="grade" :label="grade" :value="grade"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="班级" prop="real_class">
          <el-input v-model="userForm.real_class" placeholder="请输入班级"></el-input>
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="userForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="角色" prop="duty">
          <el-select v-model="userForm.duty" placeholder="请选择角色">
            <el-option label="普通学生" :value="0"></el-option>
            <!-- <el-option label="班主任" :value="1"></el-option> -->
            <el-option label="管理员" :value="1"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="联系电话" prop="telephone">
          <el-input v-model="userForm.telephone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        
        <!-- <el-form-item label="头像" prop="head_img">
          <el-upload
            class="avatar-uploader"
            action="https://jsonplaceholder.typicode.com/posts/"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="userForm.head_img" :src="userForm.head_img" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item> -->
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitUserForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      loading: false,
      users: [],
      filteredUsers: [],
      searchKeyword: '',
      filterRole: null,
      filterGrade: null,
      gradeOptions: ['2025', '2024', '2023', '2022'],
      currentPage: 1,
      pageSize: 10,
      totalUsers: 0,
      
      // 对话框相关
      dialogVisible: false,
      isAddMode: true,
      dialogTitle: '添加用户',
      userForm: {
        uid: null,
        username: '',
        account: '',
        password: '',
        grade: '',
        real_class: '',
        gender: 1,
        duty: 0,
        telephone: '',
        email: '',
        head_img: ''
      },
      formRules: {
        username: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        account: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 4, max: 12, message: '长度在 4 到 12 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        grade: [
          { required: true, message: '请选择年级', trigger: 'change' }
        ]
      }
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    // 获取用户列表
    async fetchUsers() {
      this.loading = true;
      try {
        // 模拟API请求
        const response = await this.$axios.get('/user/getAllUsers');
        console.log(response);
        // 模拟数据
        // await new Promise(resolve => setTimeout(resolve, 800));
        
        // // 模拟响应数据
        const mockUsers = response.data;
        this.users = response.data;
        this.filteredUsers = mockUsers.slice(0, this.pageSize);
        this.totalUsers = mockUsers.length;
      } catch (error) {
        console.error('获取用户列表失败:', error);
        this.$message.error('获取用户列表失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 生成模拟用户数据
    generateMockUsers(count) {
      const mockUsers = [];
      const genders = [1, 2];
      const roles = [0, 1, 2];
      const grades = ['大一', '大二', '大三', '大四', '研一', '研二', '研三'];
      const classes = ['物理学2201', '物理学2202', '电子信息2201', '电子信息2202', '通信工程2201', '通信工程2202'];
      
      for (let i = 1; i <= count; i++) {
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const grade = grades[Math.floor(Math.random() * grades.length)];
        const userClass = classes[Math.floor(Math.random() * classes.length)];
        
        mockUsers.push({
          uid: i,
          username: `用户${i}`,
          account: `user${i}`,
          password: '********',
          grade: grade,
          real_class: userClass,
          gender: gender,
          duty: role,
          telephone: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
          email: `user${i}@example.com`,
          head_img: gender === 1 ? 
            'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 100) + '.jpg' : 
            'https://randomuser.me/api/portraits/women/' + Math.floor(Math.random() * 100) + '.jpg'
        });
      }
      
      return mockUsers;
    },
    
    // 获取角色名称
    getRoleName(role) {
      const roles = {
        0: '普通学生',
        1: '管理员',
        // 2: '管理员'
      };
      return roles[role] || '未知';
    },
    
    // 获取角色标签类型
    getRoleTagType(role) {
      const types = {
        0: 'info',
        1: 'success',
        // 2: 'success'
      };
      return types[role] || 'info';
    },
    
    // 处理搜索
    handleSearch() {
      this.currentPage = 1;
      this.filterUsers();
    },
    
    // 重置筛选条件
    resetFilters() {
      this.searchKeyword = '';
      this.filterRole = null;
      this.filterGrade = null;
      this.currentPage = 1;
      this.filterUsers();
    },
    
    // 筛选用户
    filterUsers() {
      let result = this.users;
      
      // 关键词搜索
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        result = result.filter(user => 
          user.username.toLowerCase().includes(keyword) ||
          user.account.toLowerCase().includes(keyword) ||
          (user.real_class && user.real_class.toLowerCase().includes(keyword))
        );
      }
      
      // 角色筛选
      if (this.filterRole !== null) {
        result = result.filter(user => user.duty === this.filterRole);
      }
      
      // 年级筛选
      if (this.filterGrade) {
        result = result.filter(user => user.grade === this.filterGrade);
      }
      
      this.totalUsers = result.length;
      this.updatePaginatedUsers(result);
    },
    
    // 更新分页后的用户数据
    updatePaginatedUsers(users) {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.filteredUsers = users.slice(start, end);
    },
    
    // 每页数量变化
    handleSizeChange(size) {
      this.pageSize = size;
      this.filterUsers();
    },
    
    // 当前页变化
    handleCurrentChange(page) {
      this.currentPage = page;
      this.filterUsers();
    },
    
    // 添加用户
    addUser() {
      this.isAddMode = true;
      this.dialogTitle = '添加用户';
      this.userForm = {
        uid: null,
        username: '',
        account: '',
        password: '',
        grade: '',
        real_class: '',
        gender: 1,
        duty: 0,
        telephone: '',
        email: '',
        head_img: ''
      };
      this.dialogVisible = true;
    },
    
    // 编辑用户
    editUser(user) {
      this.isAddMode = false;
      this.dialogTitle = '编辑用户';
      this.userForm = {
        ...user,
        password: '' // 编辑时不显示密码
      };
      this.dialogVisible = true;
      this.$notify({
          title: '注意',
          message: '编辑功能未制作，修改无效！',
          type: 'warning',
          duration: 0
        });
    },
    
    // 删除用户
    deleteUser(uid) {
      this.$confirm('确定要删除该用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除请求
        // await this.$axios.delete(`/api/users/${uid}`);
        
        // 模拟删除成功
        this.users = this.users.filter(user => user.uid !== uid);
        this.filterUsers();
        this.$message.success('用户删除成功');
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    resetUserPwd(uid) {
      this.$confirm('确定要给当前用户重置密码吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 模拟删除请求
        this.$axios.post(`/user/resetPassword?uid=${uid}`);
        
        // 模拟删除成功
        // this.users = this.users.filter(user => user.uid !== uid);
        this.filterUsers();
        this.$message.success('用户密码重置成功！');
      }).catch(() => {
        this.$message.info('已取消操作');
      });
    },
    gotoDiary(account){
        this.$router.push(`/manage/diaryList?account=${account}`)
    },
    // 提交用户表单
    submitUserForm() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          try {
            if (this.isAddMode) {
              // 模拟添加用户请求
              // const response = await this.$axios.post('/api/users', this.userForm);
              
              // 模拟添加成功
              const newUser = {
                ...this.userForm,
                uid: this.users.length + 1
              };
              this.users.unshift(newUser);
              this.$message.success('用户添加成功');
            } else {
              // 模拟更新用户请求
              // await this.$axios.put(`/api/users/${this.userForm.uid}`, this.userForm);
              
              // 模拟更新成功
              const index = this.users.findIndex(u => u.uid === this.userForm.uid);
              if (index !== -1) {
                this.users.splice(index, 1, this.userForm);
              }
              this.$message.success('用户信息更新成功');
            }
            
            this.filterUsers();
            this.dialogVisible = false;
          } catch (error) {
            console.error('保存用户失败:', error);
            this.$message.error('保存用户失败');
          }
        } else {
          this.$message.warning('请填写完整的表单信息');
          return false;
        }
      });
    },
    
    // 头像上传成功
    handleAvatarSuccess(res, file) {
      this.userForm.head_img = URL.createObjectURL(file.raw);
    },
    
    // 头像上传前校验
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;
      
      if (!isJPG && !isPNG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return (isJPG || isPNG) && isLt2M;
    }
  }
};
</script>

<style scoped>
.user-list-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  color: #304156;
  font-size: 24px;
  font-weight: bold;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-content {
  display: flex;
  align-items: center;
}

.user-list-section {
  margin-bottom: 30px;
}

.user-info-cell {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 24px;
  color: #c0c4cc;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  margin-bottom: 4px;
}

.account {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.avatar-uploader {
  display: inline-block;
}

.avatar-uploader >>> .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader >>> .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
}
</style>