const { pool } = require("../../../utils");
const sql = require("mssql");
const {send_token_mail}= require("../Signup_Mail")
const jwt = require("jsonwebtoken");
const config=require("../../../config")
const sqlqueries =require("../../Sql_queries/Mutation_queries")
const errors=require("../../Error_and_constants/Errors")

const Forget_password_verify_email = async (_, {email}, ctx) => {

  const poolTub=await pool;


try {
    const check_if_mail_exists = await poolTub
    .request()
    .input("email",sql.VarChar,email)
    .query(sqlqueries.forgot_password_query.check_if_email_isof_vendor);

    if(check_if_mail_exists.recordset.length>0)
    {
        //Creating token for 30 minutes secure access to password change
        const token=jwt.sign(
            {
                user_id:check_if_mail_exists.recordset[0].user_id,
                // user_id:4
            },
            config.SESSION_SECRET,
            { expiresIn: 60*30 }
          )

          // console.log("token", token)
        const url="https://www.goupendo.com/#/password_change?token="+token;     
   
      send_token_mail(email,"goupendo@mail.com",url);  
      

    }
    else
    {
      throw new Error(errors.email_dont_exist)
    }
}
catch(error){

throw error


}
  



}

 module.exports={
     Forget_password_verify_email
 }