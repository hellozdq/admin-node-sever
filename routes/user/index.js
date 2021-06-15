const express = require('express');
const router = express.Router();
const reqSql = require("../../model/index");
const settoken = require('../../common/token_vertify');
const rsaKey = require('../../common/rsaKey');

//登录
router.post('/list', (req, res) => {
	const { name = '', phone = '', pageSize, pageNum } = req.body;
	if(!pageSize){
		res.json({code:1,msg:"每页条数必须传"});
		return false;
	}else if(!pageNum){
		res.json({code:1,msg:"页码必须传"});
		return false;
	}
	const obj = {
		sql:`select * from user limit ${(pageNum-1)*pageSize} , ${pageSize}`,
		res
	}
	reqSql(obj)
	.then((result) => {
		return res.json({code:0, data:result});
	})
})

module.exports = router;