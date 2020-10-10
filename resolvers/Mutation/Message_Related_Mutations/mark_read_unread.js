const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const mark_read_unread = async (_, { message_id, flag }, ctx) => {
  const userObj = await authenticate(ctx);
  try {
    let poolT = await pool;
    if (flag === 1) {
      const update_values =
        "UPDATE dbo.message_receiver_audit SET isRead=1 WHERE receiver_id=@user_id AND message_id=@message_id;";

            await message_id.map(async item => {
        //********************************** /
        await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("message_id", sql.Int, item)
          .query(update_values);
      });

      return { stat: "Mark Read" };
    } else {
      const query1 =
        "UPDATE dbo.message_receiver_audit Set isRead=0 WHERE receiver_id=@user_id AND message_id=@message_id";
      await message_id.map(async item => {
        await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("message_id", sql.Int, item)
          .query(query1);
      });

      return { stat: "Mark Unread" };
    }
  } catch (err) {
    throw new Error(error);
  }
};
module.exports = {
  mark_read_unread
};
