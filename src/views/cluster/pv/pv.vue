<template>
    <div>
        <el-row>
            <el-col :span="24">
                <el-card shadow="never" :body-style="{padding:'10px'}" style="margin-bottom: 5px">
                    <el-row>
                        <el-col :span="10">
                            <el-input v-model="searchValue" style="width: 160px;margin-right: 5px" size="small" placeholder="请输入" clearable></el-input>
                            <el-button type="primary" plain icon="search" size="small" @click="getPV">搜索</el-button>
                        </el-col>
                        <el-col :span="14" style="text-align: right;padding-right: 10px">
                            <el-button type="primary" icon="Refresh" size="small" @click="getPV">刷新</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card shadow="never" :body-style="{padding:'10px'}">
                    <el-table :data="pvList" v-loading="appLoading">
                        <el-table-column label="名称">
                            <template v-slot="scope">
                                <el-popover placement="right" :width="200" trigger="hover" :content="scope.row.metadata.name">
                                    <template #reference>
                                        <a style="color: blue;font-weight: bold">{{ ellipsis(scope.row.metadata.name) }}</a>
                                    </template>
                                </el-popover>
                            </template>
                        </el-table-column>
                        <el-table-column label="容量">
                            <template v-slot="scope">
                                {{ scope.row.spec.capacity.storage }}
                            </template>
                        </el-table-column>
                        <el-table-column label="访问权限">
                            <template v-slot="scope">
                                {{ scope.row.spec.accessModes[0] }}
                            </template>
                        </el-table-column>
                        <el-table-column label="回收策略">
                            <template v-slot="scope">
                                {{ scope.row.spec.persistentVolumeReclaimPolicy }}
                            </template>
                        </el-table-column>
                        <el-table-column label="状态">
                            <template v-slot="scope">
                                {{ scope.row.status.phase }}
                            </template>
                        </el-table-column>
                        <el-table-column label="绑定pvc">
                            <template v-slot="scope">
                                <el-popover placement="right" :width="200" trigger="hover" :content="scope.row.spec.claimRef.name">
                                    <template #reference>
                                        <a style="color: blue;font-weight: bold">{{ scope.row.spec.claimRef.namespace }} / {{ ellipsis(scope.row.spec.claimRef.name) }}</a>
                                    </template>
                                </el-popover>
                            </template>
                        </el-table-column>
                        <el-table-column label="storageClass">
                            <template v-slot="scope">
                                <a>{{ scope.row.spec.storageClassName }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button type="primary" icon="edit" size="small" @click="getPVDetail(scope)">详情</el-button>
                                <el-button type="danger" icon="edit" size="small" @click="handleConfirm(scope,deletePV)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination style="margin-top:10px;margin-left: 50px" background :current-page="currentPage"
                                   :page-size="pagesize" :page-sizes="pagesizeList" :total="pvTotal" layout="total,sizes,prev,pager,next,jumper"
                                   @current-change="currentChange" @size-change="sizeChange">
                    </el-pagination>
                </el-card>
            </el-col>
        </el-row>
        <el-dialog title="YAML编辑器" v-model="dialogOption" width="45%" top="2%">
            <codemirror :value="contentYaml" :options="cmOptions" height="500" style="font-size:14px;"></codemirror>
            <template #footer>
                <el-button @click="this.dialogOption = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import common from "@/views/common/Config"
import httpClient from "@/request";
import json2yaml from 'json2yaml'
export default {
    name: "pv",
    data() {
        return {
            appLoading:false,
            searchValue: "",
            // yaml编辑器
            dialogOption: false,
            cmOptions:common.cmOptions,
            // 分页
            currentPage: 1,
            pagesize: 10,
            pagesizeList: [1,2,3,4,5,10,20],
            // pv
            pvTotal: 0,
            pvList:[],
            pvListData:{
                url: common.pvURL,
                params: {
                    FilterName: '',
                    Page: '',
                    Limit: ''
                }
            },
            // pvDetail
            pvDetail: "",
            contentYaml:"",
            pvDetailData: {
                url: common.pvDetailURL,
                params: {
                    PVName: ""
                }
            },
            // 删除pv
            pvDeleteData: {
                url: common.pvDeleteURL,
                params: {
                    PVName: ""
                }
            }
        }
    },
    methods: {
        currentChange(page) {
            this.currentPage = page
            this.getPV()
        },
        sizeChange(limit) {
            this.pagesize = limit
            this.getPV()
        },
        ellipsis(value) {
            return value.length > 15 ? value.substring(0,15) + "..." : value
        },
        transYaml(value) {
            return json2yaml.stringify(value)
        },
        getPV(){
            this.appLoading = true
            this.pvListData.params.FilterName = this.searchValue
            this.pvListData.params.Page = this.currentPage
            this.pvListData.params.Limit = this.pagesize

            httpClient.get(this.pvListData.url,{params:this.pvListData.params})
                .then(res => {
                    this.pvList = res.data.items
                    this.pvTotal = res.data.total
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
                .finally(() => {
                    this.appLoading = false
                })
        },
        getPVDetail(scope) {
            this.dialogOption = true
            this.pvDetailData.params.PVName = scope.row.metadata.name
            httpClient.get(this.pvDetailData.url,{params:this.pvDetailData.params})
                .then(res => {
                    this.pvDetail = res.data
                    this.contentYaml = this.transYaml(this.pvDetail)
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
        },
        deletePV(scope) {
            this.pvDeleteData.params.PVName = scope.row.metadata.name
            httpClient.delete(this.pvDeleteData.url,{data:this.pvDeleteData.params})
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
                    this.getPV()
                })
        },
        handleConfirm(scope,fn) {
            this.pvDetail = scope.row
            let confirmContent="是否删除"+this.pvDetail.metadata.name
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
    },
    mounted() {
        this.getPV()
    }
}
</script>

<style scoped>

</style>