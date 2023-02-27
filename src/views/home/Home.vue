<template>
  <div class="home">
      <el-collapse v-model="activeName">
<!--          <el-collapse-item title="集群资源" name="1">-->
<!--&lt;!&ndash;              <el-progress type="circle" stroke-width="6px" :percentage="namespaceActive/namespaceTotal * 100"></el-progress>&ndash;&gt;-->
<!--              <el-progress type="circle" stroke-width="10" :percentage="0.8 * 100"></el-progress>-->
<!--          </el-collapse-item>-->
<!--          <el-collapse-item title="节点资源" name="2">-->
<!--          </el-collapse-item>-->
          <el-collapse-item title="集群资源" name="1">
              <el-row :gutter="10" style="margin-bottom: 10px;">
                  <!-- 命名空间数量 -->
                  <el-col :span="5">
                      <el-card class="home-node-card" :body-style="{padding:'10px'}">
                          <div style="float:left;padding-top:10%">
                              <!-- 进度条 -->
                              <!-- stroke-width 进度条的宽度 -->
                              <!-- show-text 是否显示文字描述 -->
                              <!-- percentage 进度百分比 -->
                              <el-progress :stroke-width="20" :show-text="false" type="circle" :percentage="namespaceActive/namespaceTotal * 100"></el-progress>
                          </div>
                          <div>
                              <p class="home-node-card-title">命名空间: Active/总量</p>
                              <p class="home-node-card-num">{{ namespaceActive }}/{{ namespaceTotal }}</p>
                          </div>
                      </el-card>
                  </el-col>
                  <!-- 服务数量 单个namespace中deployment的数量 -->
                  <el-col :span="5">
                      <el-card class="home-node-card" :body-style="{padding:'10px'}">
                          <div>
                              <p class="home-node-card-title">服务数</p>
                              <p class="home-node-card-num">{{ deploymentTotal }}</p>
                          </div>
                      </el-card>
                  </el-col>
                  <!-- 实例数 单个namespace中pod的数量 -->
                  <el-col :span="5">
                      <el-card class="home-node-card" :body-style="{padding:'10px'}">
                          <div>
                              <p class="home-node-card-title">实例数</p>
                              <p class="home-node-card-num">{{ podTotal }}</p>
                          </div>
                      </el-card>
                  </el-col>
              </el-row>
          </el-collapse-item>
          <!-- 面板2 节点资源卡片 -->
          <el-collapse-item title="节点资源" name="2">
              <el-row :gutter="10" style="margin-bottom: 10px;">
                  <!-- 节点数量 -->
                  <el-col :span="5">
                      <el-card class="home-node-card" :body-style="{padding:'10px'}">
                          <div style="float:left;padding-top:10%">
                              <el-progress :stroke-width="20" :show-text="false" type="circle" :percentage="nodeTotal/nodeTotal * 100"></el-progress>
                          </div>
                          <div>
                              <p class="home-node-card-title">节点: Ready/总数量</p>
                              <p class="home-node-card-num">{{ nodeTotal }}/{{ nodeTotal }}</p>
                          </div>
                      </el-card>
                  </el-col>
                  <!-- CPU资源统计 -->
                  <el-col :span="5">
                      <el-card class="home-node-card" :body-style="{padding:'10px'}">
                          <div style="float:left;padding-top:10%">
                              <el-progress :stroke-width="20" :show-text="false" type="circle" :percentage="nodeCpuAllocatable/nodeCpuCapacity * 100"></el-progress>
                          </div>
                          <div>
                              <p class="home-node-card-title">CPU: 可分配/容量</p>
                              <p class="home-node-card-num">{{ nodeCpuAllocatable }}/{{ nodeCpuCapacity }}</p>
                          </div>
                      </el-card>
                  </el-col>
                  <!-- 内存资源统计 -->
                  <el-col :span="5">
                      <el-card class="home-node-card" :body-style="{padding:'10px'}">
                          <div style="float:left;padding-top:10%">
                              <el-progress :stroke-width="20" :show-text="false" type="circle" :percentage="nodeMemAllocatable/nodeMemCapacity * 100"></el-progress>
                          </div>
                          <div>
                              <p class="home-node-card-title">内存: 可分配/容量</p>
                              <p class="home-node-card-num">{{ specTrans(nodeMemAllocatable) }}Gi/{{ specTrans(nodeMemCapacity) }}Gi</p>
                          </div>
                      </el-card>
                  </el-col>
                  <!-- POD资源统计 -->
                  <el-col :span="5">
                      <el-card class="home-node-card" :body-style="{padding:'10px'}">
                          <div style="float:left;padding-top:10%">
                              <el-progress :stroke-width="20" :show-text="false" type="circle" :percentage="nodePodAllocatable/nodePodAllocatable * 100"></el-progress>
                          </div>
                          <div>
                              <p class="home-node-card-title">POD: 可分配/容量</p>
                              <p class="home-node-card-num">{{ nodePodAllocatable }}/{{ nodePodAllocatable }}</p>
                          </div>
                      </el-card>
                  </el-col>
              </el-row>
          </el-collapse-item>
          <el-collapse-item title="资源统计" name="3">
              <el-row>
                  <el-col :span="24" style="margin-bottom: 10px">
                      <el-card :body-style="{ padding:'10px'}">
                          <div id="podNumDash" style="height: 300px"></div>
                      </el-card>
                  </el-col>
                  <el-col :span="24">
                      <el-card :body-style="{ padding:'10px'}">
                          <div id="deploymentNumDash" style="height: 300px"></div>
                      </el-card>
                  </el-col>
              </el-row>
          </el-collapse-item>
      </el-collapse>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import httpClient from '@/request'
