## node + express 后端服务

### 拉取使用
1. git clone https://github.com/hellozdq/admin-node-sever.git 拉取项目
2. npm i 安装依赖
3. npm start 运行

### 结构
+ bin 运行文件
+ common 公共文件
  - rsaKey rsa使用方法（rsa加解密）
  - token_vertify token使用方法
+ model 连接mysql 文件
  - config 配置
  - index 公共调用方法 
+ routes 路由
  - login 登陆的路由
  - user 用户路由
+ app.js 主要配置文件
+ package-lock
+ package
+ README 
