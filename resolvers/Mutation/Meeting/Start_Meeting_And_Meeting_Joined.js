const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const { constant_file } = require("../../../utils");
const Start_Meeting_And_Meeting_Joined = async (
  _,
  { flag, meeting_id },
  ctx
) => {
  try {
    const poolT = await pool;

    if (meeting_id > 0) {
      const end_status_of_meeting =
        "Select count(status) as count from dbo.meeting where meeting_id=@meeting_id and status=5";
      const response = await poolT
        .request()
        .input("meeting_id", sql.Int, meeting_id)
        .query(end_status_of_meeting);

      var check1 = response.recordset[0].count;
      if (check1 > 0) {
        throw new Error("Meeting Already Ended");
      }
      const end_time_checker =
        "select end_date from dbo.meeting where meeting_id=@meeting_id";

      const reso = await poolT
        .request()
        .input("meeting_id", sql.Int, meeting_id)
        .query(end_time_checker);

      var endDateTime = reso.recordset[0].end_date.toISOString();

var date = new Date();

date=new Date(date.setHours(date.getHours()-1)).toISOString()
 // console.log("meeting_id", meeting_id)
      // console.log("end_time", endDateTime);
      // console.log("currentDateTim", currentDateTime);

      if (endDateTime < date) {
        throw new Error("Meeting Time Expire");
      } else {
        if (flag === 1) {
          const start_query = `Update dbo.meeting SET  status = ${constants.start_status} where meeting_id=@meeting_id;Update dbo.meeting__participant_audit SET status= ${constants.start_status} where meeting_id=@meeting_id`; // and user_id=@user_id`
          const res = await poolT
            .request()
            .input("meeting_id", sql.Int, meeting_id)
            // .input("user_id", sql.Int, userObj.user_id)
            .query(start_query);
          if (res.rowsAffected[0] <= 0) {
            throw new Error(err);
          }
        }

        if (flag === 0) {
          const start_query = `Update dbo.meeting__participant_audit SET status= ${constants.start_status} where meeting_id=@meeting_id`; // and user_id=@user_id`
          const res = await poolT
            .request()
            .input("meeting_id", sql.Int, meeting_id)
            // .input("user_id", sql.Int, userObj.user_id)
            .query(start_query);
          if (res.rowsAffected[0] <= 0) {
            throw new Error(" Please Try Again ");
          }
        }
      }
      return {
        stat: "Meeting Started"
      };
    } else {
      throw new Error("Meeting_id Undefined");
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Start_Meeting_And_Meeting_Joined
};