import common from "../common/Config"
export default {
  name: "Home",
    data() {
      return{
          activeName: ['1','2','3'],
          namespaceActive:0,
          namespaceTotal:0,
          deploymentNumNs:[],
          deploymentNumNsUrl: common.deploymentNsNumURL,
          podNumNs:[],
          podNumNsUrl: common.podNsNumURL,
          namespaceListUrl: common.namespaceURL,
          //获取node的属性
          nodeTotal: 0,
          //cpu可分配
          nodeCpuAllocatable: 0,
          //cpu总量
          nodeCpuCapacity: 0,
          //内存可分配
          nodeMemAllocatable: 0,
          //内存总量
          nodeMemCapacity: 0,
          //pod可分配
          nodePodAllocatable: 0,
          //pod总量
          nodePodCapacity: 0,
          getNodesData: {
              url: common.nodeURL,
              params: {}
          },
          //获取deployment的数量
          deploymentTotal: 0,
          getDeploymentsData: {
              url: common.deploymentURL,
              params: {
                  namespace: '',
              }
          },
          //获取pod的数量
          podTotal: 0,
          getPodsData: {
              url: common.podURL,
              params: {
                  namespace: '',
              }
          },
      }
    },
    methods:{
        //获取namespace的数量
        getNamespaces() {
            httpClient.get(this.namespaceListUrl)
                .then(res => {
                    this.namespaceTotal = res.data.total
                    let namespaceList = res.data.items
                    //处理namespace active的数量
                    let index
                    for (index in namespaceList) {
                        if (namespaceList[index].status.phase === "Active" ) {
                            this.namespaceActive = this.namespaceActive + 1
                        }
                    }
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
        },
        //用于内存数据的转换
        specTrans(num) {
            let a = num / 1024 / 1024
            //四舍五入保留小数点0位，也就是去除小数点
            return a.toFixed(0)
        },
        //获取node属性
        getNodes() {
            httpClient.get(this.getNodesData.url, {params: this.getNodesData.params})
                .then(res => {
                    this.nodeTotal = res.data.total
                    let nodeList = res.data.items
                    let index
                    for (index in nodeList) {
                        //正则匹配纯数字，如果不是纯数字则跳过
                        let isnum = /^\d+$/.test(nodeList[index].status.allocatable.cpu);
                        if (!isnum) {
                            continue
                        }
                        //计算node的cpu mem和pod的可分配及总容量数据
                        this.nodeCpuAllocatable = parseInt(nodeList[index].status.allocatable.cpu) + this.nodeCpuAllocatable
                        this.nodeCpuCapacity = parseInt(nodeList[index].status.capacity.cpu) + this.nodeCpuCapacity
                        this.nodeMemAllocatable = parseInt(nodeList[index].status.allocatable.memory) + this.nodeMemAllocatable
                        this.nodeMemCapacity = parseInt(nodeList[index].status.capacity.memory) + this.nodeMemCapacity
                        this.nodePodAllocatable = parseInt(nodeList[index].status.allocatable.pods) + this.nodePodAllocatable
                        this.nodePodCapacity = parseInt(nodeList[index].status.capacity.pods) + this.nodePodCapacity
                    }
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
        },
        //获取命名空间下的deployment总数
        getDeployments() {
            this.getDeploymentsData.params.namespace = this.namespaceValue
            httpClient.get(this.getDeploymentsData.url, {params: this.getDeploymentsData.params})
                .then(res => {
                    this.deploymentTotal = res.data.total
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
        },
        //获取命名空间下的pod总数
        getPods() {
            this.getPodsData.params.namespace = this.namespaceValue
            httpClient.get(this.getPodsData.url, {params: this.getPodsData.params})
                .then(res => {
                    this.podTotal = res.data.total
                })
                .catch(res => {
                    this.$message.error({
                        message: res.msg
                    })
                })
        },
        getDeploymentNsNum() {
            httpClient.get(this.deploymentNumNsUrl)
                .then(res => {
                    this.deploymentNumNs = res.data
                    console.log(this.deploymentNumNs)
                    this.getDeploymentNumDash()
                })
                .catch(res => {
                    this.$message.error({
                        message:res.msg
                    })
                })
        },
        getPodNsNum() {
            httpClient.get(this.podNumNsUrl)
                .then(res => {
                    this.podNumNs = res.data
                    console.log(this.podNumNs)
                    this.getPodNumDash()
                })
                .catch(res => {
                    this.$message.error({
                        message:res.msg
                    })
                })
        },
        getPodNumDash(){
            //若实例已经初始化了，则销毁实例
            if (this.podNumDash != null && this.podNumDash !== "" && this.podNumDash !== undefined) {
                this.podNumDash.dispose()
            }
            //初始化实例，绑定到dom上
            this.podNumDash = echarts.init(document.getElementById('podNumDash'));
            //echarts作图配置
            this.podNumDash.setOption({
                //标题及字体颜色
                title: { text: 'Pods per Namespace', textStyle: {color:'rgb(134, 135, 136)'}},
                //图表颜色
                color: ['#67E0E3'],
                //提示框
                tooltip: {
                    //触发类型,axis是坐标轴触发，none不触发，item图形触发：散点图、饼图等无类目轴的图标中使用
                    trigger: "axis",
                    //cross：十字准星指示器，line：直线指示器， shadow：阴影指示器，none：无指示器，
                    axisPointer: {
                        type: "cross",
                        // x、y轴提示颜色
                        label: {
                            backgroundColor: "#76baf1"
                        }
                    }
                },
                //图表中的数据类型解释（图表中对图形的解释）
                // legend: {
                //     data: ['Pods']
                // },
                //图表数据集
                dataset: {
                    //维度定义，默认第一个元素表示x轴的数据，其他都是y轴数据
                    dimensions: ['namespace','total'],
                    //源数据
                    source: this.podNumNs
                },
                //x轴属性
                xAxis: {
                    //category类目轴，value数值轴，time时间轴，log对数轴
                    type: 'category',
                    //轴标签
                    axisLabel:{
                        //坐标轴刻度标签的显示间隔，在类目轴中有效.0显示所有
                        interval: 0,
                        //格式化轴标签
                        formatter: function (value) {
                            return value.length > 5 ? value.substring(0,10) + '...' : value
                        }
                    },
                },
                //y轴属性
                yAxis: [
                    //数值轴
                    {type: 'value'}
                ],
                //定义系列，用于指定一组数值以及他们映射成的图
                series: [{
                    //name是legend对应的值
                    name: 'Pods',
                    //bar柱状图，line折线图，pie饼图等等
                    type: 'bar',
                    //每个类目的值标签，配置
                    label: {
                        //是否显示值
                        show: true,
                        //显示的位置
                        position: 'top'
                    }
                }
                ]
            });
        },
        getDeploymentNumDash(){
            //若实例已经初始化了，则销毁实例
            if (this.deploymentNumDash != null && this.deploymentNumDash !== "" && this.deploymentNumDash !== undefined) {
                this.deploymentNumDash.dispose()
            }
            //初始化实例，绑定到dom上
            this.deploymentNumDash = echarts.init(document.getElementById('deploymentNumDash'));
            //echarts作图配置
            this.deploymentNumDash.setOption({
                //标题及字体颜色
                title: { text: 'Deployments per Namespace', textStyle: {color:'rgb(134, 135, 136)'}},
                //图表颜色
                color: ['#67E0E3'],
                //提示框
                tooltip: {
                    //触发类型,axis是坐标轴触发，none不触发，item图形触发：散点图、饼图等无类目轴的图标中使用
                    trigger: "axis",
                    //cross：十字准星指示器，line：直线指示器， shadow：阴影指示器，none：无指示器，
                    axisPointer: {
                        type: "cross",
                        // x、y轴提示颜色
                        label: {
                            backgroundColor: "#76baf1"
                        }
                    }
                },
                //图表中的数据类型解释（图表中对图形的解释）
                // legend: {
                //     data: ['Deployments']
                // },
                //图表数据集
                dataset: {
                    //维度定义，默认第一个元素表示x轴的数据，其他都是y轴数据
                    dimensions: ['namespace','total'],
                    //源数据
                    source: this.deploymentNumNs
                },
                //x轴属性
                xAxis: {
                    //category类目轴，value数值轴，time时间轴，log对数轴
                    type: 'category',
                    //轴标签
                    axisLabel:{
                        //坐标轴刻度标签的显示间隔，在类目轴中有效.0显示所有
                        interval: 0,
                        //格式化轴标签
                        formatter: function (value) {
                            return value.length > 5 ? value.substring(0,10) + '...' : value
                        }
                    },
                },
                //y轴属性
                yAxis: [
                    //数值轴
                    {type: 'value'}
                ],
                //定义系列，用于指定一组数值以及他们映射成的图
                series: [{
                    //name是legend对应的值
                    name: 'Deployments',
                    //bar柱状图，line折线图，pie饼图等等
                    type: 'line',
                    //每个类目的值标签，配置
                    label: {
                        //是否显示值
                        show: true,
                        //显示的位置
                        position: 'top'
                    }
                }
                ]
            });
        }
    },
    mounted() {
        this.getDeploymentNsNum()
        this.getPodNsNum()
        this.getNamespaces()
        this.getNodes()
        this.getDeployments()
        this.getPods()
    }
}
</script>

<style scoped>
/* el-collapse内部class */
/deep/ .el-collapse-item__header {
    font-size: 16px;
}
.home-node-card {
    border-radius:1px;
    text-align: center;
    background-color: rgb(250, 253, 255);
}
.home-dash-card {
    border-radius:1px;
}
.home-node-card-title {
    font-size: 12px;
}
.home-node-card-num {
    font-size: 22px;
    font-weight: bold;
    color: rgb(63, 92, 135);
}
/deep/ .el-progress-circle {
    height: 50px !important;
    width: 50px !important;
}
</style>