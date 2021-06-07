const express = require('express');
const router = express.Router();
const connect = require("../../model/index");
const settoken = require('../../common/token_vertify');

//登录
router.post('/', function(req, res) {
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
			const account = account;
			const userid = result.id;
			settoken.setToken(account,userid).then((data)=>{
				return res.json({ token: data, msg:"登录成功！" });
			})
		}
				
	})
})

module.exports = router;