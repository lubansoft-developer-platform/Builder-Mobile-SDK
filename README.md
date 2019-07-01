# Builder-Mobile-SDK

### 目录结构

```
/Builder-Mobile-SDK
|
|----/sdk
|    |
|    |----mobWebSdk.js
|    |
|    \
|
|----/doc
|    |
|    |----index.html
|    |
|    \
|
|----/release
|    |
|    |----config.ini
|    |
|    |----BLLogin.exe
|    |
|    |----*.*
|    |
|    \
|
|----/demo
|    |
|    |----/web
|    |    |
|    |    |----*.*
|    |    |
|    |    \
|    |
|    |----config.ini
|    |
|    |----/pic
|    |    |
|    |    |----*.*
|    |    |
|    |    \
|    |
|    \
|
\
```
#### sdk
    sdk文件夹下存放了mobWebSdk提供的所有js扩展库

- mobWebSdk.js

```ini
MotorDesktopGraphicsEngine主入口文件
```
#### doc
    doc文件夹下存放了mobWebSdk的离线版接口文档

- index.html

```ini
mobWebSdk离线版接口文档入口文件
```

#### release
    relsase文件夹中提供了Android和iOS客户端

- Android.apk

```ini
Android企业包(安卓手机)，版本iWorks1.0.0
```
- iOS.ipa

```ini
iOS企业包(苹果手机)，版本iWorks1.0.0
```

#### demo
    demo文件夹中提供了由鲁班开发者平台(LDP)提供的基于mobWebSdk开发的示例demo

---
### 环境搭建

```javascript
1. 首先需要鲁班通行证账号
2. 在鲁班开发者平台申请appid和secretKey，配置ldn模块参数
3. 在你的project中使用如下语句<script type='text/javascript' src='mobWebSDK.js'></script>将sdk库引入到你的project中
4. 安装release文件夹下手机app
5. 打开手机app登录后从首页进入配置的ldn模块
```

---
### 官方Demo使用

```javascript
1. 将demo文件夹下的所有内容移动到服务器
2. center后台配置ldn模块参数
3. 打开手机app登录后从首页进入配置的ldn模块
```



