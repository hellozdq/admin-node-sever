const express = require('express');
const router = express.Router();
const reqSql = require("../../model/index");

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
	let sql = `SELECT u.id,a.account,a.id accountId,u.name,u.phone,u.roles FROM user u JOIN account a on u.relId=a.id  WHERE 1=1`
	if(name){
		sql += ` AND u.name like '%${name}%'`
	}
	if(phone){
		sql += ` AND u.phone like '%${phone}%'`
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

// 删除用户 
router.delete('/deleteUser', (req, res) => {
	const { id, accountId } = req.body;
	if(!id){
		res.json({code:1,msg:"用户id必须传"});
		return false;
	}else if(!accountId){
		res.json({code:1,msg:"账户id必须传"});
		return false;
	}
	const obj = {
		sql:`DELETE FROM user WHERE id=${id};DELETE FROM account WHERE id=${accountId};`,
		res
	}
	reqSql(obj)
	.then((result) => {
		return res.json({code:0, data:{msg:"删除成功！"}});
	})
})

//所有权限
router.get('/roles', (req, res) => {
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
			data = handleRoles([...data],obj,1);
		}
		return res.json({code:0, data:data});
	})
})

//修改权限
router.put('/updateRole', (req, res) => {
	const { userId, roles } = req.body;
	if(!userId){
		res.json({code:1,msg:"userId必须传"});
		return false;
	}else if(!roles){
		res.json({code:1,msg:"roles必须传"});
		return false;
	}
	const obj = {
		sql:`UPDATE user SET roles='${roles}' WHERE id=${userId};`,
		res
	}
	reqSql(obj)
	.then((result) => {
		return res.json({code:0, data:{msg:"修改成功！"}});
	})
})

// 根据用户id获取权限
router.get('/rolesByUserId', (req, res) => {
	const { userId } = req.query;
	if(!userId){
		res.json({code:1,msg:"userId必须传"});
		return false;
	}
	const obj = {
		sql:`SELECT roles FROM user WHERE id=${userId};`,
		res
	}
	reqSql(obj)
	.then((result) => {
		return res.json({code:0, data:result[0].roles});
	})
})


// 处理权限
function handleRoles(arr,obj,index){
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
			arr[activeIndex].children = handleRoles(arr[activeIndex].children,obj,index+1);
		}
	}else{
		const child = {
			roleId:obj['roleId'+index],
			roleName:obj['roleName'+index]
		}
		if(index!==3){
			child.children = handleRoles([],obj,index+1);
		}
		arr.push(child);
	}
	return arr;
}
module.exports = router;