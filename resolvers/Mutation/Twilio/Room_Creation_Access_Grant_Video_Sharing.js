const { pool } = require("../../../utils");
const sql = require("mssql");
var AsyncLock = require("async-lock");
const twilioaccountSid = process.env.accountSid;
const twilioauthToken = process.env.authToken;
const apiKeySid = process.env.apiKeySid;
const apiKeySecret = process.env.apiKeySecret;
const AccessToken = require("twilio").jwt.AccessToken;
const errors =require("../../Error_and_constants/Errors")
// Create an access token which we will sign and return to the client,
// containing the grant we just created
const token = new AccessToken(twilioaccountSid, apiKeySid, apiKeySecret);
const client = require("twilio")(twilioaccountSid, twilioauthToken);

const Room_Creation_And_Access_Grant_And_Video_Sharing_Api = async (
  _,
  { room_name, identity, meeting_id },
  ctx
) => {
  try {
    const poolT = await pool;
    var lock = new AsyncLock();

    if (room_name === null || room_name === undefined) {
     
        var room_name =
          "Group_" + parseInt((new Date().getTime() / 1000).toFixed(0));
//  console.log("room_name", room_name)
        const Schedule_meeting_Update = `Update dbo.meeting SET twilio_cred=@cred where meeting_id=@meeting_id AND twilio_cred is null `;
        const ras = await poolT
          .request()
          .input("cred", sql.VarChar, room_name)
          .input("meeting_id", sql.Int, meeting_id)
          .query(Schedule_meeting_Update);
        if (ras.rowsAffected[0] == 1) {
          lock.acquire("key", async ()=>
          { 
          client.video.rooms
            .create({
              recordParticipantsOnConnect: true,
              statusCallback: "http://example.org",
              type: "group",
              uniqueName: `${room_name}`
            })
        
            .then(room_detail => {
             });
          })
            //VideoGrant

            const videoGrant = new AccessToken.VideoGrant({
                room: `${room_name}`
              });
              token.addGrant(videoGrant);
              token.identity = `${identity}`;
              
              return {
                room: room_name,
                token: token.toJwt()
              }
        } 
        
        
        else {
          const twilio_cred_query = `SELECT twilio_cred from dbo.meeting where meeting_id=${meeting_id}`;
          const res = await poolT
            .request()
            .input("meeting_id", sql.Int, meeting_id)
            .query(twilio_cred_query);

        const room_name= res.recordset[0].twilio_cred;
        
            const videoGrant = new AccessToken.VideoGrant({
              // and limits access to the specified Room (room_name)
              room: `${room_name}`
            });
            token.addGrant(videoGrant);
            token.identity = `${identity}`;
            return {
              room: room_name,
              token: token.toJwt()
            };
          } 
        
      
    
    } 
    
    
    
    
    
    
    else {
      const twilio_cred_query = `SELECT twilio_cred from dbo.meeting where meeting_id=${meeting_id}`;
      const res = await poolT
        .request()
        .input("meeting_id", sql.Int, meeting_id)
        .query(twilio_cred_query);

      const twilio_credential = res.recordset[0].twilio_cred;
      if (room_name === twilio_credential) {
        const videoGrant = new AccessToken.VideoGrant({
          // and limits access to the specified Room (room_name)
          room: `${room_name}`
        });
        token.addGrant(videoGrant);
        token.identity = `${identity}`;
        return {
          room: room_name,
          token: token.toJwt()
        };
      } else {
        throw Error(errors.room_creation_access.invalid_room);
      }
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Room_Creation_And_Access_Grant_And_Video_Sharing_Api
};