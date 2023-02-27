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
                            <el-select style="margin-left: 10px" v-model="namespaceValue" size="small" filterable @change="getDeployment">
                                <el-option v-for="(item,index) in namespaceList" :key="index" :value="item.metadata.name" :label="item.metadata.name"></el-option>
                            </el-select>
                        </el-col>
                        <el-col style="text-align: right;padding-right: 10px" :span="16">
                            <el-button icon="Refresh" size="small" type="primary" @click="getDeployment()">刷新</el-button>
                        </el-col>
                    </el-row>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" style="margin-top: 5px" shadow="never">
                    <el-button style="margin-right: 5px" size="small" type="primary" icon="edit" @click="active = true">创建</el-button>
<!--                  clearable 可清空输入内容-->
                    <el-input style="margin-right: 5px; width: 160px" size="small" v-model="searchValue" placeholder="请输入" clearable></el-input>
                    <el-button size="small" type="primary" icon="Refresh" plain @click="getDeployment()">搜索</el-button>
                </el-card>
            </el-col>
            <el-col :span="24">
                <el-card :body-style="{padding:'10px'}" style="margin-top: 5px" shadow="never">
                    <el-table :data="deploymentList" v-loading="appLoading">
                        <el-table-column width="40"></el-table-column>
                        <el-table-column label="deployment" prop="metadata.name" width="240">
                            <template v-slot="scope">
                                <a style="color: blue;font-weight: bold">{{ scope.row.metadata.name }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="标签" prop="metadata.labels" width="240">
                            <template v-slot="scope">
                                <div v-for="(value,key) in scope.row.metadata.labels" :key="key">
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
                        <el-table-column label="容器组" width="240">
                            <template v-slot="scope">
                                <a> {{ scope.row.status.availableReplicas >0 ?scope.row.status.availableReplicas:0 }} / {{ scope.row.spec.replicas}} </a>
                            </template>
                        </el-table-column>
                        <el-table-column label="容器镜像" width="240">
                            <template v-slot="scope">
                                <div v-for="(value,key) in scope.row.spec.template.spec.containers" :key="key">
                                   <el-popover placement="right" trigger="hover" width="200px" :content="value.image">
                                      <template #reference>
                                          <el-tag style="margin-bottom:5px;">
<!--                                              当image组成格式是 仓库地址/仓库名/镜像：版本时，只需要取 镜像：版本-->
<!--                                              {{ ellipsis(val.image.split('/')[2]==undefined?val.image:val.image.split('/') [2]) }}-->
                                              <a style="font-size: 13px">{{ ellipsis(value.image) }}</a>
                                          </el-tag>
                                      </template>
                                   </el-popover>
                              </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="创建时间" width="240">
                            <template v-slot="scope">
                                <a>{{ timeTrans(scope.row.metadata.creationTimestamp) }}</a>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button size="small" icon="Edit" type="primary" plain @click="getDeploymentDetail(scope)">YAML</el-button>
                                <el-button size="small" icon="Edit" type="primary" @click="handleScale(scope)">扩缩</el-button>
                                <el-button size="small" icon="RefreshRight" type="warning" plain @click="handleConfirm(scope,'重启',restartDeployment)">重启</el-button>
                                <el-button size="small" icon="Delete" type="danger" plain @click="handleConfirm(scope,'删除',deleteDeployment)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination style="margin-top:10px;margin-left: 50px" background :current-page="currentPage"
                                   :page-size="pagesize" :page-sizes="pagesizeList" :total="deploymentTotal" layout="total,sizes,prev,pager,next,jumper"
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
                <el-button type="primary" @click="deploymentUpdate">更新</el-button>
            </template>
        </el-dialog>
        <el-dialog title="调整副本数" v-model="scaleDialog" width="15%">
          <el-form>
            <el-form-item style="font-size: 20px;margin-left: 25px" label="副本">
              <el-input-number v-model="replicas" :min="0" :max="30"></el-input-number>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="scaleDialog = false">取消</el-button>
            <el-button type="primary" @click="scaleDeployment()">更新</el-button>
          </template>
        </el-dialog>
        <el-drawer v-model="active" direction="rtl" title="创建Deployment">
            <template #default>
                <el-form :model="deploymentCreate" :rules="deploymentCreateRules" ref="deploymentCreate" :label-postion="labelPostion" label-width="100px">
                    <el-form-item class="deployment-create-form" label="名称" prop="Name">
                        <el-input v-model="deploymentCreate.Name" maxlength="32" placeholder="请输入deployment名称" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="deployment-create-form" label="命名空间" prop="Namespace">
                        <el-select v-model="deploymentCreate.Namespace" filterable>
                            <el-option v-for="item in namespaceList" :key="item.metadata.name" :label="item.metadata.name" :value="item.metadata.name"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item class="deployment-create-form" label="标签" prop="Label_str">
                        <el-input v-model="deploymentCreate.Label_str" placeholder="示例: project=ms,app=gateway" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="deployment-create-form" label="副本数">
                        <el-input-number v-model="deploymentCreate.Replicase" :max="30" :min="1"></el-input-number>
                    </el-form-item>
                    <el-form-item class="deployment-create-form" label="镜像" prop="Image">
                        <el-input v-model="deploymentCreate.Image" placeholder="请输入镜像名称" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="deployment-create-form" label="端口" prop="Port">
                        <el-input v-model="deploymentCreate.Port" placeholder="请输入容器端口" clearable></el-input>
                    </el-form-item>
                    <el-form-item class="deployment-create-form" label="资源配额" prop="Resource">
                        <el-select v-model="deploymentCreate.Resource" placeholder="请选择">
                            <el-option value="0.5/1" label="0.5C1G"></el-option>
                            <el-option value="1/2" label="1C2G"></el-option>
                            <el-option value="2/4" label="2C4G"></el-option>
                            <el-option value="4/8" label="4C8G"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item class="deployment-create-form" label="健康检查">
                        <el-switch v-model="deploymentCreate.HealthCheck"></el-switch>
                    </el-form-item>
                    <el-form-item class="deployment-create-form" label="检查路径">
                        <el-input v-model="deploymentCreate.HealthPath" placeholder="请输入检查路径" clearable></el-input>
                    </el-form-item>
                </el-form>
            </template>
            <template #footer>
                <el-button @click="handleConfirmPreserve">取消</el-button>
                <el-button type="primary" @click="formSubmit('deploymentCreate',createDeployment)">下一步</el-button>
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
    name: "Deployment",
    data () {
        return{
            appLoading:false,
            // 命名空间
            namespaceValue:"default",
            namespaceList:[],
            searchValue:"",
            // deployment
            deploymentList:[],
            deploymentTotal: 0,
            deploymentListData:{
                url:common.deploymentURL,
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
            deploymentDetail:'',
            deploymentDetailData:{
                url:common.deploymentDetailURL,
                params:{
                    DeploymentName:'',
                    Namespace:''
                }
            },
            deploymentUpdateData:{
                url:common.deploymentUpdateURL,
                params:{
                    Namespace:'',
                    Content:''
                }
            },
            cmOptions: common.cmOptions,
            contentYaml:'',
          // 副本数
          scaleDialog: false,
          replicas:0,
          deploymentReplicasData:{
              url:common.deploymentScaleURL,
              params:{
                DeploymentName:'',
                Namespace:'',
                Num: 0
              }
          },
            deploymentRestartData:{
                url:common.deploymentRestartURL,
                params:{
                    DeploymentName:'',
                    Namespace:''
                }
            },
            deploymentDeleteData:{
                url: common.deploymentDeleteDRL,
                params:{
                    DeploymentName:'',
                    Namespace:''
                }
            },
            // 创建deployment
            active: false,
            deploymentCreate:{
                Name: '',
                Namespace: 'default',
                Label_str: '',
                Labels: {},
                Replicase: '',
                Image: '',
                Port: '',
                HealthCheck: false,
                HealthPath: '',
                Resource: '',
                Cpu: '',
                Memory: '',
            },
            deploymentCreateData:{
                url: common.deploymentCreateURL,
                params: {}
            },
            deploymentCreateRules:{
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
                Port:[{
                    required: true,
                    message:'请输入service端口',
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
        getDeployment() {
            this.appLoading = true
          // 赋值
            this.deploymentListData.params.FilterName = this.searchValue
            this.deploymentListData.params.Namespace = this.namespaceValue
            this.deploymentListData.params.Limit = this.pagesize
            this.deploymentListData.params.Page = this.currentPage
          // 发起请求
            httpClient.get(this.deploymentListData.url,{params: this.deploymentListData.params})
                .then( res => {
                    this.deploymentList = res.data.items
                    this.deploymentTotal = res.data.total
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
        getDeploymentDetail(scope) {
            this.deploymentDetailData.params.DeploymentName = scope.row.metadata.name
            this.deploymentDetailData.params.Namespace = this.namespaceValue
            httpClient.get(this.deploymentDetailData.url,{params:this.deploymentDetailData.params})
                .then( res => {
                    this.deploymentDetail = res.data
                  // json转换成yaml
                    this.contentYaml = this.transYaml(this.deploymentDetail)
                    this.dialogOption = true
                })
                .catch( res => {
                  this.$message.error({
                    message:res.msg
                  })
                })

        },
        deploymentUpdate(){
            this.appLoading = true
          // yaml转换成json
            let content = JSON.stringify(this.transObj(this.contentYaml))
            this.deploymentUpdateData.params.Namespace = this.namespaceValue
            this.deploymentUpdateData.params.Content = content
            httpClient.put(this.deploymentUpdateData.url,this.deploymentUpdateData.params)
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
                    this.getDeployment()
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
            this.getDeployment()
        },
      // 页面大小发生变化时触发，赋值并重新获取列表
        sizeChange(limit) {
            this.pagesize = limit
            this.getDeployment()
        },
        handleScale(scope){
          this.deploymentDetail = scope.row
          this.replicas = this.deploymentDetail.spec.replicas
          this.scaleDialog = true
        },
        scaleDeployment(){
          this.appLoading = true
          this.deploymentReplicasData.params.DeploymentName = this.deploymentDetail.metadata.name
          this.deploymentReplicasData.params.Namespace = this.namespaceValue
          this.deploymentReplicasData.params.Num = this.replicas
          console.log(this.deploymentReplicasData)

          httpClient.put(this.deploymentReplicasData.url,this.deploymentReplicasData.params)
              .then( res => {
                this.$message.success({
                  message:res.msg
                })
              })
              .catch(res=> {
                this.$message.error({
                  message:res.msg
                })
              })
              .finally(()=>{
                this.getDeployment()
                this.appLoading = false
                this.scaleDialog = false
              })
        },
        restartDeployment(scope){
          this.appLoading = true
          this.deploymentRestartData.params.DeploymentName = scope.row.metadata.name
          this.deploymentRestartData.params.Namespace = this.namespaceValue

          httpClient.put(this.deploymentRestartData.url,this.deploymentRestartData.params)
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
                  this.getDeployment()
                  this.appLoading = false
              })
      },
        deleteDeployment(scope){
            this.appLoading = true
            this.deploymentDeleteData.params.DeploymentName = scope.row.metadata.name
            this.deploymentDeleteData.params.Namespace = this.namespaceValue

            httpClient.delete(this.deploymentDeleteData.url,{data:this.deploymentDeleteData.params})
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
                    this.getDeployment()
                    this.appLoading = false
                })
        },
        createDeployment() {
            this.appLoading = true

            // 验证标签格式是否正确
            let reg = new RegExp("(^[A-Za-z]+=[A-Za-z0-9]+).*")
            if (!reg.test(this.deploymentCreate.Label_str)) {
                this.$message.warning({
                    message: "标签填写异常，请确认后重新填写"
                })
                return
            }
            let resourceList = (this.deploymentCreate.Resource).split("/")
            let label = new Map()
            let a = (this.deploymentCreate.Label_str).split(",")
            a.forEach(item => {
                let b = item.split("=")
                label[b[0]] = b[1]
            })
            this.deploymentCreate.Cpu = resourceList[0]
            this.deploymentCreate.Memory = resourceList[1]+"Gi"
            this.deploymentCreate.Labels = label
            this.deploymentCreateData.params = this.deploymentCreate
            this.deploymentCreateData.params.Port = parseInt(this.deploymentCreate.Port)

            console.log(this.deploymentCreateData.params)
            httpClient.post(this.deploymentCreateData.url,this.deploymentCreateData.params)
                .then(res => {
                    this.$message.success({
                        message: res.msg
                    })
                    this.resetForm('deploymentCreate')
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
                .finally(() => {
                    this.active = false
                    this.appLoading = false
                    this.getDeployment()
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
        handleConfirm(scope,str,fn) {
            this.deploymentDetail = scope.row
            let confirmContent="是否"+str+this.deploymentDetail.metadata.name
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
                    this.getDeployment()
                })
                .catch(()=>{
                    this.$message.info({
                        message:"取消保存"
                    })
                    this.active = false
                    this.getDeployment()
                    this.resetForm('deploymentCreate')
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
        this.getDeployment()
    }
}
</script>

<style scoped>
.deployment-create-form{
    margin-bottom: 35px;
    width: 450px;
}
</style>