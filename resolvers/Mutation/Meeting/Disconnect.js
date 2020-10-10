const {
    pool
} = require("../../../utils");
const sql = require("mssql");
const {
    authenticate
} = require("../../../utils");
const {constant_file}= require("../../../utils");
const Disconnect = async (_, {
    meeting_id,user_id
}, ctx) => {
//   const userObj= {user_id:3, company_id :4}
    //  const userObj =await authenticate(ctx);
    try {
    const poolT = await pool;
    const Disconnect_User = `Update dbo.meeting__participant_audit SET status=  ${constants.end_status} where meeting_id=@meeting_id and user_id=@user_id`
    const res = await poolT
    .request()
    .input("meeting_id", sql.Int, meeting_id)
    .input("user_id",sql.Int,user_id)
    .query(Disconnect_User)

    return {stat: "User Disconnected Successfully"}
    } catch (err) {
        throw new Error(err);
    }

    // Update dbo.meeting SET status=${constants.end_status} where meeting_id=@meeting_id;
}
module.exports = {
    Disconnect

}