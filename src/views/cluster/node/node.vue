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
                            <el-button size="small" type="primary" icon="Refresh" plain @click="getNode()">搜索</el-button>
                        </el-col>
                        <el-col style="text-align: right;padding-right: 10px" :span="6">
                            <el-button icon="Refresh" size="small" type="primary" @click="getNode()">刷新</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" style="margin-top: 5px" shadow="never">
                    <el-table :data="nodeList" v-loading="appLoading">
                        <el-table-column width="80"></el-table-column>
                        <el-table-column label="node" width="240">
                            <template v-slot="scope">
                                <a style="color: blue;font-weight: bold">{{ scope.row.metadata.name }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="240">
                            <template v-slot="scope">
                                <div :class="{'success-dot':scope.row.status.conditions[scope.row.status.conditions.length -1 ].type === 'Ready',
                                            'error-dot':scope.row.status.conditions[scope.row.status.conditions.length -1 ].type !== 'Ready'}"></div>
                                <el-popover placement="right" trigger="hover" width="300px" :content="scope.row.status.conditions[scope.row.status.conditions.length -1 ].message">
                                    <template #reference>
                                        <span :class="{'success-status':scope.row.status.conditions[scope.row.status.conditions.length -1 ].type === 'Ready',
                                            'error-status':scope.row.status.conditions[scope.row.status.conditions.length -1 ].type !== 'Ready'}">
                                                {{ scope.row.status.conditions[scope.row.status.conditions.length -1 ].type }}
                                        </span>
                                    </template>
                                </el-popover>
                            </template>
                        </el-table-column>
                        <el-table-column label="节点IP" width="240">
                            <template v-slot="scope">
                                <el-tag type="success">
                                    <a style="font-size: 13px">{{ scope.row.status.addresses[0].address }}</a>
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="版本" width="240">
                            <template v-slot="scope">
                                    <el-tag type="warning">
                                        <a style="font-size: 13px">{{ scope.row.status.nodeInfo.kubeProxyVersion}}</a>
                                    </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="引擎版本" width="240">
                            <template v-slot="scope">
                                <el-tag type="warning">
                                    <a style="font-size: 13px">{{ scope.row.status.nodeInfo.containerRuntimeVersion}}</a>
                                </el-tag>
                            </template>

                        </el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button size="small" icon="Edit" type="primary" plain @click="getNodeDetail(scope)">详情</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination style="margin-top:10px;margin-left: 50px" background :current-page="currentPage"
                                   :page-size="pagesize" :page-sizes="pagesizeList" :total="nodeTotal" layout="total,sizes,prev,pager,next,jumper"
                                   @current-change="currentChange" @size-change="sizeChange">
                    </el-pagination>
                </el-card>
            </el-col>
        </el-row>
        <el-dialog title="Node详情" v-model="dialogOption" width="45%" top="2%">
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
    name: "node",
    data () {
        return{
            appLoading:false,
            searchValue:"",
            // node
            nodeList:[],
            nodeTotal: 0,
            nodeListData:{
                url:common.nodeURL,
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
            nodeDetail:'',
            nodeDetailData:{
                url:common.nodeDetailURL,
                params:{
                    NodeName:''
                }
            },
            cmOptions: common.cmOptions,
            contentYaml:'',
        }
    },
    methods: {
        getNode() {
            this.appLoading = true
            // 赋值
            this.nodeListData.params.FilterName = this.searchValue
            this.nodeListData.params.Limit = this.pagesize
            this.nodeListData.params.Page = this.currentPage
            // 发起请求
            httpClient.get(this.nodeListData.url,{params: this.nodeListData.params})
                .then( res => {
                    this.nodeList = res.data.items
                    this.nodeTotal = res.data.total
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
        getNodeDetail(scope) {
            this.nodeDetailData.params.NodeName = scope.row.metadata.name
            httpClient.get(this.nodeDetailData.url,{params:this.nodeDetailData.params})
                .then( res => {
                    this.nodeDetail = res.data
                    // json转换成yaml
                    this.contentYaml = this.transYaml(this.nodeDetail)
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
            this.getNode()
        },
        // 页面大小发生变化时触发，赋值并重新获取列表
        sizeChange(limit) {
            this.pagesize = limit
            this.getNode()
        },
    },
    // mounted声明周期的操作，用于在页面加载完成之前获取某些数据
    mounted() {
        this.getNode()
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