<template>
  <div class="login">
    <el-card class="login-card">
      <!-- header插槽 -->
      <template #header>
        <div class="login-card-header">用户登录</div>
      </template>
      <!-- ref设置后，在script中能使用this.$refs拿到对应的对象，用于验证和reset表单数据 -->
      <el-form :model="loginData" :rules="loginDataRules" ref="loginData">
        <!-- prop用于与rules的值对应，验证表单 -->
        <el-form-item prop="username" label="账号">
          <!--prefix-icon 图标
              placeholder 输入框文本
              maxlength 最大输入长度
              clearable 一建清空 -->
          <el-input type="text" prefix-icon="UserFilled" v-model="loginData.username" placeholder="请输入账号" maxlength="16" clearable></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <!-- show-password 显示密码-->
          <el-input type="password" prefix-icon="Lock" v-model="loginData.password" placeholder="请输入密码" maxlength="16" clearable show-password></el-input>
        </el-form-item>
        <el-form-item>
          <!-- type 按钮类型
               -->
          <el-button type="primary" style="width: 100%" @click="formSubmit('loginData',handleLogin)" :loading="loginLoading">登录</el-button>
        </el-form-item>
          <el-form-item>
              <div style="margin-left: 25px;margin-top: -10px">
                  <a class="user-style" style="color: blue" @click="UpdatePassword">忘记密码？</a>
                  <a class="user-style" style="color: blue;margin-left: 140px" @click="Register">注册用户</a>
              </div>
          </el-form-item>
      </el-form>
    </el-card>
      <el-dialog title="忘记密码" v-model="scaleDialog" width="25%">
          <el-form :model="updatePasswordData" :rules="updatePasswordRules" ref="updatePasswordData">
              <el-form-item prop="username" style="font-size: 20px;margin-left: 25px" label="账 号">
                  <el-input type="text" v-model="updatePasswordData.username" placeholder="请输入账号" maxlength="16" clearable style="margin-left: 20px"></el-input>
              </el-form-item>
              <el-form-item prop="newPassword" style="font-size: 20px;margin-left: 25px" label="新 密 码">
                  <el-input v-model="updatePasswordData.newPassword" placeholder="请输入新密码" maxlength="16" clearable show-password style="margin-left: 4px"></el-input>
              </el-form-item>
              <el-form-item prop="confirmPassword" style="font-size: 20px;margin-left: 25px" label="确认密码">
                  <el-input v-model="updatePasswordData.confirmPassword" placeholder="确认新密码" maxlength="16" clearable show-password></el-input>
              </el-form-item>
          </el-form>
          <template #footer>
              <el-button @click="scaleDialog = false">取消</el-button>
              <el-button type="primary" @click="formSubmit('updatePasswordData',handleUpdatePassword)">确认</el-button>
          </template>
      </el-dialog>
      <el-dialog title="创建用户" v-model="scaleDialog" width="25%">
          <el-form :model="registerData" :rules="registerRules" ref="registerData">
              <el-form-item prop="username" style="font-size: 20px;margin-left: 25px" label="账 号">
                  <el-input type="text" v-model="registerData.username" placeholder="请输入账号" maxlength="16" clearable style="margin-left: 23px"></el-input>
              </el-form-item>
              <el-form-item prop="password" style="font-size: 20px;margin-left: 25px" label="密 码">
                  <el-input v-model="registerData.password" placeholder="请输入新密码" maxlength="16" clearable show-password style="margin-left: 23px"></el-input>
              </el-form-item>
              <el-form-item prop="confirmPassword" style="font-size: 20px;margin-left: 25px" label="确认密码">
                  <el-input v-model="registerData.confirmPassword" placeholder="确认新密码" maxlength="16" clearable show-password></el-input>
              </el-form-item>
          </el-form>
          <template #footer>
              <el-button @click="scaleDialog = false">取消</el-button>
              <el-button type="primary" @click="formSubmit('registerData',handleRegister)">确认</el-button>
          </template>
      </el-dialog>
  </div>
</template>

