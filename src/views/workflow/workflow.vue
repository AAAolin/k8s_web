<template>
    <div>
        <el-row>
            <el-col :span="24">
                <el-card style="margin-bottom: 5px" shadow="never" :body-style="{padding:'10px'}">
                    <el-row>
                        <el-col :span="10">
                            <a style="font-size: 15px">命名空间</a>
                            <el-select style="margin-left: 10px" v-model="namespaceValue" size="small" filterable @change="getWorkflowList">
                                <el-option v-for="item in this.namespaceList" :key="item.metadata.name" :value="item.metadata.name" :label="item.metadata.name"></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="14" style="text-align: right;padding-right: 10px">
                            <el-button icon="Refresh" type="primary" size="small" @click="getWorkflowList">刷新</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card style="margin-bottom: 5px" :body-style="{padding:'30px 10px 20px 10px'}" shadow="never">
                    <el-steps :active="activeSteps" finish-status="success" align-center>
                        <el-step title="步骤1" description="选择工作流类型, ClusterIP NodePort Workflow"></el-step>
                        <el-step title="步骤2" description="填写Deployment Workflow Workflow表单"></el-step>
                        <el-step title="步骤3" description="创建Service/Ingress暴露应用"></el-step>
                    </el-steps>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card style="margin-bottom: 5px" shadow="never" :body-style="{padding:'10px'}">
                    <el-button type="primary" icon="edit" size="small" @click="this.activeDrawer_1 = true" v-loading.fullscreen.lock="fullscreenLoading">创建工作流</el-button>
                    <el-input style="width: 160px;margin-left: 5px" size="small" v-model="searchValue" placeholder="请输入" clearable></el-input>
                    <el-button style="margin-left: 5px" type="primary" plain icon="Refresh" size="small" @click="getWorkflowList">搜索</el-button>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card shadow="never" :body-style="{padding:'10px'}">
                    <el-table :data="workflowList" v-loading="appLoading">
                        <el-table-column width="40"></el-table-column>
                        <el-table-column label="Workflow名">
                            <template v-slot="scope">
                                <a>{{ scope.row.name }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="类型">
                            <template v-slot="scope">
                                <el-tag type="success">
                                    <a>{{ scope.row.type }}</a>
                                </el-tag>

                            </template>
                        </el-table-column>
                        <el-table-column label="实例数">
                            <template v-slot="scope">
                                <a>{{ scope.row.replicas }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="Deployment">
                            <template v-slot="scope">
                                <a>{{ scope.row.deployment }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="Service">
                            <template v-slot="scope">
                                <a>{{ scope.row.service }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="Ingress">
                            <template v-slot="scope">
                                <a v-if="(scope.row.ingress === '')">无</a>
                                <a v-else-if="(scope.row.type === 'Ingress')">{{ scope.row.ingress }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="创建时间">
                            <template v-slot="scope">
                                <a>{{ timeTrans(scope.row.created_at) }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button type="primary" plain icon="edit" size="small" @click="getWorkflowDetail">详情</el-button>
                                <el-button type="danger" icon="Delete" size="small" @click="handleConfirm(scope,deleteWorkflow)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
<!--                    分页-->
                    <el-col :span="24">
                        <el-pagination
                            style="margin-top:10px;margin-left: 50px"
                            background
                            :current-page="currentPage"
                            :page-size="pagesize"
                            :page-sizes="pagesizeList"
                            :total="workflowTotal"
                            layout="total, sizes, prev, pager, next, jumper"
                            @size-change="handleSizeChange"
                            @current-change="handleCurrentChange">
                        </el-pagination>
                    </el-col>
                </el-card>
            </el-col>

        </el-row>
<!--        抽屉1-->
        <el-drawer v-model="activeDrawer_1" direction="rtl" title="步骤1：选择type">
            <template #default>
                <span style="font-size:18px;margin-right: 10px">类型：</span>
                <el-radio v-model="createWorkflow.Type" label="ClusterIP"></el-radio>
                <el-radio v-model="createWorkflow.Type" label="NodePort"></el-radio>
                <el-radio v-model="createWorkflow.Type" label="Ingress"></el-radio>
            </template>
            <template #footer>
                <el-button @click="handleConfirmPreserve">取消</el-button>
                <el-button type="primary" @click="createWorkflowDeployment">下一步</el-button>
            </template>
        </el-drawer>
<!--        抽屉2-->
        <el-drawer v-model="activeDrawer_2" direction="rtl" title="步骤2：创建Deployment">
            <template #default>
                <el-form :model="createWorkflow" :rules="createWorkflowRules" ref="createWorkflow" :label-postion="labelPostion" label-width="100px">
                    <el-form-item class="workflow-create-form" label="名称" prop="Name">
                        <el-input v-model="createWorkflow.Name" placeholder="请输入名称" maxlength="16" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" label="命名空间" prop="Namespace">
                        <el-select :data="namespaceList" v-model="createWorkflow.Namespace" filterable>
                            <el-option v-for="item in this.namespaceList" :key="item.metadata.name" :value="item.metadata.name" :label="item.metadata.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" label="副本数">
                        <el-input-number v-model="createWorkflow.Replicase" :min="1" :max="30"></el-input-number>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" label="镜像" prop="Image">
                        <el-input v-model="createWorkflow.Image" placeholder="请输入镜像" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" label="标签" prop="Label_str">
                        <el-input v-model="createWorkflow.Label_str" placeholder="示例: project=ms,app=gateway" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" label="资源配额" prop="Resource">
                        <el-select v-model="createWorkflow.Resource" placeholder="请选择">
                            <el-option value="0.5/1" label="0.5C1G"></el-option>
                            <el-option value="1/2" label="1C2G"></el-option>
                            <el-option value="2/4" label="2C4G"></el-option>
                            <el-option value="4/8" label="4C8G"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" label="容器端口" prop="TargetPort">
                        <el-input v-model="createWorkflow.TargetPort" placeholder="请输入容器端口" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" label="健康检查">
                        <el-switch v-model="createWorkflow.HealthCheck"></el-switch>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" label="检查路径">
                        <el-input v-model="createWorkflow.HealthPath" placeholder="请输入检查路径" clearable></el-input>
                    </el-form-item>
                </el-form>
            </template>
            <template #footer>
                <el-button @click="handleConfirmPreserve">取消</el-button>
                <el-button type="primary" @click="createWorkflowService()">下一步</el-button>
            </template>
        </el-drawer>
<!--        抽屉3-->
        <el-drawer v-model="activeDrawer_3" direction="rtl" title="步骤3：创建Service/Ingress">
            <template #default>
                <el-form :model="createWorkflow" :rules="createWorkflowRules" ref="createWorkflow" :label-postion="labelPostion" label-width="100px">
                    <el-form-item class="workflow-create-form" label="ServicePort" prop="Port">
                        <el-input v-model="createWorkflow.Port" placeholder="请输入Service端口" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" v-if="createWorkflow.Type === 'NodePort'" label="NodePort" prop="NodePort">
                        <el-input v-model="createWorkflow.NodePort" placeholder="请在30000-32767内输入对外端口" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" v-if="createWorkflow.Type === 'Ingress'" label="域名" prop="Host">
                        <el-input v-model="createWorkflow.Host" placeholder="请输入域名" clearable ></el-input>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" v-if="createWorkflow.Type === 'Ingress'" label="path" prop="Path">
                        <el-input v-model="createWorkflow.Path" placeholder="请输入path" clearable ></el-input>
                    </el-form-item>
                    <el-form-item class="workflow-create-form" v-if="createWorkflow.Type === 'Ingress'" label="匹配类型" prop="PathType">
                        <el-select v-model="createWorkflow.PathType" placeholder="请选择匹配类型">
                            <el-option value="Prefix" label="Prefix"></el-option>
                            <el-option value="Exact" label="Exact"></el-option>
                            <el-option value="ImplementationSpecific" label="ImplementationSpecific"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </template>
            <template #footer>
                <el-button @click="handleConfirmPreserve">取消</el-button>
                <el-button type="primary" @click="formSubmit('createWorkflow',createWorkflowFinish)">下一步</el-button>
            </template>
        </el-drawer>
    </div>
</template>

<script>
import common from '@/views/common/Config'
import httpClient from "@/request";
export default {
    name: "workflow",
    data() {
        return {
            appLoading: false,
            fullscreenLoading:false,
            namespaceValue:'default',
            namespaceList:[],
            namespaceTotal:0,
            namespaceURL: common.namespaceURL,
            // 控制步骤
            activeSteps:0,
            searchValue:'',
            // 分页
            currentPage: 1,
            pagesize: 10,
            pagesizeList:[1,2,3,5,10,20,30],
            // 获取workflow列表
            workflowList:[],
            workflowTotal:0,
            workflowListData: {
                url:common.workflowURL,
                params: {
                    Name: '',
                    Namespace:'',
                    Page:0,
                    Limit:0,
                }
            },
            // 控制抽屉
            activeDrawer_1: false,
            activeDrawer_2: false,
            activeDrawer_3: false,
            // 创建workflow
            createWorkflow: {
                Name: '',
                Namespace: 'default',
                Replicase: 1,
                Image: '',
                Resource: '',
                Cpu:'',
                Memory:'',
                HealthCheck: false,
                HealthPath: '',
                Label_str: '',
                Labels: {},
                TargetPort: '',
                Type: '',
                Port: '',
                NodePort: '',
                Host: '',
                Path: '',
                PathType: ''
            },
            createWorkflowData: {
                url:common.workflowCreateURL,
                params:{}
            },
            createWorkflowRules:{
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
                Image:[{
                    required: true,
                    message:'请输入镜像',
                    trigger: 'change'
                }],
                // Resource:[{
                //     required: true,
                //     message:'请选择配额',
                //     trigger: 'change'
                // }],
                Label_str:[{
                    required: true,
                    message:'请输入标签',
                    trigger: 'change'
                }],
                TargetPort:[{
                    required: true,
                    message:'请输入容器端口',
                    trigger: 'change'
                }],
                Port:[{
                    required: true,
                    message:'请输入service端口',
                    trigger: 'change'
                }],
                NodePort:[{
                    required: true,
                    message:'请输入暴露端口',
                    trigger: 'change'
                }],
                Host:[{
                    required: true,
                    message:'请输入域名',
                    trigger: 'change'
                }],
                Path:[{
                    required: true,
                    message:'请输入path',
                    trigger: 'change'
                }],
                PathType:[{
                    required: true,
                    message:'请选择匹配类型',
                    trigger: 'change'
                }],
            },
            deleteWorkflowData: {
                url:common.workflowDeleteURL,
                params:{
                    ID:0,
                }
            },
        }
    },
    methods: {
        formSubmit(data,fn){
            this.$refs[data].validate((valid)=>{
                if (valid){
                    fn()
                }else {
                    return false;
                }
            })
        },
        handleSizeChange(value) {
            this.pagesize = value
            this.getWorkflowList()
        },
        handleCurrentChange(value) {
            this.currentPage = value
            this.getWorkflowList()
        },
        // 格林威治时间转为北京时间
        timeTrans(timestamp) {
            let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
            date = date.toJSON()
            date = date.substring(0, 19).replace('T', ' ')
            return date
        },
        getNamespaceList(){
            httpClient.get(this.namespaceURL)
                .then(res => {
                    this.namespaceList = res.data.items
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
        },
        // 获取
        getWorkflowList() {
            this.appLoading = true
            this.workflowListData.params.Name = this.searchValue
            this.workflowListData.params.Namespace = this.namespaceValue
            this.workflowListData.params.Page = this.currentPage
            this.workflowListData.params.Limit = this.pagesize
            httpClient.get(this.workflowListData.url,{params: this.workflowListData.params})
                .then(res => {
                    this.workflowList = res.data.items
                    this.workflowTotal = res.data.total
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
                .finally(() => {
                    this.activeSteps = 0
                    this.appLoading = false
                })
        },
        // 抽屉1 选择类型
        createWorkflowDeployment() {
            if (this.createWorkflow.Type === '') {
                this.$message.warning({
                    message:"请选择类型"
                })
                return
            }
            this.activeDrawer_1 = false
            this.activeDrawer_2 = true
            this.activeSteps = 1
        },
        // 抽屉2
        createWorkflowService() {
            this.activeDrawer_2 = false
            this.activeDrawer_3 = true
            this.activeSteps = 2
        },
        // 抽屉3 创建workflow
        createWorkflowFinish() {
            this.appLoading = true
            // 验证标签格式是否正确
            let reg = new RegExp("(^[A-Za-z]+=[A-Za-z0-9]+).*")
            if (!reg.test(this.createWorkflow.Label_str)) {
                this.$message.warning({
                    message: "标签填写异常，请确认后重新填写"
                })
                return
            }
            this.fullscreenLoading = true
            // 处理标签
            let label = new Map()
            let a = (this.createWorkflow.Label_str).split(",")
            a.forEach(item => {
                let b = item.split("=")
                label[b[0]] = b[1]
            })
            let resourceList = this.createWorkflow.Resource.split("/")
            this.createWorkflow.Cpu = resourceList[0]
            this.createWorkflow.Memory = resourceList[1] + "Gi"
            this.createWorkflowData.params = this.createWorkflow
            this.createWorkflowData.params.Labels = label
            this.createWorkflowData.params.TargetPort = parseInt(this.createWorkflow.TargetPort)
            this.createWorkflowData.params.Port = parseInt(this.createWorkflow.Port)
            this.createWorkflowData.params.NodePort = parseInt(this.createWorkflow.NodePort)
            //处理Hosts及httppath，跟后端处理相同，将数据转成map[host]=httpPaths的格式
            if (this.createWorkflow.Type == 'Ingress') {
                let host = new Map()
                let httpPaths = []
                let httpPath = {
                    Path: this.createWorkflow.Path,
                    PathType: this.createWorkflow.PathType,
                    // 后端通过workflow创建service资源时，service名称加了“-svc”
                    ServiceName: this.createWorkflow.Name + "-svc",
                    ServicePort: parseInt(this.createWorkflow.Port)
                }
                httpPaths.push(httpPath)
                host[this.createWorkflow.Host] = httpPaths
                this.createWorkflowData.params.Host = host
            } else {
                this.createWorkflowData.params.Host = {}
            }
            console.log(this.createWorkflowData.params.Labels)
            // console.log(this.createWorkflowData.params.Host)
            httpClient.post(this.createWorkflowData.url,this.createWorkflowData.params)
                .then(res => {
                    this.$message.success({
                        message: res.msg
                    })
                    this.activeSteps = 3
                    this.resetForm('createWorkflow')
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
                .finally(() => {
                    this.activeDrawer_3 = false
                    this.fullscreenLoading = false
                    this.appLoading = false
                    this.getWorkflowList()
                })
        },
        //重置表单
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },
        // 删除
        deleteWorkflow(scope) {
            this.appLoading = true
            this.deleteWorkflowData.params.ID = scope.row.id
            console.log(this.deleteWorkflowData.params.ID)
            httpClient.delete(this.deleteWorkflowData.url,{data:this.deleteWorkflowData.params})
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
                    this.getWorkflowList()
                    this.appLoading = false
                })
        },
        handleConfirm(scope,fn) {
            let confirmContent="是否删除"+scope.row.name
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
                    this.activeDrawer_1 = false
                    this.activeDrawer_2 = false
                    this.activeDrawer_3 = false
                    this.fullscreenLoading = false
                    this.getWorkflowList()
                })
                .catch(()=>{
                    this.$message.info({
                        message:"取消保存"
                    })
                    this.activeDrawer_1 = false
                    this.activeDrawer_2 = false
                    this.activeDrawer_3 = false
                    this.fullscreenLoading = false
                    this.getWorkflowList()
                    this.resetForm('createWorkflow')
                })
        }
    },
    mounted() {
        this.getNamespaceList()
        this.getWorkflowList()
    }
}
</script>

<style scoped>
.workflow-create-form{
    margin-bottom: 35px;
    width: 450px;
}
</style>