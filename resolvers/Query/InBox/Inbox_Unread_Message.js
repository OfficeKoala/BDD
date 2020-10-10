const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const Inbox_Unread_Messages = async (_, {}, ctx) => {
  try {
    const userObj = await authenticate(ctx);
    // const userObj={user_id:1,company_id:4}
    const count_unread_message =
      "Select count(isRead) as Unread_Messages from dbo.message_receiver_audit where isRead=0 AND receiver_id=@user_id and isdeleted=0";
    let poolT = await pool;
    const res = await poolT
      .request()
      .input("user_id", sql.Int, userObj.user_id)
      .query(count_unread_message);

    const get_messages_count =
      "SELECT COUNT(ms.message_id) as no_of_messages FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id  where ra.sender_id=@user_id AND isSent=0 AND ra.message_type=2 AND ra.isActive=1 and ra.isdeleted=0;";
    const reso = await poolT
      .request()
      .input("user_id", sql.Int, userObj.user_id)
      .query(get_messages_count);

    // console.log("*****************************************************",res);
    return {
      Unread_Messages: res.recordset[0].Unread_Messages,
      Draft_messages: reso.recordset[0].no_of_messages
    };
  } catch (err) {
    // throw err;
    throw new Error(err);
  }
};
module.exports = {
  Inbox_Unread_Messages
};
