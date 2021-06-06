const express = require('express');
const router = express.Router();
const connect = require("../../model/index");
const settoken = require('../../common/token_vertify');

//登录
router.post('/', function(req, res) {
	var username = 'slj';
	var userid = "111";
	settoken.setToken(username,userid).then((data)=>{
		return res.json({ token: data });
	})
	return
	console.log(req.session)
	const { account,password } = req.body;
	if(!account){
		res.status(400).json({msg:"账号不能为空"});
		return false;
	}else if(!password){
		res.status(400).json({msg:"密码不能为空"});
		return false;
	}
	
	connect.query(`select * from user where account= ${ account }`, (err, result) => {
		if(result.length==0||result[0].password!==password){
			res.status(400).json({msg:"账号或密码不正确！"});
			return false;
		}else{
			// console.log("req.session")
			// console.log(req)
			// req.session.admin_id = result[0].id;
			res.json({msg:"登录成功！"});
		}
				
	})
})

module.exports = router;