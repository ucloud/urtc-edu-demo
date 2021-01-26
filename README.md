<!--
 * @Author: your name
 * @Date: 2021-01-25 17:13:02
 * @LastEditTime: 2021-01-25 17:14:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /urtc-edu-demo/README.md
-->
# urtc-demo

本 demo 运行网址：https://weilai.urtc.com.cn/

## 运行步骤

1. 添加配置

修改 config 目录下 rtcConfig 文件，并配置 AppId 和 AppKey；

修改 config 目录下 writeConfig 文件，配置白板参数

> 注：
>
> 1. AppId 和 AppKey 可从 URTC 产品中获取，可以参考 https://docs.ucloud.cn/urtc/quick 。
> 2. AppKey 不可暴露于公网，建议生产环境时，由后端进行保存并由前端调 API 获取
> 3. 白板相关信息点击跳转 [这里](http://herewhite.com/zh-CN/)
> 4. 由于浏览器的安全策略对除 127.0.0.1 以外的 HTTP 地址作了限制，Web SDK 仅支持 HTTPS 协议 或者 http://localhost（http://127.0.0.1）, 请勿使用 HTTP 协议 部署你的项目。

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
