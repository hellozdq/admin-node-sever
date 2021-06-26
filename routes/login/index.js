const express = require('express');
const router = express.Router();
const reqSql = require("../../model/index");
const settoken = require('../../common/token_vertify');
const rsaKey = require('../../common/rsaKey');

//登录
router.post('/', async(req, res) => {
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
		sql:`SELECT * FROM account WHERE account= '${ account }'`,
		res
	}
	try{
		const result = await reqSql(obj);
		const item = result[0];
		if(result.length == 0 || item.password !== pass){
			res.json({code:1, msg:"账号或密码不正确！"});
			return false;
		}else{
			const token = await settoken.setToken(item.id,item.account)
			const obj2 = {
				sql:`SELECT * FROM user WHERE relId=${item.id}`,
				res
			}
			const result2 = await reqSql(obj2);
			const item2 = result2[0];
			return res.json({code:0, data:{
				token:token,
				id:item.id,
				account,
				userId:item2.id,
				name:item2.name
			}, msg: "登录成功！"});
		}
	}catch{
		return res.json({code:2, msg: "请求失败！"});
	}
})

// 修改密码
router.put('/updatePassword', async(req, res) => {
	const { id, password, newPassword } = req.body;
	if(!id){
		res.json({code:1,msg:"账号id必须传"});
		return false;
	}else if(!password){
		res.json({code:1,msg:"密码不能为空"});
		return false;
	}else if(!newPassword){
		res.json({code:1,msg:"新密码不能为空"});
		return false;
	}
	const pass = rsaKey.decryption(password);
	const newPass = rsaKey.decryption(newPassword);
	const obj = {
		sql:`SELECT * FROM account WHERE id='${ id }'`,
		res
	}
	try{
		const result = await reqSql(obj);
		const item = result[0];
		if(result.length == 0 || item.password !== pass){
			res.json({code:1, msg:"密码不正确！"});
			return false;
		}else{
			const token = await settoken.setToken(item.id, item.account)
			const obj2 = {
				sql:`UPDATE account SET password='${newPass}' WHERE id=${id};`,
				res
			}
			await reqSql(obj2);
			return res.json({code: 0, data: {msg: "修改成功！"}});
		}
	}catch{
		return res.json({code:2, msg:"请求失败！"});
	}
})

router.get('/publicKey', (req, res) => {
	res.json({code:0, data:rsaKey.publicKey});
})

module.exports = router;