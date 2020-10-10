const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const Inbox_Unread_Draft_Messages = async (_,
     {},
    ctx) => {
    try {
        const userObj =  await authenticate(ctx);
        const count_unread_message = "SELECT SUM (messages) as inbox_draft_message from (Select count(isRead) as messages from dbo.message_receiver_audit where isRead=0 AND receiver_id=@user_id union all SELECT count (message_id) as messages from dbo.message_sender_audit as draft_messages where sender_id=@user_id AND message_type=2) s";
        const pool1 = await pool;
        const res = await pool1.request().input("user_id", sql.Int, userObj.user_id)
       
        .query(count_unread_message);
        // console.log("*****************************************************",res.recordset[0]);
        return { Unread_Messages: res.recordset[0].inbox_draft_message}
        
    }
    catch (err) {
        throw new Error(error);
    }
}
module.exports = {
    Inbox_Unread_Draft_Messages
};