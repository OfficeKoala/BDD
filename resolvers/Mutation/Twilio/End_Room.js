const { pool } = require("../../../utils");
const sql = require("mssql");
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const client = require("twilio")(accountSid, authToken);
const { constant_file } = require("../../../utils");

const{mailNotification}=require("./mailNotification");
const {vendor_mail_body,vendor_mail_subject,dm_mail_body,dm_mail_subject}= require("../../Error_and_constants/Errors")

const End_Room_Api = async (_, { room_id, meeting_id }, ctx) => {
  try {
    const poolT = await pool;
    client.video
      .rooms(`${room_id}`)
      .update({ status: "completed" })
      .then();
    const End_Room = `Update dbo.meeting SET status=${
      constants.end_status
    } where meeting_id=@meeting_id;Update dbo.meeting__participant_audit SET status=  ${
      constants.end_status
    } where meeting_id=@meeting_id`;
    const res = await poolT
      .request()
      .input("meeting_id", sql.Int, meeting_id)
      .query(End_Room);
     const queryDmEmail= "Select email_address from dbo.security_user s  right join dbo.meeting__participant_audit m on s.user_id= m.user_id where meeting_id= @meeting_id and  is_decision_maker=1;Select email_address from dbo.security_user s  right join dbo.meeting__participant_audit m on s.user_id= m.user_id where meeting_id= @meeting_id"
     const response= await poolT
        .request()
        .input("meeting_id", sql.Int,meeting_id)
        .query(queryDmEmail)

mailNotification([response.recordsets[1][0].email_address,response.recordsets[1][1].email_address], "goupendo@mail.com",vendor_mail_subject,vendor_mail_body)
mailNotification(response.recordsets[0][0].email_address,"goupendo@mail.com",dm_mail_subject,dm_mail_body);

return {

      stat: "Room End Successfully."
    };
  } catch (err) {
    throw new Error(err);
  }
};
module.exports = {
  End_Room_Api
};
