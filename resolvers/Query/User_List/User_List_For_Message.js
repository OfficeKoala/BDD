const {pool} = require("../../../utils");
const sql = require("mssql");
const {authenticate} = require("../../../utils");
const User_List_For_Message = async (_, {}, ctx) => {
const userObj =await authenticate(ctx);
try {
    let pool1 = await pool;
    const query2 = "SELECT first_name, user_name,last_name,email_address from dbo.security_user where user_id=@user_id"
    const res1 = await pool1
    .request()
    .input("user_id", sql.Int, userObj.user_id)
    .query(query2)
    user = res1.recordset[0];
    var name=user.first_name+user.last_name;
    return {
    first_name:name,
    email_address:user.email_address,
    user_name:user.user_name   
   }
} 
catch (err) {
        throw new Error(err)
}
}

module.exports = {
    User_List_For_Message
}