const mysql = require('mysql');
const config = require('./config');//数据库链接信息

console.log("=========>>")
// 连接数据库
const connect = mysql.createConnection(config.mysql);
connect.connect();

// 请求数据库
const reqSql = (query) => {
    return new Promise((resolve,reject) => {
        connect.query(query.sql, (err, result) => {
            if(err){
                console.log(err)
                // reject(err);
                query.res.json({code:10, msg:"001-服务错误！"});
            }else{
                resolve(result);
            }
        })
    })
        
}

module.exports = reqSql;