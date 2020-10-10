const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

Fav_UnFav_Message = async (_, { message_id, message_type,flag }, ctx) => {
  let poolT = await pool;
  try{
  const userObj = await authenticate(ctx);
  if (message_type === 4 || message_type === 2) {
    //Sent Messages & Draft Messages

    const fav_query =
      "UPDATE dbo.message_sender_audit set isFavourite=@flag  where  message_id=@message_id ";
       await poolT
       .request()
      .input("user_id", sql.Int, userObj.user_id)
        .input("message_id", sql.Int, message_id)
        .input("flag", sql.Int, flag)
        .query(fav_query);

      return { stat: "Message Marked Favourite" };
  }
//for INbox
  if (message_type === 1) {
    const fav_query2 =
      "UPDATE dbo.message_receiver_audit set isFavourite=@flag where   message_id=@message_id ";
    await poolT
      .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("message_id", sql.Int, message_id)
        .input("flag", sql.Int, flag)
        .query(fav_query2);

    return { stat: "Message Marked Favourite" };
  }


  if(message_type===3)
  {
    const fav_query3 =
      "UPDATE dbo.message_receiver_audit set isFavourite=@flag where message_id=@message_id " ; "UPDATE dbo.message_sender_audit set isFavouite=@flag where message_id=@message_id"
    await poolT
      .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("message_id", sql.Int, message_id)
        .input("flag", sql.Int, flag)
        .query(fav_query3);

    return { stat: "Message Marked Favourite" };
  }
}
catch(err)
{
  throw new Error(err)
}
};

module.exports = {
    Fav_UnFav_Message
};
