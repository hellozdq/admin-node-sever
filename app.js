const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const logger = require("morgan");
const vertoken = require("./common/token_vertify");
const fs = require("fs");
const accessLog = fs.createWriteStream("./access.log", { flags: "w" });

const loginRouter = require("./routes/login/index");
const usersRouter = require("./routes/user/index");
const databaseRouter = require("./routes/database/index");

const app = express();

app.use(logger("dev")); //打印到控制台
app.use(logger("combined", { stream: accessLog })); //打印到log日志

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type,token");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  //方便返回json
  res.header("Content-Type", "application/json;charset=utf-8");
  if (req.method == "OPTIONS") {
    //让options请求快速返回
    res.sendStatus(200);
  } else {
    next();
  }
});
// 配置session
app.use(
  session({
    secret: "sessions", //设置签名秘钥 内容可以任意填写
    cookie: { maxAge: 60 * 60 * 1000 }, //设置cookie的过期时间，例：80s后    session和相应的cookie失效过期
    resave: true, //强制保存，如果session没有被修改也要重新保存
    saveUninitialized: false, //如果原先没有session那么久设置，否则不设置
  })
);

// 解析token获取用户信息
app.use(function (req, res, next) {
  const whiteList = ["/login", "/login/publicKey"];
  if (!whiteList.includes(req.path)) {
    const token = req.headers["token"];
    if (token == undefined) {
      res.send({ code: -1, msg: "token不能为空" });
      return next();
    } else {
      vertoken
        .verToken(token)
        .then((data) => {
          console.log("data");
          console.log(data);
          req.data = data;
          return next();
        })
        .catch((error) => {
          switch (error.name) {
            case "JsonWebTokenError":
              res.send({ code: -1, msg: "无效token" });
              break;
            case "TokenExpiredError":
              res.send({ code: -1, msg: "token过期" });
              break;
          }
          return next();
        });
    }
  } else {
    return next();
  }
});

// //验证token是否过期并规定哪些路由不用验证
// app.use(expressJwt({
// 	secret: 'mes_qdhd_mobile_xhykjyxgs',
//   algorithms: ['HS256']
// }).unless({
// 	path: ['/login','/login/publicKey]//除了这个地址，其他的URL都需要验证
// }));

app.use("/login", loginRouter);
app.use("/user", usersRouter);
app.use("/database", databaseRouter);

module.exports = app;
