export default {
    loginURL: '/api/login',
    updatePasswordURL: '/api/user/update',
    registerURL: '/api/user/register',
    // namespace
    namespaceURL: '/api/k8s/namespace',
    namespaceDetailURL: '/api/k8s/namespace/detail',
    namespaceDeleteURL: '/api/k8s/namespace/del',
    // deployment
    deploymentURL: '/api/k8s/deployments',
    deploymentDetailURL: '/api/k8s/deployment/detail',
    deploymentUpdateURL: '/api/k8s/deployment/update',
    deploymentCreateURL: '/api/k8s/deployment/create',
    deploymentScaleURL: '/api/k8s/deployment/scale',
    deploymentRestartURL: '/api/k8s/deployment/restart',
    deploymentDeleteDRL: '/api/k8s/deployment/del',
    deploymentNsNumURL: '/api/k8s/deployment/numns',
    // daemonSet
    daemonSetURL: '/api/k8s/daemonSet',
    daemonSetDetailURL: '/api/k8s/daemonSet/detail',
    daemonSetDeleteURL: '/api/k8s/daemonSet/del',
    daemonSetUpdateURL: '/api/k8s/daemonSet/update',
    // pod
    podURL: '/api/k8s/pods',
    podDetailURL: '/api/k8s/pod/detail',
    podUpdateURL: '/api/k8s/pod/update',
    podDeleteURL: '/api/k8s/pod/del',
    podContainerURL: '/api/k8s/pod/container',
    podContainerLogURL: '/api/k8s/pod/log',
    podNsNumURL: '/api/k8s/pod/numns',
    // workflow
    workflowURL: '/api/k8s/workflows',
    workflowDetailURL: '/api/k8s/workflow/detail',
    workflowCreateURL: '/api/k8s/workflow/create',
    workflowDeleteURL: '/api/k8s/workflow/del',
    // service
    serviceURL: '/api/k8s/service',
    serviceDetailURL: '/api/k8s/service/detail',
    serviceCreateURL: '/api/k8s/service/create',
    serviceDeleteURL: '/api/k8s/service/del',
    serviceUpdateURL: '/api/k8s/service/update',
    // ingress
    ingressURL: '/api/k8s/ingress',
    ingressDetailURL: '/api/k8s/ingress/detail',
    ingressCreateURL: '/api/k8s/ingress/create',
    ingressDeleteURL: '/api/k8s/ingress/del',
    ingressUpdateURL: '/api/k8s/ingress/update',
    // node
    nodeURL: '/api/k8s/node',
    nodeDetailURL: '/api/k8s/node/detail',
    // pv
    pvURL: "/api/k8s/pv",
    pvDetailURL: "/api/k8s/pv/detail",
    pvDeleteURL: "/api/k8s/pv/del",

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