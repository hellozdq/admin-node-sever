var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var logger = require('morgan');
var vertoken = require('./common/token_vertify');
var expressJwt = require('express-jwt');

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
	var token = req.headers['authorization'];
	if(token == undefined){
    console.log("============>>111111")
    res.status(403).send({ code: -1, msg: '无效的token' });
		return next();
	}else{
		vertoken.verToken(token).then((data)=> {
			req.data = data;
			return next();
		}).catch((error)=>{
      console.log("error")
      console.log(error)
      switch (error.name) {
        case 'JsonWebTokenError':
          res.status(403).send({ code: -1, msg: '无效的token' });
          break;
        case 'TokenExpiredError':
          res.status(403).send({ code: -1, msg: 'token过期' });
          break;
      }
			return next();
		})
	}
});

// 登陆判断
// app.use(function(err, req, res, next) {
//   if(!req.session['admin_id'] && req.url!='/login'&& req.url!='/register'&& arr!='/captcha'&& arr!='/logout'&&arr!='/upload/img'){ //没有登录
//     res.status(401).json("登录失效")
//     // res.status(401).redirect('/login');
//   }else{
//     next();
//   }

//   // render the error page
//   // res.status(err.status || 500).json("请求失败");
//   // res.render('error');
// });

//验证token是否过期并规定哪些路由不用验证
app.use(expressJwt({
	secret: 'mes_qdhd_mobile_xhykjyxgs',
  algorithms: ['HS256']
}).unless({
	path: ['/login']//除了这个地址，其他的URL都需要验证
}));


app.use('/login', loginRouter);
app.use('/users', usersRouter);
// 404
app.use(function(req, res, next) {
  console.log("----------------1<<,")
  next(createError(404));
});

// app.use(function(req, res, next) {
//   console.log("》》》》》》》》》》》》》》》")
//   console.log("error.status")
//   console.log(error.status)
//   if (err.name === 'UnauthorizedError') { 
//     res.status(401).send({code:-1,msg:'token错误'});
// }
//   if (err.status == 401) {
// 		return res.status(401).send('token失效');
// 	}
//   // next(createError(404));
// });


module.exports = app;
