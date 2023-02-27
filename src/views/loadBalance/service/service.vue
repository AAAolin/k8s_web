<template>
    <div>
        <el-row>
            <el-col :span="24">
                <!--                shadow="never" 卡片阴影，不显示-->
                <el-card :body-style="{padding:'10px'}" shadow="never">
                    <el-row>
                        <el-col :span="8">
                            <span style="font-size: 15px">命名空间</span>
<!--                            filterable 下拉框可以输入关键字-->
                            <el-select style="margin-left: 10px" v-model="namespaceValue" size="small" filterable @change="getService">
                                <el-option v-for="(itme,index) in namespaceList" :key="index" :value="itme.metadata.name" :label="itme.metadata.name"></el-option>
                            </el-select>
                        </el-col>
                        <el-col style="text-align: right;padding-right: 10px" :span="16">
                            <el-button icon="Refresh" size="small" type="primary" @click="getService()">刷新</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" style="margin-top: 5px" shadow="never">
                    <el-button style="margin-right: 5px" size="small" type="primary" icon="edit" @click="active = true">创建</el-button>
                    <!--                  clearable 可清空输入内容-->
                    <el-input style="margin-right: 5px; width: 160px" size="small" v-model="searchValue" placeholder="请输入" clearable></el-input>
                    <el-button size="small" type="primary" icon="Refresh" plain @click="getService()">搜索</el-button>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" style="margin-top: 5px" shadow="never">
                    <el-table :data="serviceList" v-loading="appLoading">
                        <el-table-column width="40"></el-table-column>
                        <el-table-column label="service" width="220">
                            <template v-slot="scope">
                                <a style="color: blue;font-weight: bold">{{ scope.row.metadata.name }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="selectorLabel" width="220">
                            <template v-slot="scope">
                                <div v-for="(value,key) in scope.row.spec.selector" :key="key">
                                    <el-popover placement="right" trigger="hover" width="200px" :content="key + ': ' +value">
                                        <template #reference>
                                            <el-tag type="warning">
                                                <a style="font-size: 13px">{{ ellipsis(key + ': ' + value) }}</a>
                                            </el-tag>
                                        </template>
                                    </el-popover>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="类型" width="220">
                            <template v-slot="scope">
                                <a> {{ scope.row.spec.type }} </a>
                            </template>
                        </el-table-column>
                        <el-table-column label="Cluster-IP" width="220">
                            <template v-slot="scope">
                                <el-tag type="success">
                                    <a style="font-size: 13px">{{ scope.row.spec.clusterIP }}</a>
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="Port" width="220">
                            <template v-slot="scope">
                                <div v-for="(item,index) in scope.row.spec.ports" :key="index">
                                    <el-tag type="success">
                                        <a style="font-size: 13px">{{ item.port }}</a>
                                        <a v-if="scope.row.spec.type === 'NodePort'" style="font-size: 14px">:{{ item.nodePort }}</a>
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="创建时间" width="220">
                            <template v-slot="scope">
                                <a>{{ timeTrans(scope.row.metadata.creationTimestamp) }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button size="small" icon="Edit" type="primary" plain @click="getServiceDetail(scope)">YAML</el-button>
                                <el-button size="small" icon="Delete" type="danger" plain @click="handleConfirm(scope,deleteservice)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination style="margin-top:10px;margin-left: 50px" background :current-page="currentPage"
                                   :page-size="pagesize" :page-sizes="pagesizeList" :total="serviceTotal" layout="total,sizes,prev,pager,next,jumper"
                                   @current-change="currentChange" @size-change="sizeChange">
                    </el-pagination>
                </el-card>
            </el-col>
        </el-row>
        <el-dialog title="YAML编辑" v-model="dialogOption" width="45%" top="2%">
            <!--          options="cmOptions" 是编辑器配置-->
            <codemirror :value="contentYaml" :options="cmOptions" border @change="onChange" height="500" style="font-size:14px;">
            </codemirror>
            <template #footer>
                <el-button @click="dialogOption = false">取消</el-button>
                <el-button type="primary" @click="serviceUpdate">更新</el-button>
            </template>
        </el-dialog>
        <el-drawer v-model="active" direction="rtl" title="创建service">
            <template #default>
                <el-form :model="serviceCreate" :rules="serviceCreateRules" ref="serviceCreate" :label-postion="labelPostion" label-width="100px">
                    <el-form-item class="service-create-form" label="名称" prop="Name">
                        <el-input v-model="serviceCreate.Name" maxlength="32" placeholder="请输入service名称" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="service-create-form" label="命名空间" prop="Namespace">
                        <el-select v-model="serviceCreate.Namespace" filterable>
                            <el-option v-for="item in namespaceList" :key="item.metadata.name" :label="item.metadata.name" :value="item.metadata.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item class="service-create-form" label="标签" prop="Label_str">
                        <el-input v-model="serviceCreate.Label_str" placeholder="示例: project=ms,app=gateway" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="service-create-form" label="容器端口" prop="TargetPort">
                        <el-input v-model="serviceCreate.TargetPort" placeholder="请输入容器端口" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="service-create-form" label="service端口" prop="Port">
                        <el-input v-model="serviceCreate.Port" placeholder="请输入service端口" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="service-create-form" label="NodePort" prop="NodePort">
                        <el-input v-model="serviceCreate.NodePort" placeholder="请在30000-32767内输入对外端口" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="service-create-form" label="类型" prop="Type">
                        <el-select v-model="serviceCreate.Type" placeholder="请选择匹配类型">
                            <el-option value="ClusterIP" label="ClusterIP"></el-option>
                            <el-option value="NodePort" label="NodePort"></el-option>
                            <el-option value="Ingress" label="Ingress"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </template>
            <template #footer>
                <el-button @click="handleConfirmPreserve">取消</el-button>
                <el-button type="primary" @click="formSubmit('serviceCreate',createService)">下一步</el-button>
            </template>
        </el-drawer>
    </div>
</template>

<script>
import common from "@/views/common/Config"
import httpClient from "@/request"
import yaml2obj from 'js-yaml'
import json2yaml from 'json2yaml'
export default {
    name: "service",
    data () {
        return{
            active: false,
            appLoading:false,
            // 命名空间
            namespaceValue:"default",
            namespaceList:[],
            searchValue:"",
            // service
            serviceList:[],
            serviceTotal: 0,
            serviceListData:{
                url:common.serviceURL,
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
            serviceDetail:'',
            serviceDetailData:{
                url:common.serviceDetailURL,
                params:{
                    Servicev1Name:'',
                    Namespace:''
                }
            },
            serviceUpdateData:{
                url:common.serviceUpdateURL,
                params:{
                    Content:'',
                    Namespace:''
                }
            },
            cmOptions: common.cmOptions,
            contentYaml:'',
            serviceDeleteData:{
                url: common.serviceDeleteURL,
                params:{
                    Servicev1Name:'',
                    Namespace:''
                }
            },
            // 创建service
            serviceCreate:{
                Name: '',
                Namespace: 'default',
                Label_str: '',
                Labels: {},
                Port: '',
                TargetPort: '',
                NodePort: '',
                Type: '',
            },
            serviceCreateData:{
                url: common.serviceCreateURL,
                params: {}
            },
            serviceCreateRules:{
                Name:[{
                    required: true,
                    message:'请输入名称',
                    trigger: 'change'
                }],
                Namespace:[{
                    required: true,
                    message:'请输入命名空间',
                    trigger: 'change'
                }],
                Label_str:[{
                    required: true,
                    message:'请输入标签',
                    trigger: 'change'
                }],
                Port:[{
                    required: true,
                    message:'请输入service端口',
                    trigger: 'change'
                }],
                TargetPort:[{
                    required: true,
                    message:'请输入容器端口',
                    trigger: 'change'
                }],
                Type:[{
                    required: true,
                    message:'请选择类型',
                    trigger: 'change'
                }],
            },
        }
    },
    methods: {
        getNamespace() {
            httpClient.get(common.namespaceURL)
                .then( res => {
                    this.namespaceList = res.data.items
                })
                .catch( res => {
                    this.$message.error({
                        message:res.msg
                    })
                })
        },
        getService() {
            this.appLoading = true
            // 赋值
            this.serviceListData.params.FilterName = this.searchValue
            this.serviceListData.params.Namespace = this.namespaceValue
            this.serviceListData.params.Limit = this.pagesize
            this.serviceListData.params.Page = this.currentPage
            // 发起请求
            httpClient.get(this.serviceListData.url,{params: this.serviceListData.params})
                .then( res => {
                    this.serviceList = res.data.items
                    this.serviceTotal = res.data.total
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
        createService() {
            this.appLoading = true

            // 验证标签格式是否正确
            let reg = new RegExp("(^[A-Za-z]+=[A-Za-z0-9]+).*")
            if (!reg.test(this.serviceCreate.Label_str)) {
                this.$message.warning({
                    message: "标签填写异常，请确认后重新填写"
                })
                return
            }

            console.log(this.serviceCreate.Label_str)
            let label = new Map()
            let a = (this.serviceCreate.Label_str).split(",")
            a.forEach(item => {
                let b = item.split("=")
                label[b[0]] = b[1]
            })

            this.serviceCreate.Labels = label
            this.serviceCreateData.params = this.serviceCreate
            this.serviceCreateData.params.Port = parseInt(this.serviceCreate.Port)
            this.serviceCreateData.params.TargetPort = parseInt(this.serviceCreate.TargetPort)
            this.serviceCreateData.params.NodePort = parseInt(this.serviceCreate.NodePort)

            console.log(this.serviceCreateData.params.Labels)
            httpClient.post(this.serviceCreateData.url,this.serviceCreateData.params)
                .then(res => {
                    this.$message.success({
                        message: res.msg
                    })
                    this.resetForm('serviceCreate')
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
                .finally(() => {
                    this.active = false
                    this.appLoading = false
                    this.getService()
                })
        },
        formSubmit(data,fn){
            this.$refs[data].validate((valid)=>{
                if (valid){
                    fn()
                }else {
                    return false;
                }
            })
        },
        //重置表单
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },
        // json转换成yaml
        transYaml(content) {
            return json2yaml.stringify(content)
        },
        // yaml转换成obj
        transObj(content){
            return yaml2obj.load(content)
        },
        getServiceDetail(scope) {
            this.serviceDetailData.params.Servicev1Name = scope.row.metadata.name
            this.serviceDetailData.params.Namespace = this.namespaceValue
            httpClient.get(this.serviceDetailData.url,{params:this.serviceDetailData.params})
                .then( res => {
                    this.serviceDetail = res.data
                    // json转换成yaml
                    this.contentYaml = this.transYaml(this.serviceDetail)
                    this.dialogOption = true
                })
                .catch( res => {
                    this.$message.error({
                        message:res.msg
                    })
                })

        },
        serviceUpdate(){
            this.appLoading = true
            // yaml转换成json
            let content = JSON.stringify(this.transObj(this.contentYaml))
            this.serviceUpdateData.params.Content = content
            this.serviceUpdateData.params.Namespace = this.namespaceValue
            httpClient.put(this.serviceUpdateData.url,this.serviceUpdateData.params)
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
                    this.getService()
                    this.appLoading = false
                    this.dialogOption = false
                })
        },
        // 当yaml发生改变时，赋值给contentYaml
        onChange(value) {
            this.contentYaml = value
        },
        // 判断value是否大于15位，如果大于，大于部分显示...，否则正常显示
        ellipsis(value) {
            return value.length>15?value.substring(0,15)+"...":value
        },
        // 格林威治时间转为北京时间
        timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON()
            date = date.substring(0, 19).replace('T', ' ')
            return date
        },
        // 页数发生变化时触发，赋值并重新获取列表
        currentChange(page) {
            this.currentPage = page
            this.getService()
        },
        // 页面大小发生变化时触发，赋值并重新获取列表
        sizeChange(limit) {
            this.pagesize = limit
            this.getService()
        },
        deleteservice(scope){
            this.appLoading = true
            this.serviceDeleteData.params.Servicev1Name = scope.row.metadata.name
            this.serviceDeleteData.params.Namespace = this.namespaceValue

            httpClient.delete(this.serviceDeleteData.url,{data:this.serviceDeleteData.params})
                .then(res=>{
                    this.$message.success({
                        message:res.msg
                    })
                })
                .catch(res=>{
                    this.$message.error({
                        message:res.msg
                    })
                })
                .finally(()=>{
                    this.getService()
                    this.appLoading = false
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
        // 创建时点击取消，弹出是否保存
        handleConfirmPreserve() {
            let confirmContent="是否保存？"
            this.$confirm(confirmContent,"提示",{
                confirmButtonText:"确定",
                cancelButtonText:"取消"
            })
                .then(()=>{
                    this.$message.success({
                        message:"已保存"
                    })
                    this.active = false
                    this.getService()
                })
                .catch(()=>{
                    this.$message.info({
                        message:"取消保存"
                    })
                    this.active = false
                    this.getService()
                    this.resetForm('serviceCreate')
                })
        }

        //json转yaml方法
        // transYaml(content) {
        //   return json2yaml.stringify(content)
        // },
        //yaml转obj方法
        // transObj(content) {
        //   return yaml2obj.load(content)
        // },
    },
    // mounted声明周期的操作，用于在页面加载完成之前获取某些数据
    mounted() {
        this.getNamespace()
        this.getService()
    }
}
</script>

<style scoped>
.service-create-form{
    margin-bottom: 35px;
    width: 450px;
}
</style>