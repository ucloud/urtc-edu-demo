# urtc-demo

## 运行步骤

1. 添加配置

修改 config 目录下 rtcConfig 文件，并配置 AppId 和 AppKey

修改 config 目录下 writeConfig 文件，配置白板参数

> 注：
>
> 1. AppId 和 AppKey 可从 URTC 产品中获取
> 2. AppKey 不可暴露于公网，建议生产环境时，由后端进行保存并由前端调 API 获取
> 3. 白板相关信息点击跳转 [这里](http://herewhite.com/zh-CN/)

2. 安装 npm 依赖包

在本地 demo 目录下，执行以下操作：

```
npm install
```

3. 执行运行命令

```
npm start  or npm start:prod
```

4. 构建

```
npm run build:pre  or npm build:prod
```
