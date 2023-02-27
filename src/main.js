import { createApp } from 'vue'
import App from './App.vue'
//导入element plus
import EelementPlus from 'element-plus'
// 引入默认主体
import 'element-plus/dist/index.css'
// 引入element plus所有图标
import * as ELIcons from '@element-plus/icons-vue'
// 引入路由router模块
import router from "@/router";
// 引入编辑器组件
import {GlobalCmComponent} from "codemirror-editor-vue3"
import 'codemirror/theme/idea.css'
import 'codemirror/mode/yaml/yaml.js'

const app = createApp(App)
// 将图标注册成全局组件
for (let iconName in ELIcons){
    //iconName 组件名，ELIcons[iconName]实际的组件
    app.component(iconName,ELIcons[iconName])
}
// 引入element plus
app.use(EelementPlus)
//注册编辑器组件
app.use(GlobalCmComponent, { componentName: "codemirror" })
// 引入router
app.use(router)

app.mount('#app')

