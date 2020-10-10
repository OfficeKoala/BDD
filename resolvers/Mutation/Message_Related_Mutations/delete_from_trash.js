const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const delete_from_trash = async (_, { message_id }, ctx) => {
  let poolT = await pool;
  const userObj = await authenticate(ctx);
  try {
    const check_message =
      "Select sender_id from dbo.message where message_id=@message_id";
    const response_sender_id = await poolT
      .request()
      .input("message_id", sql.Int, message_id)
      .query(check_message);

    response_sender_id.recordset[0].sender_id;
    if (response_sender_id.recordset[0].sender_id === userObj.user_id) {
      const delete_trash =
        "update dbo.message_sender_audit set isActive=0 where sender_id=@user_id AND message_id=@message_id";
      await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("message_id", sql.Int, message_id)
        .query(delete_trash);
    } else {
      const delete_trash =
        "update dbo.message_receiver_audit set isActive=0 where receiver_id=@user_id AND message_id=@message_id";
      await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("message_id", sql.Int, message_id)
        .query(delete_trash);
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  delete_from_trash
};
