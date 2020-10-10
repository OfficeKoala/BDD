const {
    pool
} = require("../../../utils");
const sql = require("mssql");
const {
    authenticate
} = require("../../../utils")

const get_room_by_meeting_id_api = async (_, {
    meeting_id
}, ctx) => {
    try {
        const poolT = await pool;
        const get_meeting_by_id_query = "Select twilio_cred from dbo.meeting where meeting_id=@meeting_id "
        const res = await poolT
        .request()
        .input("meeting_id", sql.Int, meeting_id)
        .query(get_meeting_by_id_query)
        return {
            room_unique_name: res.recordset[0].twilio_cred
        }
    } catch (err) {
        throw new Error(err)
    }

}

module.exports = {
    get_room_by_meeting_id_api
}