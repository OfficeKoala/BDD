const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const allqueries = require("../../Query/login_signup_Queries");
const errors=require("../../Error_and_constants/Errors")

Add_Message = async (
  _,
  {
    receivers,
    message_subject,
    message_body,
    message_tag,
    message_replied_id,
    isActive,
    isSent
  },
  ctx
) => {
  const user_id =1//SUPER_ADMIN;//FOR sending message system to vendors and message replies


  let message_type;
  if (isSent === 1) {
    message_type = 4; //For Sent
  } else {
    message_type = 2; //For Draft
  }

  const get_company_id =
    "SELECT company_id as company_id from dbo.security_user WHERE user_id=@user_id ;";
  let poolT = await pool;
  const result = await poolT
    .request()
    .input("user_id", sql.Int, user_id)
    .query(get_company_id);

  try {
    const add_message =
      "INSERT INTO dbo.message (company_id,sender_id,message_subject,message_body,message_type,message_tag,message_replied_id,isActive,createdat) Values (@company_id,@sender_id,@message_subject,@message_body,@message_type,@message_tag,@message_replied_id,@isActive,getutcdate()) ;select scope_identity() as message_id; ";
    const res = await poolT
      .request()
      .input("company_id", sql.Int, result.recordset[0].company_id)
      .input("sender_id", sql.Int, user_id)
      .input("message_subject", sql.VarChar, message_subject)
      .input("message_body", sql.VarChar, message_body)
      .input("message_type", sql.VarChar, message_type)
      .input("message_tag", sql.VarChar, message_tag)
      .input("message_replied_id", sql.VarChar, message_replied_id?message_replied_id:0)
      .input("isActive", sql.Int, isActive)
      
          .query(add_message);

    // res.recordset[0].message_id
    try {
      const insert_to_sender_audit =
        "INSERT INTO dbo.message_sender_audit(message_id,sender_id,message_type,isRead,isFavourite,isDeleted,isSent,sentat) VALUES (@message_id,@sender_id,@message_type,0,0,0,@isSent,getutcdate())";

      await poolT
        .request()
        .input("message_id", sql.Int, res.recordset[0].message_id)
        .input("sender_id", sql.Int, user_id)
        .input("message_type", sql.Int, message_type)
        .input("isSent", sql.Int,isSent)
        .query(insert_to_sender_audit);
    } catch (error) {
      throw new Error(errors.add_message.failed_insertion_sender_audit);
    }

    //******************************************* */
    let msg_type;
    const insert_to_receiver_audit =
    "INSERT INTO dbo.message_receiver_audit(message_id,receiver_id,message_type,isRead,isFavourite,isDeleted,isReceived,receivedat) VALUES (@message_id,@receiver_id,@message_type,0,0,0,1,getutcdate())";

    if (isSent === 1) {
      msg_type = 1;

      try {
        

      
        receivers.map(async item => {
          fetched_receiver_id = await check_if_email_or_username_exists(item);

          if (fetched_receiver_id) {
            await poolT
              .request()
              .input("message_id", sql.Int, res.recordset[0].message_id)
              .input("receiver_id", sql.Int, fetched_receiver_id)
              .input("message_type", sql.Int, msg_type)
              .query(insert_to_receiver_audit);
          } else {

            //ALL ITEMS (OR USERNAME OR EMAILS) NEED TO BE REVERTED AS THESE USERS DON'T EXIST IN OUR SYSTEM
          
        
        }
        });
      } catch (error) {
        throw new Error(errors.add_message.failed_insertion_sender_audit);
      }
    }

else{

msg_type=7;//Hold if Sender hasn't sent the message yet



try {
        
   
    receivers.map(async item => {
      fetched_receiver_id = await check_if_email_or_username_exists(item);

      if (fetched_receiver_id) {
        await poolT
          .request()
          .input("message_id", sql.Int, res.recordset[0].message_id)
          .input("receiver_id", sql.Int, fetched_receiver_id)
          .input("message_type", sql.Int, msg_type)
          .query(insert_to_receiver_audit);
      } else {

        //ALL ITEMS (OR USERNAME OR EMAILS) NEED TO BE REVERTED AS THESE USERS DON'T EXIST IN OUR SYSTEM
      
    
    }
    });
  } catch (error) {
    throw new Error(errors.add_message.failed_insertion_sender_audit);
  }


}

//END OF HOLD BLOCK -ELSE



  } catch (error) {
    //*************************End of Try Block */

    throw new Error(errors.add_message.unknown_error);
  }

  //***********************/
};
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

const check_if_email_or_username_exists = async email_or_username => {
  try {
    let poolT = await pool;
    const res = await poolT
      .request()
      .input("email", sql.VarChar, email_or_username)
      .query(allqueries.check_email_duplicacy);

    if (res.recordset.length > 0) {
      return res.recordset[0].user_id;
    } else {
      const result = await poolT
        .request()
        .input("user_name", sql.VarChar, email_or_username)
        .query(allqueries.check_user_name_duplicacy);

      if (result.recordset.length > 0) {
        return result.recordset[0].user_id;
      } else {
        return false;
      }
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Add_Message
};
