var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var logger = require('morgan');
var vertoken = require('./common/token_vertify');

var loginRouter = require('./routes/login/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 配置session
app.use(session({
  secret:"sessions", //设置签名秘钥 内容可以任意填写
  cookie:{ maxAge:60*60*1000 }, //设置cookie的过期时间，例：80s后    session和相应的cookie失效过期
  resave:true, //强制保存，如果session没有被修改也要重新保存
  saveUninitialized:false //如果原先没有session那么久设置，否则不设置
}))


// 解析token获取用户信息
app.use(function(req, res, next) {
  const whiteList = ['/login','/login/publicKey'];
  if(!whiteList.includes(req.path)){
    const token = req.headers['authorization'];
    if(token == undefined){
      res.send({ code: -1, msg: '无效的token' });
      return next();
    }else{
      vertoken.verToken(token).then((data)=> {
        req.data = data;
        return next();
      }).catch((error)=>{
        switch (error.name) {
          case 'JsonWebTokenError':
            res.send({ code: -1, msg: '无效的token' });
            break;
          case 'TokenExpiredError':
            res.send({ code: -1, msg: 'token过期' });
            break;
        }
        return next();
      })
    }
  }else{
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


app.use('/login', loginRouter);
app.use('/users', usersRouter);


module.exports = app;
