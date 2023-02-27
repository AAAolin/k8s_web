<template>
  <el-row>
      <el-col :span="24">
          <el-card class="pod-head-card" :body-style="{padding:'10px'}" shadow="never">
              <el-row>
                  <el-col :span="9">
                      <span style="font-size: 15px;margin-right: 10px">命名空间</span>
                      <el-select v-model="namespaceValue" placeholder="请输入" filterable size="small" @change="getPod">
                          <el-option v-for="(item,value) in namespaceList" :key="value" :value="item.metadata.name" :label="item.metadata.name"></el-option>
                      </el-select>
                  </el-col>
                  <el-col :span="15" style="text-align: right;padding-right: 10px">
                      <el-button icon="Refresh" type="primary" size="small" @click="getPod">刷新</el-button>
                  </el-col>
              </el-row>
          </el-card>
      </el-col>
      <el-col :span="24">
          <el-card class="pod-head-card" :body-style="{padding:'10px'}" shadow="never">
              <el-input style="margin-right: 5px; width: 160px" size="small" v-model="searchValue" placeholder="请输入" clearable></el-input>
              <el-button type="primary" plain icon="Refresh" size="small" @click="getPod">搜索</el-button>
          </el-card>
      </el-col>
      <el-col :span="24">
          <el-card class="pod-head-card" :body-style="{padding:'10px'}" shadow="never">
              <el-table :data="podList" v-loading="appLoading" :row-key="getRowKeys" :expand-row-keys="expendKeys" @expand-change="expendChange">
                  <el-table-column width="40"></el-table-column>
<!--              type="expand" >箭头形状的下拉按钮    -->
                  <el-table-column type="expand">
                      <!-- 该插槽用于获取行数据 -->
                      <template #default="props">
<!--                      标签页 v-model是选中选项卡的name   -->
                          <el-tabs v-model="activename" style="margin-left: 60px">
<!--                           选项卡 label显示的选项 name是选项卡的名字   -->
                              <el-tab-pane label="容器" name="container">
                                  <el-card :body-style="{padding:'10px'}" shadow="never">
                                      <el-table :data="props.row.spec.containers">
                                          <el-table-column label="容器" prop="name"></el-table-column>
                                          <el-table-column label="启动命令" prop="args"></el-table-column>
                                          <el-table-column label="环境变量">
                                              <template v-slot="scope">
                                                  <el-popover placement="left" :width="600" trigger="hover">
                                                      <template #reference>
                                                          <el-button>此处显示</el-button>
                                                      </template>
                                                      <el-table :data="scope.row.env">
                                                          <el-table-column label="名称" prop="name"></el-table-column>
                                                          <el-table-column label="值" prop="value"></el-table-column>
                                                      </el-table>
                                                  </el-popover>
                                              </template>
                                          </el-table-column>
                                      </el-table>
                                  </el-card>
                              </el-tab-pane>
                              <el-tab-pane label="日志" name="log">
                                  <el-select v-model="containerName" @change="getPodContainerLog(props.row.metadata.name)">
                                      <el-option v-for="(value,index) in this.containerList" :key="index" :value="value" :label="value"></el-option>
                                  </el-select>
                                  <div class="pod-body-log-card">
                                      <a style="white-space: pre-wrap;color:#fff">{{ this.log }}</a>
                                  </div>
                              </el-tab-pane>
                              <el-tab-pane label="终端" name="shell">123</el-tab-pane>
                          </el-tabs>
                      </template>
                  </el-table-column>
                  <el-table-column label="pod">
                      <template v-slot="scope">
                          <a style="color: blue;font-weight: bold" class="pod-body-podname" @click="expendMap[scope.row.metadata.name]?expendChange(scope.row,[]):expendChange(scope.row,[scope.row])">{{ scope.row.metadata.name }}</a>
                      </template>
                  </el-table-column>
                  <el-table-column label="节点">
                      <template v-slot="scope">
                          <el-tag type="warning">
                              <a style="font-size: 13px">{{ scope.row.spec.nodeName }}</a>
                          </el-tag>
                      </template>
                  </el-table-column>
                  <el-table-column label="状态">
                      <template v-slot="scope">
                          <div :class="{'success-dot':scope.row.status.phase === 'Running','warning-dot':scope.row.status.phase === 'Pending',
                          'error-dot':scope.row.status.phase !== 'Running'&&scope.row.status.phase !== 'Pending'}"></div>
                          <span :class="{'success-status':scope.row.status.phase === 'Running','warning-status':scope.row.status.phase === 'Pending',
                          'error-status':scope.row.status.phase !== 'Running'&&scope.row.status.phase !== 'Pending'}">{{ scope.row.status.phase }}</span>
                      </template>
                  </el-table-column>
                  <el-table-column label="重启数">
                      <template v-slot="scope">
                          <a>{{ restartTotal(scope) }}</a>
                      </template>
                  </el-table-column>
                  <el-table-column label="创建时间">
                      <template v-slot="scope">
                          <a>{{ timeTrans(scope.row.metadata.creationTimestamp) }}</a>
                      </template>
                  </el-table-column>
                  <el-table-column label="操作">
                      <template v-slot="scope">
                          <el-button type="primary" plain icon="edit" size="small" @click="getPodYAML(scope)">YAML</el-button>
                          <el-button type="warning" plain icon="Delete" size="small" @click="handleConfirm(scope,deletePod)">删除</el-button>
                      </template>
                  </el-table-column>
              </el-table>
              <el-pagination style="margin-top:10px;margin-left: 50px" background :current-page="currentPage" :page-size="pageSize" :page-sizes="pagesizeList"
                             layout="total,sizes,prev,pager,next,jumper" :total="podTotal" @size-change="handleSizeChange" @current-change="handleCurrentChange">
              </el-pagination>
          </el-card>
      </el-col>
  </el-row>
