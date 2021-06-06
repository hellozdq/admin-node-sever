var mysql = require('mysql');
var config = require('./config');//数据库链接信息

console.log("=========>>")
// 连接数据库
var connect = mysql.createConnection(config.mysql);
connect.connect();

module.exports = connect;