<script type="text/javascript">
import common from '../common/Config';  //url配置
import jwt from "jsonwebtoken";
import httpClient from "@/request";
import moment from 'moment';  //生成当前时间
export default {
  data(){
    return{
      loginUrl:common.loginURL,
      loginData:{
        username:'',
        password:''
      },
      // 校验规则，
      // required: true 表示必填项，如果不写则不包含该项的校验
      // trigger 消除校验提示的方式，change 当值改变了时验证；blur 当失去焦点时验证
      loginDataRules:{
        username:[{
          required: true,
          message:'请输入账号',
          trigger: 'blur'
        }],
        password:[{
          required: true,
          message:'请输入密码',
          trigger: 'change'
        }]
      },
        // 修改密码校验规则
        updatePasswordRules:{
            username:[{
                required: true,
                message:'请输入账号',
                trigger: 'blur'
            }],
            newPassword:[{
                required: true,
                message:'请输入密码',
                trigger: 'change'
            }],
            confirmPassword:[{
                required: true,
                message:'请输入密码',
                trigger: 'change'
            }]
        },
        // 修改密码数据
      updatePasswordData:{
          username:'',
          newPassword:'',
          confirmPassword:''
      },
        // 创建用户
        registerData:{
            username:'',
            password:'',
            confirmPassword:''
        },
        // 创建用户校验规则
        registerRules:{
            username:[{
                required: true,
                message:'请输入账号',
                trigger: 'blur'
            }],
            password:[{
                required: true,
                message:'请输入密码',
                trigger: 'change'
            }],
            confirmPassword:[{
                required: true,
                message:'请输入密码',
                trigger: 'change'
            }]
        },

      loginLoading:false,
      scaleDialog:false,
    }
  },
  methods:{
    handleLogin() {
      httpClient.post(this.loginUrl,this.loginData)
          .then(res => {
            console.log(this.loginData)
            // set数据
            localStorage.setItem("username",this.loginData.username)
            localStorage.setItem("date",moment().format('YYYY-MM-DD HH:mm:ss'))
            // 生成token
            let token = jwt.sign(this.loginData,"yal",{expiresIn: '10h'})
            localStorage.setItem("token",token)
            // 跳转
            this.$router.push('/')
            this.$message.success({
              message: res.msg
            })
          })
          .catch(res => {
            this.$message.error({
              message: res.msg
            })
          })
    },
    // 表单校验(必填项中是否有未填写的)，valid表示验证是否通过输出回是一个布尔类型的值
    formSubmit(loginData,fn){
      this.$refs[loginData].validate((valid)=>{
        if (valid){
          fn()
        }else {
          return false;
        }
      })
    },
      UpdatePassword() {
        this.scaleDialog = true
      },
      Register() {
          this.scaleDialog = true
      },
      handleUpdatePassword(){
        httpClient.post(common.updatePasswordURL,{Username:this.updatePasswordData.username,Password:this.updatePasswordData.newPassword})
            .then(res => {
                this.$message.success({
                    message:res.msg
                })
            })
            .catch(res => {
                this.$message.error({
                    message:res.msg
                })
            })
            .finally(() => {
                this.scaleDialog = false
            })
      },
      handleRegister() {
          httpClient.post(common.registerURL,{Username:this.registerData.username,Password:this.registerData.password})
              .then(res => {
                  this.$message.success({
                      message:res.msg
                  })
              })
              .catch(res => {
                  this.$message.error({
                      message:res.msg
                  })
              })
              .finally(() => {
                  this.scaleDialog = false
              })
      }
  }
}
</script>

<style scoped>
/*scope用于设置的css样式只在当前页面生效*/
  .login{
    position: absolute;
    background-image: url("../../assets/img/login3.webp");
    height: 100%;
    width: 100%;
    background-size: 100%;
  }
.login-card{
  position: absolute;
  background: white;
  width: 350px;
  height: 250px;
  top:40%;
  left: 70%;
}
.login-card-header{
  text-align: center;
}
.user-style:hover{
    color: blue;
    cursor: pointer;
    font-weight: bold;
}
</style>