<!--对话框  v-model="dialogOption" 当dialogOption为true时弹出  -->
    <el-dialog title="YAML编辑器" v-model="dialogOption" width="45%" top="2%">
        <codemirror :value="contentYaml" :options="cmOptions" @change="onChange" height="500" style="font-size:14px;"></codemirror>
        <template #footer>
            <el-button @click="this.dialogOption = false">取消</el-button>
            <el-button @click="updatePod">确认</el-button>
        </template>
    </el-dialog>
</template>

<script>
import common from "@/views/common/Config"
import httpClient from "@/request"
import yaml2obj from 'js-yaml'
import json2yaml from 'json2yaml'
export default {
    name: "Pod",
    data() {
        return{
            searchValue:'',
            appLoading:false,
            // 分页
            currentPage:1,
            pageSize:10,
            pagesizeList:[1,2,3,10,20],
            // 命名空间
            namespaceValue:'default',
            namespaceList:[],
            namespaceUrl:common.namespaceURL,
            // pod
            podList:[],
            podTotal:0,
            podListData:{
                url:common.podURL,
                params:{
                    FilterName:'',
                    Namespace:'',
                    Limit:'',
                    Page:'',
                }
            },
            // yaml编辑器
            dialogOption:false,
            podDetailData:{
                url:common.podDetailURL,
                params:{
                    PodName:'',
                    Namespace:''
                }
            },
            podDetail:'',
            // yaml
            contentYaml:'',
            // yaml编辑器参数
            cmOptions: common.cmOptions,
            podUpdateData:{
                url:common.podUpdateURL,
                params:{
                    Namespace:'',
                    Content:''
                }
            },
            // 删除pod
            podDeleteData:{
                url:common.podDeleteURL,
                params:{
                    PodName:'',
                    Namespace:''
                }
            },
            activename:'container',
            expendKeys:[],
            expendMap:{},
            // 容器
            containerName:'',
            containerList:[],
            containerData:{
                url: common.podContainerURL,
                params:{
                    PodName:'',
                    Namespace:''
                }
            },
            // 日志
            log:'',
            containerLogData:{
                url:common.podContainerLogURL,
                params:{
                    ContainerName:'',
                    PodName:'',
                    Namespace:''
                }
            }
        }
    },
    methods:{
        // 时间转换
        timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON()
            date = date.substring(0, 19).replace('T', ' ')
            return date
        },
        // 重启次数
        restartTotal(scope){
            let total = 0
            // 如果pod重启数 = 多个容器加起来，用这个for循环
            // for (index in scope.row.status.containerStatuses){
            //     total = scope.row.status.containerStatuses[index].restartCount
            // }

            // 如果pod重启数 = 一个容器重启数，用这个方式
            total = scope.row.status.containerStatuses[0].restartCount
            return total
        },
        // 当页面最大展示数量发生变化时
        handleSizeChange(pageSize){
            this.pageSize = pageSize
            this.getPod()
        },
        // 当当前页发生变化时
        handleCurrentChange(currentPage){
            this.currentPage = currentPage
            this.getPod()
        },
        // 获取命名空间列表
        getNamespaceList() {
            httpClient.get(this.namespaceUrl)
                .then(res=>{
                    this.namespaceList = res.data.items
                })
                .catch(res=>{
                    this.$message.error({
                        message:res.msg
                    })
                })
        },
        // 获取pod列表
        getPod(){
            this.appLoading = true
            this.podListData.params.FilterName = this.searchValue
            this.podListData.params.Namespace = this.namespaceValue
            this.podListData.params.Page = this.currentPage
            this.podListData.params.Limit = this.pageSize

            httpClient.get(this.podListData.url, {params:this.podListData.params})
                .then(res=>{
                    // pod数组
                    this.podList = res.data.items
                    // pod总数
                    this.podTotal = res.data.total
                })
                .catch(res=>{
                    this.$message.error({
                        message:res.msg
                    })
                })
                .finally(()=>{
                    this.appLoading = false
                })
        },
        // 获取pod详情
        getPodYAML(scope){
            this.podDetailData.params.PodName = scope.row.metadata.name
            this.podDetailData.params.Namespace = this.namespaceValue

            httpClient.get(this.podDetailData.url,{params:this.podDetailData.params})
                .then( res => {
                    this.podDetail = res.data
                    // json转yaml
                    this.contentYaml = this.transYaml(this.podDetail)
                    // 打开编辑器
                    this.dialogOption = true
                })
                .catch( res => {
                    this.$message.error({
                        message:res.msg
                    })
                })
        },
        // json转yaml
        transYaml(data){
            return json2yaml.stringify(data)
        },
        // yaml转obj
        transObj(data){
            return yaml2obj.load(data)
        },
        // yaml发生变化时，将新的yaml赋值给contentYaml
        onChange(value){
            this.contentYaml = value
        },
        // 更新pod
        updatePod(){
            this.appLoading = true
            this.podUpdateData.params.Namespace = this.namespaceValue
            // 先将yaml格式转换为obj，再转换成json格式
            this.podUpdateData.params.Content = JSON.stringify(this.transObj(this.contentYaml))

            httpClient.put(this.podUpdateData.url,this.podUpdateData.params)
                .then( res => {
                    this.$message.success({
                        message:res.msg
                    })
                })
                .catch( res => {
                    this.$message.error({
                        message:res.msg
                    })
                })
                .finally( ()=>{
                    this.getPod()
                    this.dialogOption = false
                    this.appLoading = false
                })
        },
        // 弹出框（弹出是否确认删除）
        handleConfirm(scope,fn) {
            this.podDetail = scope.row
            let confirmContent = "是否删除" + this.podDetail.metadata.name
            this.$confirm( confirmContent,"提示",{
                confirmButtonText:"确定",
                cancelButtonText:"取消"
            })
                .then(()=>{
                    fn(scope)
                })
                .catch(()=>{
                    this.$message.info({
                        message:"取消操作"
                    })
                })
        },
        // 删除pod
        deletePod(scope){
            this.appLoading = true
            this.podDeleteData.params.PodName = scope.row.metadata.name
            this.podDeleteData.params.Namespace = this.namespaceValue
            httpClient.delete(this.podDeleteData.url,{data:this.podDeleteData.params})
                .then( res => {
                    this.$message.success({
                        message:res.msg
                    })
                })
                .catch( res => {
                    this.$message.error({
                        message:res.msg
                    })
                })
                .finally( ()=>{
                    this.getPod()
                    this.appLoading = false
                })
        },
        //
        getRowKeys(row){
            return row.metadata.name
        },
        //
        expendChange(row,expendRow){
            this.expendKeys=[]
            this.activename='container'
            if (expendRow.length > 0) {
                this.expendMap[row.metadata.name] = 1
                this.setExpendMap(row)
                row ? (this.expendKeys.push(row.metadata.name),this.getContainerName(row)) :''
            } else {
                this.expendMap[row.metadata.name] = 0
            }
        },
        //
        setExpendMap(row){
            let key
            for (key in this.expendMap) {
                key !== row.metadata.name ? this.expendMap[key] = 0:''
            }
        },
        // 获取pod的容器名称
        getContainerName(row){
            this.appLoading = true
            this.containerData.params.PodName = row.metadata.name
            this.containerData.params.Namespace = this.namespaceValue

            httpClient.get(this.containerData.url,{params:this.containerData.params})
                .then( res=>{
                    this.containerList = res.data
                    this.containerName = this.containerList[0]
                    this.getPodContainerLog(row.metadata.name)
                })
                .catch( res=>{
                    this.$message.error({
                        message:res.msg
                    })
                })
                .finally(()=>{
                    this.appLoading = false
                })
        },
        // 获取容器日志
        getPodContainerLog(podName){
            this.appLoading = true
            this.containerLogData.params.ContainerName = this.containerName
            this.containerLogData.params.PodName = podName
            this.containerLogData.params.Namespace = this.namespaceValue

            httpClient.get(this.containerLogData.url,{params:this.containerLogData.params})
                .then( res=>{
                    this.log = res.data
                })
                .catch( res=>{
                    this.$message.error({
                        message:res.msg
                    })
                })
                .finally(()=>{
                    this.appLoading = false
                })
        }
    },
    // 打开页面就自动渲染
    mounted() {
        this.getNamespaceList()
        this.getPod()
    }
}
</script>

