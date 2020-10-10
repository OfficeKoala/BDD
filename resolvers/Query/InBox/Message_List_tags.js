const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const fetch_messages_by_tag = async (
  _,
  { page_size, page_no, messages_tag },
  ctx
) => {
  const userObj = await authenticate(ctx);


  try {
  
    const fetch_tag_message_query =
      "select  m.message_subject,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id,su.first_name, su.last_name ,su.email_Address from dbo.message m join dbo.message_sender_audit ms on m.message_id = ms.message_id AND ms.sender_id = @user_id join security_user su on ms.sender_id=su.user_id   AND ms.isActive = 1   where m.[message_tag] =@tag and m.message_replied_id=0 ORDER BY ms.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY; select  m.message_subject, m.message_body, mr.isRead, mr.isFavourite, m.message_replied_id, m.message_id from dbo.message m join dbo.message_receiver_audit mr on m.message_id = mr.message_id where mr.receiver_id =@user_id  AND mr.isActive = 1 and m.[message_tag] =@tag  and m.message_replied_id=0 ORDER BY mr.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY; ";
    
      if (page_no > 0) {
      let poolT = await pool;
      const res = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("tag", sql.Int, messages_tag)
        .input("page_size", sql.Int, page_size)
        .input("page_no", sql.Int, page_no)
        .query(fetch_tag_message_query);
       
      let messagesS = res.recordsets[0];
      let messagesR = res.recordsets[1];
      // console.log("@@@@@@@@@@@@@@@@@@",messagesS)
      // console.log("###############",messagesR)

      const get_messages_count =
        "select Sum(messages) as count_of_messages from(select count(m.message_id) as messages from dbo.message m join dbo.message_receiver_audit mr on m.message_id = mr.message_id where mr.receiver_id = @user_id  AND mr.isActive = 1  and m.message_tag = @tag UNION ALL select count(m.message_id) as messages from dbo.message m join dbo.message_sender_audit ms on m.message_id = ms.message_id where ms.sender_id = @user_id AND ms.isActive = 1 and m.message_tag =@tag and m.message_replied_id=0 ) x;";
      const reso = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("tag", sql.Int, messages_tag)
        .query(get_messages_count);
        
   


      const get_all_receivers =
        "SELECT distinct receiver_id from dbo.message_receiver_audit Where message_id=@message_id ;";

      //********************************************************************** */
      if(messagesR.length>0){



         InBox_Messages = await Promise.all(
     
          // console.log(messagesR)
         
          messagesR.map(async item => {
          //  console.log("@@@@@@@@@@@@@@@",item);
  
            resp = await poolT
              .request()
              .input("message_id", sql.Int, item.message_id)
              .query(get_all_receivers); 
            if (resp.recordset.length > 0) {
              Receivers = await Promise.all(
                resp.recordset.map(async elem => {
                  ress = await poolT
                    .request()
                    .input("receiver_id", sql.Int, elem.receiver_id)
                    .query(
                      "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@receiver_id"
                    );
                  return {
                    email_address: ress.recordset[0].email_address,
                    Name:
                      ress.recordset[0].first_name +
                      " " +
                      ress.recordset[0].last_name
                  };
                })
              );
            }
  
            
  
  
            // messages.push({
            //   sender_name: senderDetails.Name,
            //   sender_mail: senderDetails.Email,
            //   message_subject: item.message_subject,
            //   message_body: item.message_body,
            //   message_received_date:
            //     item.createdat == null ? "" : item.createdat.toString(),
            //   isFavourite:
            //     item.isFavourite == null
            //       ? null
            //       : item.isFavourite.toJSON().data[0],
            //   isRead: item.isRead == null ? null : item.isRead.toJSON().data[0],
            //   message_id: item.message_id
            // });
          })
  
          //*********END OF MAP */******************************************** */
        );//*PROMISE END
          
      }
      
      

   
      return {
        // messages: messages,
        no_of_messages: reso.recordset[0].count_of_messages
      };
    }  
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  fetch_messages_by_tag
};
