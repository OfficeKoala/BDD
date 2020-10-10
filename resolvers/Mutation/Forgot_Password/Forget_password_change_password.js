const { pool } = require("../../../utils");
const sql = require("mssql");
const {send_token_mail}= require("../Signup_Mail")
const jwt = require("jsonwebtoken");
const config=require("../../../config");
const bcrypt = require("bcryptjs");
const sqlqueries=require("../../Sql_queries/Mutation_queries")

const Forget_password_change_password = async (_, {user_id,password}, ctx) => {

const _password = await bcrypt.hash(password, 10);

try{
 
    
    const poolTub=await pool;

    const password_match= "select  password from dbo.security_user where user_id=@user_id"
    const response= await poolTub
    .request()
    .input("user_id", user_id)
    .query(password_match)
    const password_validation = await bcrypt.compare(password, response.recordset[0].password);
    if(password_validation)
    {
        throw new Error("Old Password! Please enter new password")
    }
    const res=await poolTub
   .request()
   .input("password",sql.VarChar,_password)
   .input("user_id",sql.VarChar,user_id)
   .query(sqlqueries.forgot_password_query.update_user_pass);
   return {stat:"successfully updated password"}
}
catch(error){
    throw error
}




}

module.exports={
    Forget_password_change_password
}


