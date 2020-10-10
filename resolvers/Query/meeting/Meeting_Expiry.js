const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const errors = require("../../Error_and_constants/Errors");

const Meeting_Expiry_Api = async (_, { meeting_id }, ctx) => {
  try {
    const poolT = await pool;

    if (meeting_id > 0) {
      const end_status_of_meeting =
        "Select count(status) as count from dbo.meeting__participant_audit where meeting_id=@meeting_id and status=5";
      const response = await poolT
        .request()
        .input("meeting_id", sql.Int, meeting_id)
        .query(end_status_of_meeting);

      var check1 = response.recordset[0].count;
      if (check1 > 0) {
        throw new Error(errors.meeting_expiry.meeting_ended);
      }
      const end_time_checker =
        "select end_time,end_date from dbo.meeting where meeting_id=@meeting_id";
      const reso = await poolT
        .request()
        .input("meeting_id", sql.Int, meeting_id)
        .query(end_time_checker);
      var endDateTime = new Date(
        reso.recordset[0].end_date.toDateString() +
          " " +
          reso.recordset[0].end_time.toTimeString()
      ).toISOString();
      var currentDateTime = new Date().toISOString();

      if (endDateTime < currentDateTime) {
        throw new Error(errors.meeting_expiry.meeting_time_expire);
      } else {
        return { stat: "" };
      }
    } else {
      throw new Error(errors.meeting_expiry.invalid_meeting_id);
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Meeting_Expiry_Api
};