<style scoped>
.pod-head-card{
    border-radius: 1px;
    margin-bottom: 5px;
}
.pod-body-podname:hover {
    color: rgb(84, 138, 238);
    cursor: pointer;
    font-weight: bold;
    font-size: 15px;
}
.success-dot{
    display:inline-block;
    width: 7px;
    height:7px;
    background: rgb(27, 202, 21);
    border-radius:50%;
    border:1px solid rgb(27, 202, 21);
    margin-right: 10px;
}
.warning-dot{
    display:inline-block;
    width: 7px;
    height:7px;
    background: rgb(233, 200, 16);
    border-radius:50%;
    border:1px solid rgb(233, 200, 16);
    margin-right: 10px;
}
.error-dot{
    display:inline-block;
    width: 7px;
    height:7px;
    background: rgb(226, 23, 23);
    border-radius:50%;
    border:1px solid rgb(226, 23, 23);
    margin-right: 10px;
}
.success-status {
    color: rgb(27, 202, 21);
}
.warning-status {
    color: rgb(233, 200, 16);
}
.error-status {
    color: rgb(226, 23, 23);
}
.pod-body-log-card{
    border-radius:1px;
    height:600px;
    /*内容超过页面时，有滚动条*/
    overflow:auto;
    background-color: #060101;
    margin-top: 5px;
}
</style>