const sql = require("mssql");
const {
    pool
} = require("../../../utils");
const {
    authenticate
} = require("../../../utils");

const accountSid = 'ACc82a5cdbca317629643f953e64d5d0cc';
const authToken = 'cc155b7926f1d273e056aed2d8163';
const client = require('twilio')(accountSid, authToken)

const check_and_create_room_api = async (_, {meeting_id}, ctx) => {
try {
    const poolT = await pool;
    const twilio_cred_query = "SELECT twilio_cred from dbo.meeting where meeting_id= @meeting_id"
    const res = await poolT
    .request()
    .input("meeting_id", sql.Int, meeting_id)
    .query(twilio_cred_query)
     if (res.recordset[0].twilio_cred === null) {
         var room_name = 'Group_' + parseInt((new Date().getTime() / 1000).toFixed(0));
         return client.video.rooms
        .create({
        recordParticipantsOnConnect: true,
        statusCallback: 'http://example.org',
        type: 'group',
       uniqueName: `${room_name}`
    })
            // .then(room=> {console.log("**********^^^^",room)})
    .then(room=> ({room_detail:room.uniqueName}))
        //  .then(room=>{return{room_detail:room.uniqueName}})
        
        }
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    check_and_create_room_api
}
