const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const fetch_message_By_Id = async (_, { message_id, flag }, ctx) => {
  const userObj = await authenticate(ctx);
  // const userObj = { user_id:3, company_id: 3 };

  try {

    
    let poolT = await pool;
    const messageRepliedResponse = await poolT
      .request()
      .input("message_id", sql.Int, message_id)
      .input("user_id", sql.Int, userObj.user_id)
      .query(
        flag === 0
          ? ";WITH hierarchy AS (SELECT m.* FROM message m where m.message_id = @message_id UNION ALL SELECT x.*  FROM message x JOIN hierarchy y ON y.message_id = x.message_replied_id) SELECT s.*, u.first_name,u.last_name, u.email_address, mr.* FROM hierarchy s join security_user u on s.sender_id = u.user_id   left join[dbo].[message_sender_audit]  mr on s.message_id = mr.message_id   where s.message_id!=@message_id or s.message_id=@message_id"
          : ";WITH hierarchy AS (SELECT m.* FROM message m where m.message_id = @message_id UNION ALL SELECT x.*  FROM message x JOIN hierarchy y ON y.message_id = x.message_replied_id) SELECT s.*, u.first_name,u.last_name, u.email_address, mr.* FROM hierarchy s join security_user u on s.sender_id = u.user_id   left join[dbo].[message_receiver_audit]  mr on s.message_id = mr.message_id   where s.message_id!=@message_id or s.message_id=@message_id"
      );

    const messages = messageRepliedResponse.recordset;
    

    const get_all_receivers =
      "SELECT distinct receiver_id from dbo.message_receiver_audit Where message_id=@message_id ;";

    //********************************************************************** */
    const InBox_Messages = await Promise.all(
      messages.map(async item => {
        resp = await poolT
          .request()
          .input("message_id", sql.Int, item.message_id)
          .query(get_all_receivers);
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
                ress.recordset[0].first_name + " " + ress.recordset[0].last_name
            };
          })
        );

        var ss = {
          sender_name: item.first_name + " " + item.last_name,
          sender_mail: item.email_address,
          message_subject: item.message_subject,
          message_body: item.message_body,
          message_received_date: item.createdat.toString(),
          isFavourite: item.isFavourite.toJSON().data[0],
          isRead: item.isRead.toJSON().data[0],
          message_id: item.message_id[0],
          other_receivers: Receivers,
          message_tag: item.message_tag,
        }; 
        return ss;
      })
    );
    return {
      messages: InBox_Messages,
      no_of_messages: messages.length
    };
  } catch (err) {
    // throw err;
    throw new Error(err);
  }
};

module.exports = {
  fetch_message_By_Id
};
