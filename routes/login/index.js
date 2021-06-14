const express = require('express');
const router = express.Router();
const reqSql = require("../../model/index");
const settoken = require('../../common/token_vertify');
const rsaKey = require('../../common/rsaKey');

//登录
router.post('/', (req, res) => {
	const { account,password } = req.body;
	if(!account){
		res.json({code:1,msg:"账号不能为空"});
		return false;
	}else if(!password){
		res.json({code:1,msg:"密码不能为空"});
		return false;
	}
	const pass = rsaKey.decryption(password);
	const obj = {
		sql:`select * from account where account= ${ account }`,
		res
	}
	reqSql(obj)
	.then((result) => {
		if(result.length == 0 || result[0].password !== pass){
			res.json({code:1, msg:"账号或密码不正确！"});
			return false;
		}else{
			settoken.setToken(result[0].id,result[0].account).then((data)=>{
				return res.json({code:0, data:{token:data,id:result[0].id}, msg:"登录成功！"});
			})
		}
	})
})

router.get('/publicKey', (req, res) => {
	console.log(rsaKey.publicKey)
	res.json({code:0, data:rsaKey.publicKey});
})

module.exports = router;