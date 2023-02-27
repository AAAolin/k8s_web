const baseUrl = 'http://localhost:9091'

export default {
    loginURL: baseUrl + '/api/login',
    updatePasswordURL: baseUrl + '/api/user/update',
    registerURL: baseUrl + '/api/user/register',
    // namespace
    namespaceURL: baseUrl + '/api/k8s/namespace',
    namespaceDetailURL: baseUrl + '/api/k8s/namespace/detail',
    namespaceDeleteURL: baseUrl + '/api/k8s/namespace/del',
    // deployment
    deploymentURL: baseUrl + '/api/k8s/deployments',
    deploymentDetailURL:baseUrl + '/api/k8s/deployment/detail',
    deploymentUpdateURL:baseUrl + '/api/k8s/deployment/update',
    deploymentCreateURL: baseUrl + '/api/k8s/deployment/create',
    deploymentScaleURL: baseUrl + '/api/k8s/deployment/scale',
    deploymentRestartURL: baseUrl + '/api/k8s/deployment/restart',
    deploymentDeleteDRL: baseUrl + '/api/k8s/deployment/del',
    deploymentNsNumURL: baseUrl + '/api/k8s/deployment/numns',
    // daemonSet
    daemonSetURL: baseUrl + '/api/k8s/daemonSet',
    daemonSetDetailURL: baseUrl + '/api/k8s/daemonSet/detail',
    daemonSetDeleteURL: baseUrl + '/api/k8s/daemonSet/del',
    daemonSetUpdateURL: baseUrl + '/api/k8s/daemonSet/update',
    // pod
    podURL: baseUrl + '/api/k8s/pods',
    podDetailURL: baseUrl + '/api/k8s/pod/detail',
    podUpdateURL: baseUrl + '/api/k8s/pod/update',
    podDeleteURL: baseUrl + '/api/k8s/pod/del',
    podContainerURL: baseUrl + '/api/k8s/pod/container',
    podContainerLogURL: baseUrl + '/api/k8s/pod/log',
    podNsNumURL: baseUrl + '/api/k8s/pod/numns',
    // workflow
    workflowURL: baseUrl + '/api/k8s/workflows',
    workflowDetailURL: baseUrl + '/api/k8s/workflow/detail',
    workflowCreateURL: baseUrl + '/api/k8s/workflow/create',
    workflowDeleteURL: baseUrl + '/api/k8s/workflow/del',
    // service
    serviceURL: baseUrl + '/api/k8s/service',
    serviceDetailURL: baseUrl + '/api/k8s/service/detail',
    serviceCreateURL: baseUrl + '/api/k8s/service/create',
    serviceDeleteURL: baseUrl + '/api/k8s/service/del',
    serviceUpdateURL: baseUrl + '/api/k8s/service/update',
    // ingress
    ingressURL: baseUrl + '/api/k8s/ingress',
    ingressDetailURL: baseUrl + '/api/k8s/ingress/detail',
    ingressCreateURL: baseUrl + '/api/k8s/ingress/create',
    ingressDeleteURL: baseUrl + '/api/k8s/ingress/del',
    ingressUpdateURL: baseUrl + '/api/k8s/ingress/update',
    // node
    nodeURL: baseUrl + '/api/k8s/node',
    nodeDetailURL: baseUrl + '/api/k8s/node/detail',

        //编辑器配置
    cmOptions: {
        // 语言及语法模式
        mode: 'text/yaml',
        // 主题
        theme: 'idea',
        // 显示行数
        lineNumbers: true,
        smartIndent: true, //智能缩进
        indentUnit: 4, // 智能缩进单元长度为 4 个空格
        styleActiveLine: true, // 显示选中行的样式
        matchBrackets: true, //每当光标位于匹配的方括号旁边时，都会使其高亮显示
        readOnly: false,
        lineWrapping: true //自动换行
    }
}