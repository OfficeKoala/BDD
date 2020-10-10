const {
  pool
} = require("../../../utils");
const sql = require("mssql");

const accountSid = 'ACc82a5cdbca317629643f953e64d5d0cc';
const authToken = 'cc155b7926f1d273e056aed2d8163195';
const client = require('twilio')(accountSid, authToken);
const Create_Room_Api = async (_, {},
  ctx) => {
  try {
    room_creation = 'Group_' + parseInt((new Date().getTime() / 1000).toFixed(0))

    return client.video.rooms
      .create({
        recordParticipantsOnConnect: true,
        type: 'group',
        uniqueName: `${room_creation}`

      })
      .then(room => ({ stat: room.sid}));
  
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  Create_Room_Api
}