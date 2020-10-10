const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const Update_Draft_Message= async(
    _,
    {message_id, message_subject,message_tag,message_body},
    ctx)=>
    {
        const userObj= await authenticate(ctx);
         try{
                const Update_Draft_Query= "UPDATE dbo.message SET message_subject=@message_subject, message_body=@message_body,message_tag=@message_tag WHERE message_id=@message_id AND message_type=2";
                const poolT= await pool;
                const res= await poolT
                .request()
                .input("message_id",sql.Int,message_id)
                .input("message_body",sql.VarChar,message_body)
                .input("message_subject",sql.VarChar,message_subject)
                .input("message_tag",sql.Int,message_tag)
                .query(Update_Draft_Query)
                return{stat:"Draft Messages Updated Sucessfully"}
                        
         }

         catch(error)
         {
             throw new Error(error);
         }

    }

    module.exports={
        Update_Draft_Message
    }
