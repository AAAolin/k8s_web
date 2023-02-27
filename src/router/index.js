import { createRouter,createWebHistory} from "vue-router";
// 导入nprogress模块
import NProgress from 'nprogress'
// 导入nprogress样式
import 'nprogress/nprogress.css'
import jwt from "jsonwebtoken"
import layout from '@/layout/Layout.vue'

// 路由规则
const routes = [
    {
        path:'/login', // url地址
        name:'Login', // 路由名称
        component:() => import('@/views/login/Login.vue'), // 引入视图
        meta:{title:'登录'} // 元信息
    },
    {
        path:'/layout',
        name:'Layout',
        component:layout,
        meta: {title: '整体布局'}
    },
    {
        path:'/home',
        component:layout,
        children:[
            {
                path:'/home',
                name:'概要',
                component:()=>import('@/views/home/Home.vue'),
                meta:{title:'概要'},
                icon:'odometer'
            }
        ]
    },
    {
        path:'/workflow',
        component:layout,
        children: [
            {
                path: '/workflow',
                name: '工作流',
                icon: 'VideoPlay',
                component: ()=> import('@/views/workflow/workflow.vue'),
                meta:{title: '工作流'}
            }
        ]
    },
    {
        path:'/workspace',
        name:'工作负载',
        component:layout,
        icon:'menu',
        meta: {title: '工作负载'},
        children: [
            {
                path:'/workspace/deployment',
                name:'Deployment',
                component:()=>import('@/views/workspace/deployment/Deployment.vue'),
                meta: {title: 'Deployment'}
            },
            {
                path:'/workspace/pod',
                name:'Pod',
                component:()=>import('@/views/workspace/pod/Pod.vue'),
                meta:{title: 'Pod'}
            },
            {
                path:'/workspace/daemonSet',
                name:'DaemonSet',
                component:()=>import('@/views/workspace/daemonSet/daemonSet.vue'),
                meta:{title: 'DaemonSet'},
            },
            {
                path:'/workspace/statefulSet',
                name:'StatefulSet',
                component:()=>import('@/views/workspace/statefulSet/statefulSet.vue'),
                meta:{title: 'StatefulSet'}
            }
        ]
    },
    {
        path:'/cluster',
        name:'集群',
        component:layout,
        icon: 'shop',
        children: [
            {
                path:'/cluster/node',
                name:'Node',
                component:()=>import("@/views/cluster/node/node.vue"),
                meta:{title: 'node'},
            },
            {
                path:'/cluster/namespace',
                name:'Namespace',
                component:()=>import("@/views/cluster/namespace/namespace.vue"),
                meta:{title: 'namespace'},
            },
            {
                path:'/cluster/pv',
                name:'PV',
                component:()=>import("@/views/cluster/pv/pv.vue"),
                meta:{title: 'pv'},
            }
        ]
    },
    {
        path:'/loadBalance',
        name:'负载均衡',
        component:layout,
        icon: 'grid',
        children: [
            {
                path:'/loadBalance/service',
                name:'Service',
                component:()=>import("@/views/loadBalance/service/service.vue"),
                meta:{title: 'service'},
            },
            {
                path:'/loadBalance/ingress',
                name:'Ingress',
                component:()=>import("@/views/loadBalance/ingress/ingress.vue"),
                meta:{title: 'ingress'},
            }
        ]
    },
    {
        path:'/storageConfig',
        name:'存储与配置',
        component:layout,
        icon: 'tools',
        children: [
            {
                path:'/storageConfig/configMap',
                name:'ConfigMap',
                component:()=>import("@/views/storageConfig/configMap/configMap.vue"),
                meta:{title: 'configMap'},
            },
            {
                path:'/storageConfig/secret',
                name:'Secret',
                component:()=>import("@/views/storageConfig/secret/secret.vue"),
                meta:{title: 'secret'},
            },
            {
                path:'/storageConfig/pvc',
                name:'PVC',
                component:()=>import("@/views/storageConfig/pvc/pvc.vue"),
                meta:{title: 'pvc'},
            }
        ]
    },
    {
        path:"/",
        redirect:"/home"
    }
]

// 创建路由实例，并传递路由对象routes
const router = createRouter({
    history:createWebHistory(),
    routes
})

//进度条初始化
//递增进度条，这将获取当前状态值并添加0.2到状态0.994
NProgress.inc(100)
//NProgress.configure({ showSpinner: true })
//easing 动画字符串
//speed 动画速度
//showSpinner 进度环显示隐藏
NProgress.configure({ easing: 'ease', speed: 600, showSpinner: false })

//router.beforeEach（）一般用来做一些进入页面的限制。比如没有登录，就不能进入某些页面，只有登录了之后才有权限查看某些页面。。。说白了就是路由拦截。
//to 要去到某个页面的属性
//from 从哪个页面来的属性
//next 处理路由跳转及放行
router.beforeEach((to,from,next) =>{
    NProgress.start()

    //启动进度条
    if(to.meta.title){
        document.title = to.meta.title
    } else {
        document.title = "默认"
    }
    next()
})

router.beforeEach((to,from,next) => {
    // 验证token是否合法
    jwt.verify(localStorage.getItem("token"),"yal",function (err){
        // 访问login页面，放行
        if (to.path === '/login') {
            next()
            // 不合法，跳转到login页面
        } else if (err){
            next('/login')
        } else {
            // 放行
            next()
        }
    })
})

router.afterEach(()=>{
    NProgress.done()
})


export default router