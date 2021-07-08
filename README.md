# 可提示 less 变量的 VS code 插件

## quick start

1. 打开设置点击右上角**打开设置(json)**添加如下配置项

```json
{
  "lessVars.locations": [
    /* less常量文件的绝对路径 如："D:/code/color.less" */
    /* 格式为string[] 一条路径是可以配置为字符串 */
  ]
}
```

2. 打开 less 文件使用插件

## 功能

_示例常量文件如下_

![avatar](/images/list1.png)

1. 在颜色后输入=提示所对应的变量值

![avatar](/images/list2.png)

2. 输入@后出现所有变量

![avatar](/images/list3.png)

3. 鼠标悬浮在变量上时出现提示

![avatar](/images/list4.png)
