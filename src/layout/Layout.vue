<template>
  <!-- 整体布局 -->
  <el-container style="height: 100vh" >
    <!--  侧边栏 transition：折叠速度 -->
    <el-aside style="background: #131b27;transition: all .5s" :width="asideWidth">
      <!--  logo固钉  -->
      <el-affix class="aside-affix" z-index="100">
        <div class="aside-logo">
          <el-image class="logo-image" :src="logo"></el-image>
          <div class="logo-name" :class="[isCollapse?'is-Collapse': '']">k8s管理平台</div>
        </div>
      </el-affix>
      <!--  导航栏  -->
      <!-- router: 是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转  -->
      <!-- default-active 当前激活菜单的index，将菜单栏与访问路径做了对应关系 -->
      <!-- collapse 是否折叠 -->
      <el-menu class="aside-menu" router :default-active="$route.path" :collapse="isCollapse"
               background-color="#131b27" text-color="#fdfffd" active-text-color="#6bcfc7">
        <!--  循环routes，找到children，根据条件作为导航栏  -->
        <div v-for="menu in routers" :key="menu">
          <!--  处理子路由只有1条的情况，例如概要、工作流等  -->
          <!--  if条件：当存在children并且children只有一条时  -->
          <el-menu-item class="aside-menu-item" v-if="menu.children && menu.children.length == 1" :index="menu.children[0].path">
            <!--  图标  -->
            <el-icon><component :is="menu.children[0].icon"></component></el-icon>
            <template #title>
              <!--  栏目标题  -->
              <span>{{ menu.children[0].name }}</span>
            </template>
          </el-menu-item>
          <!-- 处理有多个子路由的情况，如集群、工作负载、负载均衡等 -->
          <!--  if条件：当存在children并且children大于1条时  -->
          <el-sub-menu class="aside-submenu" v-if="menu.children && menu.children.length > 1" :index="menu.path" >
            <!-- 处理父栏目的图标和标题 -->
            <template #title>
              <el-icon><component :is="menu.icon"></component></el-icon>
              <span :class="[isCollapse?'is-Collapse': '']">{{ menu.name }}</span>
            </template>
            <!-- 子栏目，for循环children，得到的就是子栏目信息 -->
            <el-menu-item class="aside-menu-childitem" v-for="child in menu.children" :key="child" :index="child.path">
              <!-- 处理子栏目的图标和标题 -->
              <template #title>
                <span>{{ child.name }}</span>
              </template>
            </el-menu-item>
          </el-sub-menu>
        </div>
      </el-menu>
    </el-aside>
    <el-container>
      <!-- 头部内容 -->
      <el-header class="header">
        <el-row>
          <el-col :span="1">
            <div class="header-collapse" @click="onCollapse">
              <el-icon><component :is="isCollapse ? 'expand':'fold'"></component></el-icon>
            </div>
          </el-col>
          <el-col :span="10">
            <div class="header-breadcrumb">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{path:'/home'}">工作台</el-breadcrumb-item>
                <template v-for="(matched,m) in this.$route.matched" :key="m">
                  <el-breadcrumb-item v-if="matched.name != undefined">{{ matched.name}}</el-breadcrumb-item>
                </template>
              </el-breadcrumb>
            </div>
          </el-col>
          <el-col class="header-menu" :span="13">
            <el-dropdown trigger="hover">
              <div class="head-dropdown">
                <el-image  class="head-picture" :src="headPicture"></el-image>
                <span>{{ username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>修改密码</el-dropdown-item>
                  <el-dropdown-item @click="logout">退出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-col>
        </el-row>
      </el-header>
      <!-- 主要内容 -->
      <el-main class="main">
        <router-view></router-view>
      </el-main>
      <!-- 尾部内容 -->
      <el-footer class="foot">
        <div class="foot-content">
          <el-icon><Place /></el-icon>
          develop by yal
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script>
import router from "@/router";
import {useRouter} from "vue-router";

export default {
  name: "Layout",
  data(){
    return{
      logo:require('@/assets/k8s/k8s.png'),
      headPicture:require('@/assets/avator/avator.png'),
      routers:[],
      isCollapse:false,
      asideWidth:'250px'
    }
  },
  methods: {
    router() {
      return router
    },
    onCollapse(){
      if (this.isCollapse) {
        this.isCollapse = false
        this.asideWidth = '250px'

      } else {
        this.isCollapse = true
        this.asideWidth = '64px'
      }
    },
    logout() {
      localStorage.removeItem("username")
      localStorage.removeItem("date")
      localStorage.removeItem("token")
      this.$router.push('/login')
    }
  },
  computed:{
    username(){
      let username =localStorage.getItem("username")
      return username ? username : 'Sign in'
    }
  },
  beforeMount() {
    //使用useRouter().options.routes方法来获取路由规则
    this.routers = useRouter().options.routes
  }
}

</script>

<style scoped>

.aside-logo {
  background-color: #131b27;
  height: 80px;
  color: white;
}
.logo-image{
  height: 40px;
  width: 40px;
  top: 20px;
  padding-left: 12px;
}
.logo-name{
  font-size: 20px;
  padding-left: 70px;
  margin-top: -15px;
}
.is-Collapse{
  display: none;
}

.aside-menu-item.is-active{
  background-color: #142c4e;
}

.aside-menu-item:hover{
  background-color: #2b374e;
}

.aside-menu-childitem.is-active{
  background-color: #142c4e;
}

.aside-menu-childitem:hover{
  background-color: #2b374e;
}

/* 修正边框，让边框不要有溢出 */
.aside-affix {
  border-bottom-width: 0
}
.aside-menu {
  border-right-width: 0;
}

.header{
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}

.header-collapse{
  padding-top: 20px;
  font-size: 24px;
  cursor: pointer;
}
.header-breadcrumb{
  padding-top: 26px;
}
.header-menu{
  text-align: right;
}
.head-dropdown{
  padding-right: 50px;
  cursor: pointer;
}
.head-picture{
  width: 40px;
  height: 40px;
  border-radius: 50%;
  top: 13px;
  margin-right: 8px;
}
.main{
  padding: 10px;
}
.foot{
  text-align: center;
  padding-top: 15px;
  color: #7d7e7d;
}
</style>