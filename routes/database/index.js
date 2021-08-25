const express = require("express");
const router = express.Router();
const reqSql = require("../../model/index");

/*
@params{
    tableName:表名
    tableRemark:表注释
    fieldName:字段名
    fieldRemark:字段注释
    fieldType:字段类型
    notNull:不为null 0/1
    isKey:是否主键key 0/1
} 
 */
//查询列表
router.post("/list", (req, res) => {
  const { tableName = "", pageSize, pageNum } = req.body;
  if (!pageSize) {
    res.json({ code: 1, msg: "每页条数必须传" });
    return false;
  } else if (!pageNum) {
    res.json({ code: 1, msg: "页码必须传" });
    return false;
  }
  let sql = `SELECT SQL_CALC_FOUND_ROWS 
                c.TABLE_NAME 'tableName',
                t.TABLE_COMMENT 'tableComment',
                c.COLUMN_NAME 'fieldName',
                c.COLUMN_COMMENT 'fieldComment',
                c.COLUMN_TYPE fieldType,
                CASE c.IS_NULLABLE 
                    WHEN 'yes' THEN true
                    WHEN 'no' THEN false
                END AS notNull,
                            CASE c.COLUMN_KEY 
                    WHEN 'PRI' THEN true
                    WHEN '' THEN false
                END AS isKey
                FROM
                (SELECT * FROM information_schema.columns WHERE table_schema = 'zdq'
                ${tableName && ` AND TABLE_NAME='${tableName}'`}) c 
                Left JOIN 
                (SELECT * FROM information_schema.TABLES WHERE table_schema = 'zdq') t	ON c.table_name = t.table_name`;
  sql += ` limit ${
    (pageNum - 1) * pageSize
  } , ${pageSize};SELECT FOUND_ROWS() as total;`;
  const obj = {
    sql: sql,
    res,
  };
  reqSql(obj).then((result) => {
    return res.json({
      code: 0,
      data: { list: result[0], total: result[1][0].total },
    });
  });
});

//查询表名列表
router.get("/tableNameList", (req, res) => {
  let sql = `SELECT TABLE_Name value, TABLE_COMMENT label FROM information_schema.TABLES WHERE table_schema = 'zdq';`;
  const obj = {
    sql: sql,
    res,
  };
  reqSql(obj).then((result) => {
    return res.json({
      code: 0,
      data: result,
    });
  });
});

module.exports = router;
