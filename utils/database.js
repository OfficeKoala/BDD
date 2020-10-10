/* eslint-disable no-console */
const sql = require("mssql");
const config = require("../config");
const errors=require("../resolvers/Error_and_constants/Errors")

// async/await style:
const pool = new sql.ConnectionPool(config.DB)
  .connect()
  .then(pool => {
     
    return pool;
  })
  .catch(err => {
   
  });

const authenticateUser = async (username, password) => {
  await pool;
  try {
    const request = pool.request(); // or: new sql.Request(pool1)
    const result = request.query(
      "select user_id from dbo.security_user where user_name=${username} and password='${password}'"
    );
    console.log("db connected",result);
    return result; 
  } catch (err) {
    console.error("SQL error", err);
  }
};

const checkDbConnection = async () => {
  const p = await pool;
  try {
    let res = await p.request().query("select * from company"); 
    console.log("Database connection check: Successful");
  } catch (err) { 
    throw new Error(errors.db_error_string, err);
  }
};

module.exports = { pool };
