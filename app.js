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
  const whitePath = ['/login'];
  const isExist = whitePath.includes(req.url);
  if(isExist){
    return next();
  }
	const token = req.headers['authorization'];
	if(token == undefined){
    res.status(401).send({ code: -1, msg: 'token不能为空' });
		return next();
	}else{
		vertoken.verToken(token).then((data)=> {
			req.data = data;
			return next();
		}).catch((error)=>{
      switch (error.name) {
        case 'JsonWebTokenError':
          res.status(401).send({ code: -1, msg: '无效的token' });
          break;
        case 'TokenExpiredError':
          res.status(401).send({ code: -1, msg: '登录失效，请重新登录！' });
          break;
      }
			return next();
		})
	}
});


app.use('/login', loginRouter);
app.use('/users', usersRouter);


module.exports = app;
