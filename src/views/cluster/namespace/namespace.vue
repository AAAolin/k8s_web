<template>
    <div>
        <el-row>
            <el-col :span="24">
                <!-- shadow="never" 卡片阴影，不显示-->
                <el-card :body-style="{padding:'10px'}" shadow="never">
                    <el-row>
                        <el-col :span="18">
                            <!-- clearable 可清空输入内容-->
                            <el-input style="margin-right: 5px; width: 160px" size="small" v-model="searchValue" placeholder="请输入" clearable></el-input>
                            <el-button size="small" type="primary" icon="Refresh" plain @click="getNamespace()">搜索</el-button>
                        </el-col>
                        <el-col style="text-align: right;padding-right: 10px" :span="6">
                            <el-button icon="Refresh" size="small" type="primary" @click="getNamespace()">刷新</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" style="margin-top: 5px" shadow="never">
                    <el-table :data="namespaceList" v-loading="appLoading">
                        <el-table-column width="80"></el-table-column>
                        <el-table-column label="namespace" width="400">
                            <template v-slot="scope">
                                <a style="color: blue;font-weight: bold">{{ scope.row.metadata.name }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="400">
                            <template v-slot="scope">
                                <div :class="{'success-dot':scope.row.status.phase === 'Active','error-dot':scope.row.status.phase !== 'Active'}"></div>
                                <span :class="{'success-status':scope.row.status.phase === 'Active','error-status':scope.row.status.phase !== 'Active'}">
                                    {{ scope.row.status.phase }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column label="创建时间" width="400">
                            <template v-slot="scope">
                                <a style="font-size: 13px">{{ timeTrans(scope.row.metadata.creationTimestamp) }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" >
                            <template v-slot="scope">
                                <el-button size="small" icon="Edit" type="primary" plain @click="getNamespaceDetail(scope)">详情</el-button>
                                <el-button size="small" icon="Delete" type="danger" plain @click="handleConfirm(scope,deleteNamespace)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination style="margin-top:10px;margin-left: 50px" background :current-page="currentPage"
                                   :page-size="pagesize" :page-sizes="pagesizeList" :total="namespaceTotal" layout="total,sizes,prev,pager,next,jumper"
                                   @current-change="currentChange" @size-change="sizeChange">
                    </el-pagination>
                </el-card>
            </el-col>
        </el-row>
        <el-dialog title="namespace详情" v-model="dialogOption" width="45%" top="2%">
            <!--          options="cmOptions" 是编辑器配置-->
            <codemirror :value="contentYaml" :options="cmOptions" border height="500" style="font-size:14px;">
            </codemirror>
            <template #footer>
                <el-button @click="dialogOption = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import common from "@/views/common/Config"
import httpClient from "@/request"
import json2yaml from 'json2yaml'
export default {
    name: "namespace",
    data () {
        return{
            appLoading:false,
            searchValue:"",
            // namespace
            namespaceList:[],
            namespaceTotal: 0,
            namespaceListData:{
                url:common.namespaceURL,
                params:{
                    FilterName:'',
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
            namespaceDetail:'',
            namespaceDetailData:{
                url:common.namespaceDetailURL,
                params:{
                    NamespaceName:''
                }
            },
            cmOptions: common.cmOptions,
            contentYaml:'',
            namespaceDeleteData:{
                url:common.namespaceDeleteURL,
                params:{
                    NamespaceName:''
                }
            },
        }
    },
    methods: {
        getNamespace() {
            this.appLoading = true
            // 赋值
            this.namespaceListData.params.FilterName = this.searchValue
            this.namespaceListData.params.Limit = this.pagesize
            this.namespaceListData.params.Page = this.currentPage
            // 发起请求
            httpClient.get(this.namespaceListData.url,{params: this.namespaceListData.params})
                .then( res => {
                    this.namespaceList = res.data.items
                    this.namespaceTotal = res.data.total
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
        getNamespaceDetail(scope) {
            this.namespaceDetailData.params.NamespaceName = scope.row.metadata.name
            httpClient.get(this.namespaceDetailData.url,{params:this.namespaceDetailData.params})
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
        // 页数发生变化时触发，赋值并重新获取列表
        currentChange(page) {
            this.currentPage = page
            this.getNamespace()
        },
        // 页面大小发生变化时触发，赋值并重新获取列表
        sizeChange(limit) {
            this.pagesize = limit
            this.getNamespace()
        },
        deleteNamespace(scope) {
            this.appLoading = true
            this.namespaceDeleteData.params.NamespaceName = scope.row.metadata.name
            httpClient.delete(this.namespaceDeleteData.url,{data:this.namespaceDeleteData.params})
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
    },
    // mounted声明周期的操作，用于在页面加载完成之前获取某些数据
    mounted() {
        this.getNamespace()
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