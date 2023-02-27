<template>
    <div>
        <el-row>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" shadow="never">
                    <el-row>
                        <el-col :span="8">
                            <span style="font-size: 15px">命名空间</span>
                            <!--                            filterable 下拉框可以输入关键字-->
                            <el-select style="margin-left: 10px" v-model="namespaceValue" size="small" filterable @change="getDaemonSet">
                                <el-option v-for="(item,index) in namespaceList" :key="index" :value="item.metadata.name" :label="item.metadata.name"></el-option>
                            </el-select>
                        </el-col>
                        <el-col style="text-align: right;padding-right: 10px" :span="16">
                            <el-button icon="Refresh" size="small" type="primary" @click="getDaemonSet()">刷新</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="24">
                <!-- shadow="never" 卡片阴影，不显示-->
                <el-card :body-style="{padding:'10px'}"  style="margin-top: 5px" shadow="never">
                    <!-- clearable 可清空输入内容-->
                    <el-input style="margin-right: 5px; width: 160px" size="small" v-model="searchValue" placeholder="请输入" clearable></el-input>
                    <el-button size="small" type="primary" icon="Refresh" plain @click="getNamespace()">搜索</el-button>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" style="margin-top: 5px" shadow="never">
                    <el-table :data="daemonSetList" v-loading="appLoading">
                        <el-table-column width="80"></el-table-column>
                        <el-table-column label="DaemonSet" width="240">
                            <template v-slot="scope">
                                <a style="color: blue;font-weight: bold">{{ scope.row.metadata.name }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="标签" width="240">
                            <template v-slot="scope">
                                <div v-for="(value,key) in scope.row.metadata.labels" :key="key">
                                    <el-popover placement="right" :width="200" trigger="hover" :content="key + ': ' + value">
                                        <template #reference>
                                            <el-tag type="warning" style="font-size: 13px">{{ ellipsis(key + ': ' + value) }}</el-tag>
                                        </template>
                                    </el-popover>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="容器组" width="240">
                            <template v-slot="scope">
                                <a>{{ scope.row.status.numberAvailable>0?scope.row.status.numberAvailable:0 }} / {{ scope.row.status.desiredNumberScheduled>0?scope.row.status.desiredNumberScheduled:0 }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="容器镜像" width="240">
                            <template v-slot="scope">
                                <div v-for="(item,index) in scope.row.spec.template.spec.containers" :key="index">
                                <el-popover placement="right" :width="200" trigger="hover" :content="item.image">
                                    <template #reference>
                                        <el-tag style="margin-bottom:5px;">
                                            <a style="font-size: 13px">{{ ellipsis(item.image.split('/')[2]==undefined?item.image:item.image.split('/') [2]) }}</a>
                                        </el-tag>
                                    </template>
                                </el-popover>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="创建时间" width="240">
                            <template v-slot="scope">
                                <a style="font-size: 13px">{{ timeTrans(scope.row.metadata.creationTimestamp) }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" >
                            <template v-slot="scope">
                                <el-button size="small" icon="Edit" type="primary" plain @click="getDaemonSetDetail(scope)">详情</el-button>
                                <el-button size="small" icon="Delete" type="danger" plain @click="handleConfirm(scope,deleteDaemonSet)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination style="margin-top:10px;margin-left: 50px" background :current-page="currentPage"
                                   :page-size="pagesize" :page-sizes="pagesizeList" :total="daemonSetTotal" layout="total,sizes,prev,pager,next,jumper"
                                   @current-change="currentChange" @size-change="sizeChange">
                    </el-pagination>
                </el-card>
            </el-col>
        </el-row>
        <el-dialog title="daemonSet详情" v-model="dialogOption" width="45%" top="2%">
            <!--          options="cmOptions" 是编辑器配置-->
            <codemirror :value="contentYaml" :options="cmOptions" border height="500" style="font-size:14px;" @change="onChange">
            </codemirror>
            <template #footer>
                <el-button @click="dialogOption = false">取消</el-button>
                <el-button type="primary" @click="daemonSetUpdate">更新</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import common from "@/views/common/Config"
import httpClient from "@/request"
import json2yaml from 'json2yaml'
import yaml2obj from "js-yaml";
export default {
    name: "namespace",
    data () {
        return{
            appLoading:false,
            searchValue:"",
            // namespace
            namespaceList:[],
            namespaceValue:'kube-system',
            // daemonSet
            daemonSetList: [],
            daemonSetTotal: 0,
            daemonSetListData:{
                url:common.daemonSetURL,
                params:{
                    FilterName:'',
                    Namespace:'',
                    Limit:'',
                    Page:''
                }
            },
            // 分页
            currentPage: 1,
            pagesize: 10,
            pagesizeList:[1,2,3,10,20,30],
            // 编辑器
            dialogOption: false,
            daemonSetDetail:'',
            daemonSetDetailData:{
                url:common.daemonSetDetailURL,
                params:{
                    DaemonSetName:'',
                    Namespace:''
                }
            },
            cmOptions: common.cmOptions,
            contentYaml:'',
            daemonSetUpdateData:{
                url:common.daemonSetUpdateURL,
                params:{
                    Content:'',
                    Namespace:''
                }
            },
            daemonSetDeleteData:{
                url:common.daemonSetDeleteURL,
                params:{
                    DaemonSetName:'',
                    Namespace:''
                }
            },
        }
    },
    methods: {
        getNamespace() {
            httpClient.get(common.namespaceURL)
                .then(res => {
                    this.namespaceList = res.data.items
                })
                .catch(res => {
                    this.$message.error({
                        message:res.msg
                    })
                })
        },
        getDaemonSet() {
            this.appLoading = true
            // 赋值
            this.daemonSetListData.params.FilterName = this.searchValue
            this.daemonSetListData.params.Namespace = this.namespaceValue
            this.daemonSetListData.params.Limit = this.pagesize
            this.daemonSetListData.params.Page = this.currentPage
            // 发起请求
            httpClient.get(this.daemonSetListData.url,{params: this.daemonSetListData.params})
                .then( res => {
                    this.daemonSetList = res.data.items
                    this.daemonSetTotal = res.data.total
                })
                .catch( res => {
                    this.$message.error({
                        message:res.msg
                    })
                })
                .finally(() => {
                    this.appLoading = false
                })
        },

        // json转换成yaml
        transYaml(content) {
            return json2yaml.stringify(content)
        },
        // yaml转换成obj
        transObj(content){
            return yaml2obj.load(content)
        },
        onChange(value){
            this.contentYaml = value
        },
        getDaemonSetDetail(scope) {
            this.daemonSetDetailData.params.DaemonSetName = scope.row.metadata.name
            this.daemonSetDetailData.params.Namespace = this.namespaceValue
            httpClient.get(this.daemonSetDetailData.url,{params:this.daemonSetDetailData.params})
                .then( res => {
                    this.namespaceDetail = res.data
                    // json转换成yaml
                    this.contentYaml = this.transYaml(this.namespaceDetail)
                    this.dialogOption = true
                })
                .catch( res => {
                    this.$message.error({
                        message:res.msg
                    })
                })

        },
        daemonSetUpdate(){
            this.appLoading = true
            // yaml转换成json
            let content = JSON.stringify(this.transObj(this.contentYaml))
            this.daemonSetUpdateData.params.Content = content
            this.daemonSetUpdateData.params.Namespace = this.namespaceValue
            httpClient.put(this.daemonSetUpdateData.url,this.daemonSetUpdateData.params)
                .then( res=> {
                    this.$message.success({
                        message: res.msg

                    })
                })
                .catch( res => {
                    this.$message.error({
                        message:res.msg
                    })
                })
                .finally(() => {
                    this.getDaemonSet()
                    this.appLoading = false
                    this.dialogOption = false
                })
        },
        // 页数发生变化时触发，赋值并重新获取列表
        currentChange(page) {
            this.currentPage = page
            this.getDaemonSet()
        },
        // 页面大小发生变化时触发，赋值并重新获取列表
        sizeChange(limit) {
            this.pagesize = limit
            this.getDaemonSet()
        },
        deleteDaemonSet(scope) {
            this.appLoading = true
            this.daemonSetDeleteData.params.DaemonSetName = scope.row.metadata.name
            this.daemonSetDeleteData.params.Namespace = this.namespaceValue
            httpClient.delete(this.daemonSetDeleteData.url,{data:this.daemonSetDeleteData.params})
                .then(res => {
                    this.$message.success({
                        message: res.msg
                    })
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
                .finally(() => {
                    this.appLoading = true
                    this.getNamespace()
                })
        },
        handleConfirm(scope,fn) {
            let confirmContent="是否删除"+scope.row.metadata.name
            this.$confirm(confirmContent,"提示",{
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
        // 格林威治时间转为北京时间
        timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON()
            date = date.substring(0, 19).replace('T', ' ')
            return date
        },
        // 判断value是否大于15位，如果大于，大于部分显示...，否则正常显示
        ellipsis(value) {
            return value.length>15?value.substring(0,15)+"...":value
        },
    },
    // mounted声明周期的操作，用于在页面加载完成之前获取某些数据
    mounted() {
        this.getNamespace()
        this.getDaemonSet()
    }
}
</script>

<style scoped>
.success-dot{
    display:inline-block;
    width: 7px;
    height:7px;
    background: rgb(27, 202, 21);
    border-radius:50%;
    border:1px solid rgb(27, 202, 21);
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
.error-status {
    color: rgb(226, 23, 23);
}
</style>