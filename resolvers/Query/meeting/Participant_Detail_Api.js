const {
    pool
} = require("../../../utils");
const sql = require("mssql");
const {
    authenticate
} = require("../../../utils");

const participant_detail = async (_, {
    meeting_id
}, ctx) => {
    try {
   
       
        const poolT = await pool;
        const meeting_id_query = "Select ma.meeting_id ,s.user_name, s.first_name, s.last_name,ma.user_id,ma.status from dbo.meeting__participant_audit ma join dbo.security_user s on ma.user_id= s.user_id where meeting_id= @meeting_id"
        const res = await poolT
            .request()
            .input("meeting_id", sql.Int, meeting_id)
            .query(meeting_id_query)
        const result = res.recordset;
        // console.log("**********", result)
        const resultant_data = await Promise.all(
            result.map(async item => {


                const check_ifDM = "select is_decision_maker from dbo.security_user where user_id=@user_id"
        const response = await poolT
            .request()
            .input("user_id", sql.Int, item.user_id)
            .query(check_ifDM)
        const ans = (response.recordset[0].is_decision_maker)?1:0;
   


                return {
                    meeting_id: item.meeting_id,
                    user_id: item.user_id,
                    participant_status: item.status,
                    user_name: item.user_name,
                    first_name: item.first_name,
                    last_name: item.last_name,
                    dm_id:ans
                    // dm_id:(item.user_id===userObj.user_id)?0:1
                    
                }


            }))
       
        return {
            result: resultant_data
        }
    } catch (err) {
        throw new Error(err);
    }

}

module.exports = {
    participant_detail
}