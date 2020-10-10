const {
    pool
} = require("../../../utils");
const sql = require("mssql");
const {
    authenticate
} = require("../../../utils");

const Mark_Tag_Fav_Unfav_Api = async (_, {
        message_id,
        flag,
        isSent

    },
    ctx) => {
    const userObj = await authenticate(ctx);
    // {user_id:4,company_id:3}
    try {


        if (isSent === 1) {
            const mark_fav_unfav_tag_messages_sender = "UPDATE dbo.message_sender_audit SET isFavourite=@flag where  sender_id=@user_id AND message_id=@message_id"
            const poolT = await pool;
            const res = await poolT
                .request()
                .input("user_id", userObj.user_id)
                .input("message_id", sql.Int, message_id)
                .input("flag", sql.Int, flag)
                .query(mark_fav_unfav_tag_messages_sender)
            return {
                stat: "Tag Messages Favourite Unfavourite Set"
            }
        } else {
            const mark_fav_unfav_tag_messages_receiver = "UPDATE dbo.message_receiver_audit SET isFavourite=@flag where receiver_id= @user_id AND  message_id=@message_id"
            const poolT = await pool;
            const res = await poolT
                .request()
                .input("user_id", userObj.user_id)
                .input("message_id", sql.Int, message_id)
                .input("flag", sql.Int, flag)
                .query(mark_fav_unfav_tag_messages_receiver)
            return {
                stat: "Tag Messages Favourite Unfavourite Set"
            }
        }


    } catch (err) {
        throw new Error(err);
    }


}

module.exports = {
    Mark_Tag_Fav_Unfav_Api
}