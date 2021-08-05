# 可提示 less 变量的 VS code 插件

## quick start

1. 打开设置点击右上角**打开设置(json)**添加如下配置项

```json
{
  "lessVars.locations": [
    /* 支持less文件及commonjs导出的变量对象 */
    /* 文件的绝对路径 如："D:/code/color.less" */
    /* 文件相对工作区文件夹的路径时使用${folder},其等价于D:/code 如："${folder}/color.less" */
    /* 格式为string[] 只有一条路径时可以配置为字符串 */
    /* 越靠前优先级越高 */
  ]
}
```

2. 也可以在 less 文件中右键选择**设置 less 变量文件路径**

![avatar](/images/start1.png)

![avatar](/images/start2.png)

## 功能

_示例常量文件如下_

![avatar](/images/list1.png)

1. 在颜色后输入=提示所对应的变量值

![avatar](/images/list2.png)

2. 输入@后出现所有变量

![avatar](/images/list3.png)

3. 鼠标悬浮在变量上时出现提示

![avatar](/images/list4.png)
