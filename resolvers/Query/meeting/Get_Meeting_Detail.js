const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
var moment = require("moment");
const get_meeting_list_by_Id = async (_, { meeting_id, dmId }, ctx) => {
  try {
    const poolT = await pool;
    var result = [];
    if (dmId === undefined) {
      const get_meeting_detail =
        "SELECT vp.product_description,vp.product_name,m.twilio_cred,m.meeting_id,m.status,m.product_id,m.start_date,m.end_date,m.start_time,m.end_time,m.duration,m.charity_amount from dbo.meeting m left join dbo.security_user s  on m.user_id= s.user_id left join dbo.vendor_product vp on vp.product_id=m.product_id where m.meeting_id = @meeting_id ORDER by  m.meeting_id";
      const res = await poolT
        .request()
        .input("meeting_id", sql.Int, meeting_id)
        .query(get_meeting_detail);

      result = res.recordset;
    } else {
      const get_meeting_detail =
        "SELECT vp.product_description,vp.product_name,m.twilio_cred,m.meeting_id,m.product_id,m.start_date,m.status,m.end_date,m.start_time,m.end_time,m.duration,m.charity_amount from dbo.meeting m left join dbo.security_user s  on m.user_id= s.user_id left join meeting__participant_audit mpa on m.meeting_id=mpa.meeting_id left join dbo.vendor_product vp on vp.product_id=m.product_id where m.meeting_id = @meeting_id and mpa.user_id=@dmId ORDER by  m.meeting_id ";
      const res = await poolT
        .request()
        .input("meeting_id", sql.Int, meeting_id)
        .input("dmId", sql.Int, dmId)
        .query(get_meeting_detail);

      // console.log("------------------->>>>>>>>>",result)

      result = res.recordset;
    }

    const get_product_tags =
      "select product_tag from dbo.product_tags_audit where product_id=@product_id";
    const product_tags_result = await poolT
      .request()
      .input("product_id", sql.Int, result[0].product_id)

      .query(get_product_tags);

    const resultant = await Promise.all(
      result.map(async item => {
        // console.log("+++++++++++++++++",item)
        return {
          // start_date:
          //   item.start_date !== null
          //     ? moment(moment(new Date(item.start_date).toString()).subtract(5.50,"hours")).format("lll")
          //     : 0,
          // end_date:
          //   item.end_date != null
          //     ? moment(moment(new Date(item.end_date).toString()).subtract(5.50,"hours")).format("lll")
          //     : 0,

        
          // start_date:
          // item.start_date !== null
          //   ? moment(moment(new Date(item.start_date).toString()).subtract(11,"hours")).format('lll')
          //   : 0,
          //   end_date:
          //   item.end_date !== null
          //   ? moment(moment(new Date(item.end_date).toString()).subtract(11,"hours")).format('lll')
          //   : 0,
          start_date:
            item.start_date != null
              ? moment(item.start_date.toUTCString()).format("lll")
              : 0,

          end_date:
            item.end_date != null
              ? moment(item.end_date.toUTCString()).format("lll")
              : 0,
          // start_date:item.start_date!=null ? item.start_date.toUTCString():0,       //for server
          // end_date:item.end_date!=null?item.end_date.toUTCString():0,
          // start_date:item.start_date!=null? moment(moment(item.start_date.toUTCString()).subtract(11,"hours")).format('lll'):0,       //this is for what you enter you will get
          // end_date:item.end_date!=null?moment(moment(item.end_date.toUTCString()).subtract(11,"hours")).format('lll'):0,   //for local
          duration: item.duration,
          charity_amount: item.charity_amount,
          meeting_id: item.meeting_id,
          room: item.twilio_cred,
          product_id: item.product_id,
          product_name: item.product_name,
          status: item.status,
          product_description: item.product_description,
          product_tags: product_tags_result.recordset
        };
      })
    );

    return {
      result: resultant
    };
  } catch (err) {
    throw new Error(err);
  }
};
module.exports = {
  get_meeting_list_by_Id
};
