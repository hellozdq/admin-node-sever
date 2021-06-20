const express = require('express');
const router = express.Router();
const reqSql = require("../../model/index");
const settoken = require('../../common/token_vertify');
const rsaKey = require('../../common/rsaKey');

//查询列表
router.post('/list', (req, res) => {
	const { name = '', phone = '', pageSize, pageNum } = req.body;
	if(!pageSize){
		res.json({code:1,msg:"每页条数必须传"});
		return false;
	}else if(!pageNum){
		res.json({code:1,msg:"页码必须传"});
		return false;
	}
	let sql = `SELECT u.id, u.name, u.phone FROM user as u WHERE 1=1`
	if(name){
		sql += ` AND name like '%${name}%'`
	}
	if(phone){
		sql += ` AND phone like '%${phone}%'`
	}
	sql+=` limit ${(pageNum-1)*pageSize} , ${pageSize};SELECT FOUND_ROWS() as total;`
	const obj = {
		sql:sql,
		res
	}
	reqSql(obj)
	.then((result) => {
		console.log(result)
		return res.json({code:0, data:{list:result[0],total:result[1][0].total}});
	})
})

//修改信息
router.put('/updateUser', (req, res) => {
	const { id, name, phone } = req.body;
	if(!id){
		res.json({code:1,msg:"id必须传"});
		return false;
	}else if(!name){
		res.json({code:1,msg:"名字必须传"});
		return false;
	}else if(!phone){
		res.json({code:1,msg:"电话必须传"});
		return false;
	}
	const obj = {
		sql:`UPDATE user SET name='${name}', phone='${phone}' WHERE id=${id};`,
		res
	}
	reqSql(obj)
	.then((result) => {
		return res.json({code:0, data:{msg:"修改成功！"}});
	})
})

//所有权限
router.post('/roles', (req, res) => {
	let sql = `SELECT 
				u1.roleId roleId1, u1.roleName roleName1,u1.parentId parentId1,
				u2.roleId roleId2, u2.roleName roleName2,u2.parentId parentId2,
				u3.roleId roleId3, u3.roleName roleName3,u3.parentId parentId3 
			 FROM (roles u1 JOIN roles u2 ON u2.parentId=u1.roleId) JOIN roles u3 ON u3.parentId=u2.roleId;`;
	const obj = {
		sql:sql,
		res
	}
	reqSql(obj)
	.then((result) => {
		// console.log(result)
		let data = [];
		for(let i in result){
			const obj = result[i];
			data = returnItem([...data],obj,1);
		}
		console.log("data");
		console.log(JSON.stringify(data));
		return res.json({code:0, data:data});
	})
})


function returnItem(arr,obj,index){
	// 先判断是否存在不存在就新增
	let activeIndex = -1;
	if(arr.length>0){
		activeIndex = arr.findIndex((item)=>{
			return obj['roleId'+index] === item.roleId;
		})
	}
	// 存在就修改children，不存在就新增
	if(activeIndex!==-1){
		if(arr[activeIndex].children){
			arr[activeIndex].children = returnItem(arr[activeIndex].children,obj,index+1);
		}
	}else{
		const child = {
			roleId:obj['roleId'+index],
			roleName:obj['roleName'+index]
		}
		if(index!==3){
			child.children = returnItem([],obj,index+1);
		}
		arr.push(child);
	}
	return arr;
}
module.exports = router;