const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const errors=require("../../Error_and_constants/Errors")
// const allqueries = require("../../Query/login_signup_Queries");

//Vendor to System
Send_Message = async (
  _,
  {
    message_subject,
    message_body,
    message_tag,
    message_replied_id,
    
    isActive,
    isSent,
    isDraft,
    message_id
  },
  ctx
) => {
  const userObj =await authenticate(ctx);
  
  try{
  let poolT = await pool;

 
        
//If DRAFT MESSAGE -----THEN SEND 
if(isDraft===1)
{

if(message_id)
{
  const update_message_table =
  "update dbo.message set message_type=4 ,createdat=getutcdate() ,message_body=@message_body,message_subject=@message_subject,message_tag=@message_tag where message_id=@message_id";

await poolT
  .request()
  .input("message_id", sql.Int,message_id)
  .input("message_tag", sql.Int,message_tag)
  .input("message_body", sql.VarChar,message_body)
  .input("message_subject", sql.VarChar,message_subject)
  .query(update_message_table);

  
  const update_message_sender_audit_table =
  "update dbo.message_sender_audit set message_type=4,isSent=1 ,sentat=getutcdate() where message_id=@message_id";
   await poolT
  .request()
  .input("message_id", sql.Int,message_id)
  .query(update_message_sender_audit_table);

  
  const update_message_receiver_audit_table =
  "update dbo.message_receiver_audit set message_type=1 ,receivedat=getutcdate() where message_id=@message_id";
   await poolT
  .request()
  .input("message_id", sql.Int,message_id)
  .query(update_message_receiver_audit_table);


}

return ;

}
//DRAFT MESSAGE HANDLING


  let message_type;
  if (isSent === 1) {
    message_type = 4; //For Sent
  } else {
    message_type = 2; //For Draft


    if (message_subject===undefined)
    {message_subject="";}
    if(message_body===undefined)
    {
    message_body="";
    }
    
  }

    try { 
    const insert_message =
      "INSERT INTO dbo.message (company_id,sender_id,message_subject,message_body,message_type,message_tag,message_replied_id,isActive,createdat) Values (@company_id,@sender_id,@message_subject,@message_body,@message_type,@message_tag,@message_replied_id,@isActive,getutcdate()) ;select scope_identity() as message_id; ";
    const res = await poolT
      .request()
      .input("company_id", sql.Int, userObj.company_id)
      .input("sender_id", sql.Int, userObj.user_id)
      .input("message_subject", sql.VarChar, message_subject)
      .input("message_body", sql.VarChar, message_body)
      .input("message_type", sql.VarChar, message_type)
      .input("message_tag", sql.VarChar, message_tag)
      .input(
        "message_replied_id",
        sql.VarChar,
        message_replied_id === undefined ? 0 : message_replied_id
      )
      .input("isActive", sql.Int, isActive)

      .query(insert_message);

    // res.recordset[0].message_id
    try {
      const insert_to_sender_audit =
        "INSERT INTO dbo.message_sender_audit(message_id,sender_id,message_type,isRead,isFavourite,isDeleted,isActive,isSent,sentat) VALUES (@message_id,@sender_id,@message_type,0,0,0,1,@isSent,getutcdate())";
  // console.log("****testing",message_type,"message_id......",res.recordset[0].message_id,"%%%%%%%%%%%%%", userObj.user_id,"isSent",isSent)
      await poolT
        .request()
        .input("message_id", sql.Int, res.recordset[0].message_id)
        .input("sender_id", sql.Int, userObj.user_id)
        .input("message_type", sql.Int, message_type)
        .input("isSent", sql.Int, isSent === 1 ? isSent : 0)
        .query(insert_to_sender_audit);
    } catch (error) {
      throw new Error(error)
      // throw new Error(" Insertion In message_sender_audit failed ! Technical Issue");
    }

    //********************************************/
    let msg_type;
    // const insert_to_receiver_audit =
    //   "INSERT INTO dbo.message_receiver_audit(message_id,receiver_id,message_type,isRead,isFavourite,isDeleted,isReceived,isActive,receivedat) VALUES (@message_id,@receiver_id,@message_type,0,0,0,1,1,getutcdate())";

    if (isSent === 1) {
      msg_type = 1;

      try {
        // console.log("&&&&&&message_type", msg_type,"$$$$$$$$$$",res.recordset[0].message_id )
        const insert_to_receiver_audit =
      "INSERT INTO dbo.message_receiver_audit(message_id,receiver_id,message_type,isRead,isFavourite,isDeleted,isReceived,isActive,receivedat) VALUES (@message_id,@receiver_id,@message_type,0,0,0,1,1,getutcdate())";

     
        await poolT
          .request()
          .input("message_id", sql.Int, res.recordset[0].message_id)
          .input("receiver_id", sql.Int, 1)
          .input("message_type", sql.Int, msg_type)
          .query(insert_to_receiver_audit);
// console.log("receiver audit");
        //ALL ITEMS (OR USERNAME OR EMAILS) NEED TO BE REVERTED AS THESE USERS DON'T EXIST IN OUR SYSTEM

        return { stat: "Successful" };
      } catch (error) {
        throw new Error(errors.send_message.failed_insertion_receiver_audit);
      }
    } else {
      msg_type = 2; //Hold if Sender hasn't sent the message yet

      try {
        const insert_to_receiver_audit =
        "INSERT INTO dbo.message_receiver_audit(message_id,receiver_id,message_type,isRead,isFavourite,isDeleted,isReceived,isActive,receivedat) VALUES (@message_id,@receiver_id,@message_type,0,0,0,1,1,getutcdate())";
  
        await poolT
          .request()
          .input("message_id", sql.Int, res.recordset[0].message_id)
          .input("receiver_id", sql.Int, 1)
          .input("message_type", sql.Int, msg_type)
          .query(insert_to_receiver_audit);

        //ALL ITEMS (OR USERNAME OR EMAILS) NEED TO BE REVERTED AS THESE USERS DON'T EXIST IN OUR SYSTEM

        return { stat: "Successful" };
      } catch (error) {
        throw new Error(errors.send_message.failed_insertion_receiver_audit);
      }
    }

    //END OF HOLD BLOCK -ELSE
  } catch (error) {
    //*************************End of Try Block */

    throw new Error(error);
  }

}
catch(err)
{
  throw new Error(err)
}

  //***********************/
};
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// const check_if_email_or_username_exists = async email_or_username => {
//   try {
//     let poolT = await pool;
//     const res = await poolT   
//       .request()
//       .input("email", sql.VarChar, email_or_username)
//       .query(allqueries.check_email_duplicacy);

//     if (res.recordset.length > 0) {
//       return res.recordset[0].user_id;
//     } else {
//       const result = await poolT
//         .request()
//         .input("user_name", sql.VarChar, email_or_username)
//         .query(allqueries.check_user_name_duplicacy);

//       if (result.recordset.length > 0) {
//         return result.recordset[0].user_id;
//       } else {
//         return false;
//       }
//     }
//   } catch (err) {
//     throw new Error(err);
//   }
// };

module.exports = {
  Send_Message
};
