const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const { constant_file } = require("../../../utils");
const { server_ip } = require("../../../config/index");
const ip = require("ip");
const sqlqueries = require("../../Sql_queries/Mutation_queries");

var moment = require("moment");
// const { sendEmail } = require("./Updated_Mail");
const { SendEmail } = require("../Signup_Mail");
const Schedule_Meeting_Api = async (
  _,
  { meeting_id, start_date, start_time, end_date, end_time, duration },
  ctx
) => {
  const userObj = await authenticate(ctx);
  // const userObj = { user_id: 120, company_id: 4 };
  try {
    var mstart_date = moment(start_date);
    var mstart = moment({ ...mstart_date });
    var End_Date_Format = mstart_date.add(30, "minutes");

    const poolT = await pool;
    const Schedule_meeting_Update = `Update dbo.meeting SET start_date=@start_date,end_date=@end_date, duration=@duration,status=${constants.schedule_status} where meeting_id=@meeting_id;Update dbo.meeting__participant_audit SET status =${constants.schedule_status} where meeting_id=@meeting_id;`;
    const ras = await poolT
      .request()
      .input("start_date", sql.VarChar, mstart.format("lll"))
      .input("end_date", sql.VarChar, End_Date_Format.format("lll"))
      .input("duration", sql.Int, duration)
      .input("meeting_id", sql.Int, meeting_id)
      .query(Schedule_meeting_Update);

    const ras1 = await poolT
      .request()
      .input("meeting_id", sql.Int, meeting_id)
      .query(sqlqueries.schedule_meeting_query.charity_query);

    if (ras1.recordset.length > 0) {
      const charity_amount = ras1.recordset[0].dm_charity_amount;

      await poolT
        .request()
        .input("meeting_id", sql.Int, meeting_id)
        .input("charity_amount", sql.Float, charity_amount)
        .query(sqlqueries.schedule_meeting_query.update_meeting_table);
    }

    const participant_res = await poolT
      .request()
      .input("meeting_id", sql.Int, meeting_id)
      .query(sqlqueries.schedule_meeting_query.participant_query);

    if (participant_res != undefined) {
      try {
        const pin = Math.floor(Math.random() * 100000000);
        const query = `Update dbo.meeting__participant_audit SET status= ${constants.schedule_status},access_url=@url, pin=@pin where meeting_id=@meeting_id and user_id=@user_id`;
        await Promise.all(
          participant_res.recordset.map(async item => {
            const res = await poolT
              .request()
              .input("meeting_id", sql.Int, meeting_id)
              .input("user_id", sql.Int, item.user_id)
              .input(
                "url",
                sql.VarChar,
                "https://" +
                  "www.goUpendo.com" +"/#"+
                  "/gotomeetingdm?meetingId=" +
                  meeting_id +
                  "&dmid=" +
                  item.user_id +
                  "&backLink=%2Fadmin%2Fmeeting"
              )
              .input("pin", sql.Int, pin)
              .query(query);
          })
        );
        const ras = await poolT
          .request()
          .input("meeting_id", sql.Int, meeting_id)
          .query(
            sqlqueries.schedule_meeting_query.get_detail_of_decision_maker
          );

        if (ras.recordset.length > 0) {
          const user_name =
            ras.recordset[0].first_name != null
              ? ras.recordset[0].first_name
              : "" + " " + (ras.recordset[0].last_name != null)
              ? ras.recordset[0].last_name
              : "";
          
              const  start_timer=
              ras.recordset[0].start_date != null
                  ? moment(ras.recordset[0].start_date.toUTCString()).format("lll")
                  : 0;
                  const end_timer=
                  ras.recordset[0].end_date != null
                    ? moment(ras.recordset[0].end_date.toUTCString()).format("lll")
                    : 0;
    
          SendEmail(
            ras.recordset[0].email_address,
            "aparna@qsstechnologies.com",
            "goupendo@mail.com",
            user_name,
            start_timer,
            end_timer,
            ras.recordset[0].access_url,
            ras.recordset[0].pin
          );
        }
      } catch (err) {
        throw new Error(err);
      }
    }
    return {
      stat: "Meeting Scheduled Successfully"
    };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Schedule_Meeting_Api
};
