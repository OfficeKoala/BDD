const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

Trash_Message = async (_, { message_id, message_type }, ctx) => {
  try {
    let poolT = await pool;
    const userObj = await authenticate(ctx);
    if (message_type === 4 || message_type === 2) {
      //Sent Messages & Draft Messages
      const delete_query = //I added message_type =3
        "UPDATE dbo.message_sender_audit set isDeleted=1,isActive=1 where  sender_id=@user_id AND message_id=@message_id ";
      await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("message_id", sql.Int, message_id)
        .query(delete_query);

      return { stat: "Message Sent To Trash" };
    }

    if (message_type === 1) {
      const delete_query2 =
        "UPDATE dbo.message_receiver_audit set isDeleted=1 ,isActive=1  where  receiver_id=@user_id AND message_id=@message_id ";
      await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("message_id", sql.Int, message_id)
        .query(delete_query2);

      return { stat: "Message Sent To Trash" };
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Trash_Message
};
