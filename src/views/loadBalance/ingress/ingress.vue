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
                            <el-select style="margin-left: 10px" v-model="namespaceValue" size="small" filterable @change="getIngress">
                                <el-option v-for="(itme,index) in namespaceList" :key="index" :value="itme.metadata.name" :label="itme.metadata.name"></el-option>
                            </el-select>
                        </el-col>
                        <el-col style="text-align: right;padding-right: 10px" :span="16">
                            <el-button icon="Refresh" size="small" type="primary" @click="getIngress()">刷新</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" style="margin-top: 5px" shadow="never">
                    <el-button style="margin-right: 5px" size="small" type="primary" icon="edit" @click="active = true">创建</el-button>
<!--                  clearable 可清空输入内容-->
                    <el-input style="margin-right: 5px; width: 160px" size="small" v-model="searchValue" placeholder="请输入" clearable></el-input>
                    <el-button size="small" type="primary" icon="Refresh" plain @click="getIngress()">搜索</el-button>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" style="margin-top: 5px" shadow="never">
                    <el-table :data="ingressList" v-loading="appLoading">
                        <el-table-column width="40"></el-table-column>
                        <el-table-column label="ingress名称" width="220">
                            <template v-slot="scope">
                                <a style="color: blue;font-weight: bold">{{ scope.row.metadata.name }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="host域名" width="220">
                            <template v-slot="scope">
                                <div v-for="(item,index) in scope.row.spec.rules" :key="index">
                                    <el-popover placement="right" trigger="hover" width="200px" :content="item.host">
                                        <template #reference>
                                            <el-tag type="warning" >
                                                <a style="font-size: 13px">{{ ellipsis(item.host) }}</a>
                                            </el-tag>
                                        </template>
                                    </el-popover>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="service名称" width="220">
                            <template v-slot="scope">
                                <div v-for="(item,index) in scope.row.spec.rules" :key="index">
                                    <div v-for="(value,i) in item.http.paths" :key="i">
                                        <a>{{ value.backend.service.name }}</a>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="service端口" width="220">
                            <template v-slot="scope">
                                <div v-for="(item,index) in scope.row.spec.rules" :key="index">
                                    <div v-for="(value,i) in item.http.paths" :key="i">
                                        <el-tag type="success">
                                            <a style="font-size: 13px">{{ value.backend.service.port.number }}</a>
                                        </el-tag>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="路径" width="220">
                            <template v-slot="scope">
                                <div v-for="(item,index) in scope.row.spec.rules" :key="index">
                                    <div v-for="(value,i) in item.http.paths" :key="i">
                                        <a>{{ value.path }}</a>
                                    </div>
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
                                <el-button size="small" icon="Edit" type="primary" plain @click="getIngressDetail(scope)">YAML</el-button>
                                <el-button size="small" icon="Delete" type="danger" plain @click="handleConfirm(scope,deleteIngress)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination style="margin-top:10px;margin-left: 50px" background :current-page="currentPage"
                                   :page-size="pagesize" :page-sizes="pagesizeList" :total="ingressTotal" layout="total,sizes,prev,pager,next,jumper"
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
                <el-button type="primary" @click="ingressUpdate">更新</el-button>
            </template>
        </el-dialog>
        <el-drawer v-model="active" direction="rtl" title="创建service">
            <template #default>
                <el-form :model="ingressCreate" :rules="ingressCreateRules" ref="ingressCreate" :label-postion="labelPostion" label-width="100px">
                    <el-form-item class="ingress-create-form" label="名称" prop="Name">
                        <el-input v-model="ingressCreate.Name" maxlength="32" placeholder="请输入service名称" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="ingress-create-form" label="命名空间" prop="Namespace">
                        <el-select v-model="ingressCreate.Namespace" filterable>
                            <el-option v-for="item in namespaceList" :key="item.metadata.name" :label="item.metadata.name" :value="item.metadata.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item class="ingress-create-form" label="标签" prop="Label_str">
                        <el-input v-model="ingressCreate.Label_str" placeholder="示例: project=ms,app=gateway" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="ingress-create-form" label="域名" prop="Host">
                        <el-input v-model="ingressCreate.Host" placeholder="请输入域名" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="ingress-create-form" label="Path" prop="Path">
                        <el-input v-model="ingressCreate.Path" placeholder="请输入地址" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="ingress-create-form" label="Path类型" prop="PathType">
                        <el-select v-model="ingressCreate.PathType" placeholder="请选择匹配类型">
                            <el-option value="Prefix" label="Prefix"></el-option>
                            <el-option value="Exact" label="Exact"></el-option>
                            <el-option value="ImplementationSpecific" label="ImplementationSpecific"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item class="ingress-create-form" label="Service名称" prop="ServiceName">
                        <el-input v-model="ingressCreate.ServiceName" placeholder="请输入Service名称" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="ingress-create-form" label="Service端口" prop="Port">
                        <el-input v-model="ingressCreate.Port" placeholder="请输入Service端口" clearable></el-input>
                    </el-form-item>
                </el-form>
            </template>
            <template #footer>
                <el-button @click="handleConfirmPreserve">取消</el-button>
                <el-button type="primary" @click="formSubmit('ingressCreate',createIngress)">下一步</el-button>
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
    name: "ingress",
    data () {
        return{
            active: false,
            appLoading:false,
            // 命名空间
            namespaceValue:"default",
            namespaceList:[],
            searchValue:"",
            // ingress
            ingressList:[],
            ingressTotal: 0,
            ingressListData:{
                url:common.ingressURL,
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
            ingressDetail:'',
            ingressDetailData:{
                url:common.ingressDetailURL,
                params:{
                    IngressName:'',
                    Namespace:''
                }
            },
            ingressUpdateData:{
                url:common.ingressUpdateURL,
                params:{
                    Content:'',
                    Namespace:''
                }
            },
            cmOptions: common.cmOptions,
            contentYaml:'',
            ingressDeleteData:{
                url: common.ingressDeleteURL,
                params:{
                    IngressName:'',
                    Namespace:''
                }
            },
            // 创建service
            ingressCreate:{
                Name: '',
                Namespace: 'default',
                Label_str: '',
                Labels: {},
                Host:'',
                Path:'',
                PathType:'',
                ServiceName:'',
                Port: '',
            },
            ingressCreateData:{
                url: common.ingressCreateURL,
                params: {}
            },
            ingressCreateRules:{
                Name:[{
                    required: true,
                    message:'请输入名称',
                    trigger: 'change'
                }],
                Namespace:[{
                    required: true,
                    message:'请选择命名空间',
                    trigger: 'change'
                }],
                Label_str:[{
                    required: true,
                    message:'请输入标签',
                    trigger: 'change'
                }],
                Host:[{
                    required: true,
                    message:'请输入域名',
                    trigger: 'change'
                }],
                Path:[{
                    required: true,
                    message:'请输入路径',
                    trigger: 'change'
                }],
                PathType:[{
                    required: true,
                    message:'请选择路径类型',
                    trigger: 'change'
                }],
                ServiceName:[{
                    required: true,
                    message:'请输入Service名称',
                    trigger: 'change'
                }],
                Port:[{
                    required: true,
                    message:'请输入Service端口',
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
        getIngress() {
            this.appLoading = true
            // 赋值
            this.ingressListData.params.FilterName = this.searchValue
            this.ingressListData.params.Namespace = this.namespaceValue
            this.ingressListData.params.Limit = this.pagesize
            this.ingressListData.params.Page = this.currentPage
            // 发起请求
            httpClient.get(this.ingressListData.url,{params: this.ingressListData.params})
                .then( res => {
                    this.ingressList = res.data.items
                    this.ingressTotal = res.data.total
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
        getIngressDetail(scope) {
            this.ingressDetailData.params.IngressName = scope.row.metadata.name
            this.ingressDetailData.params.Namespace = this.namespaceValue
            httpClient.get(this.ingressDetailData.url,{params:this.ingressDetailData.params})
                .then( res => {
                    this.ingressDetail = res.data
                    // json转换成yaml
                    this.contentYaml = this.transYaml(this.ingressDetail)
                    this.dialogOption = true
                })
                .catch( res => {
                    this.$message.error({
                        message:res.msg
                    })
                })

        },
        ingressUpdate(){
            this.appLoading = true
            // yaml转换成json
            let content = JSON.stringify(this.transObj(this.contentYaml))
            this.ingressUpdateData.params.Content = content
            this.ingressUpdateData.params.Namespace = this.namespaceValue
            httpClient.put(this.ingressUpdateData.url,this.ingressUpdateData.params)
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
                    this.getIngress()
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
            this.getIngress()
        },
        // 页面大小发生变化时触发，赋值并重新获取列表
        sizeChange(limit) {
            this.pagesize = limit
            this.getIngress()
        },
        deleteIngress(scope){
            this.appLoading = true
            this.ingressDeleteData.params.IngressName = scope.row.metadata.name
            this.ingressDeleteData.params.Namespace = this.namespaceValue

            httpClient.delete(this.ingressDeleteData.url,{data:this.ingressDeleteData.params})
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
                    this.getIngress()
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
        createIngress() {
            this.appLoading = true

            // 验证标签格式是否正确
            let reg = new RegExp("(^[A-Za-z]+=[A-Za-z0-9]+).*")
            if (!reg.test(this.ingressCreate.Label_str)) {
                this.$message.warning({
                    message: "标签填写异常，请确认后重新填写"
                })
                return
            }
            
            let label = new Map()
            let a = (this.ingressCreate.Label_str).split(",")
            a.forEach(item => {
                let b = item.split("=")
                label[b[0]] = b[1]
            })

            let host = new Map()
            let httpPaths = []
            let httpPath = {
                Path: this.ingressCreate.Path,
                PathType: this.ingressCreate.PathType,
                ServiceName: this.ingressCreate.ServiceName,
                ServicePort: parseInt(this.ingressCreate.Port)
            }
            httpPaths.push(httpPath)
            host[this.ingressCreate.Host] = httpPaths

            this.ingressCreateData.params = this.ingressCreate

            this.ingressCreateData.params.Host = host
            this.ingressCreateData.params.Labels = label
            //this.ingressCreateData.params.Port = parseInt(this.ingressCreate.Port)
            
            httpClient.post(this.ingressCreateData.url,this.ingressCreateData.params)
                .then(res => {
                    this.$message.success({
                        message: res.msg
                    })
                    this.resetForm('ingressCreate')
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
                .finally(() => {
                    this.active = false
                    this.appLoading = false
                    this.getIngress()
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
                    this.getIngress()
                })
                .catch(()=>{
                    this.$message.info({
                        message:"取消保存"
                    })
                    this.active = false
                    this.getIngress()
                    this.resetForm('ingressCreate')
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
        this.getIngress()
    }
}
</script>

<style scoped>
.ingress-create-form{
    margin-bottom: 35px;
    width: 450px;
}
</style>