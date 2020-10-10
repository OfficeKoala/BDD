const { pool } = require("../../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../../utils");
const { server_ip } = require("../../../../config/index");
var moment = require("moment");
const Meeting_Filter_Api = async (
  _,
  { pageno, pagesize, status, startdate, enddate },
  ctx
) => {
  const poolT = await pool;
  const userObj = await authenticate(ctx);
  // const userObj={user_id:2,company_id:4}
  try {
    if (
      status === "1" ||
      status === "2" ||
      status === "5,9" ||
      status === "3" ||
      status === "7" ||
      status === "8"
    ) {

      let filter_start_date =
        startdate !== undefined && startdate != ""
          ? "   m.start_date >= '" + startdate + "' and "
          : " ";
      let filter_end_date =
        enddate !== undefined && enddate != ""
          ? (filter_start_date !== undefined && filter_start_date !== " "
              ? "   m.end_date <= '" + enddate
              : "  m.end_date <= '" + enddate) + "' and "
          : " ";

          const get_meetings =
          "select comp.company_name,comp.company_website,m.user_id,dmu.user_id as dm_id,m.requested_on,m.start_date,m.start_time,m.end_date,m.meeting_id,m.end_time,m.duration,m.twilio_cred,m.remarks ,concat(s.first_name,' ', s.last_name) as name,m.status,dmu.dm_description,dmu.dm_charity_amount, s.image_url ,dmu.dm_hours_per_month from dbo.meeting m left join meeting__participant_audit mpa on m.meeting_id =mpa.meeting_id and m.user_id !=mpa.user_id left join dbo.security_user s on s.user_id=mpa.user_id  and s.is_decision_maker=1 left join dbo.decision_maker_user dmu on dmu.user_id=s.user_id left join dbo.company comp on comp.company_id=s.company_id where " + filter_start_date +
          filter_end_date +" m.user_id=@user_id and m.status in("+ status +")ORDER BY m.requested_on desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY";
      
      const response = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("page_size", sql.Int, pagesize)
        .input("page_no", sql.Int, pageno) 
        .query(get_meetings);

      const my_all_meetings = await Promise.all(
        response.recordset.map(async item => {
         
          return {
            user_id: item.user_id,
            dm_id: item.dm_id,
            requested_on: item.requested_on !== null ? item.requested_on : 0,
           

            start_date:
              item.start_date != null
                ? moment(item.start_date.toUTCString()).format("lll")
                : 0,

            end_date:
              item.end_date != null
                ? moment(item.end_date.toUTCString()).format("lll")
                : 0,

            meeting_id: item.meeting_id, //for local
            status: item.status,
            duration: item.duration,
            twilio_cred: item.twilio_cred,
            remarks: item.remarks,
            name: item.name,
            status: item.status,
            dm_description: item.dm_description,
            dm_charity_amount: item.dm_charity_amount,
            dm_hours_per_month: item.dm_hours_per_month,
            company: item.company_name,
            company_website: item.company_website,
            image_url:
              item.image_url != null
                ? "https://" +
                  server_ip +
                  "/profilepic?im_path=" +
                  item.image_url
                : ""
          };
        })
      );
      const get_no_of_meetings =
        "select count(m.user_id) as no_of_meets  from dbo.meeting m left join meeting__participant_audit mpa on m.meeting_id =mpa.meeting_id and m.user_id !=mpa.user_id left join dbo.security_user s on s.user_id=mpa.user_id  and s.is_decision_maker=1 left join dbo.decision_maker_user dmu on dmu.user_id=s.user_id left join dbo.company comp on comp.company_id=s.company_id where " +
        filter_start_date +
        filter_end_date +
        " m.user_id=@user_id and  m.status in("+status+")";

      const response_count = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
  
        .query(get_no_of_meetings);

      return {
        meetings_all: my_all_meetings,
      
        no_of_meets: response_count.recordset[0].no_of_meets
      };
    } else {
  
      let filter_start_date =
        startdate !== undefined && startdate != ""
          ? "   m.start_date >= '" + startdate + "' and "
          : " ";
      let filter_end_date =
        enddate !== undefined && enddate != ""
          ? (filter_start_date !== undefined && filter_start_date !== " "
              ? "   m.end_date <= '" + enddate
              : "  m.end_date <= '" + enddate) + "' and "
          : " ";

      var sorting =
        " order by (case  when m.status=3 then 1 when m.status=2 then 2 when m.status=7 then 3 when m.status=1 then 4 when m.status=5 then 5  else 6 end ) , requested_on desc ";

      const get_my_meetings =
        "select comp.company_name,comp.company_website,m.user_id,dmu.user_id as dm_id,m.requested_on,m.start_date,m.start_time,m.end_date,m.meeting_id,m.end_time,m.duration,m.twilio_cred,m.remarks ,concat(s.first_name,' ', s.last_name) as name,m.status,dmu.dm_description,dmu.dm_charity_amount, s.image_url ,dmu.dm_hours_per_month from dbo.meeting m left join meeting__participant_audit mpa on m.meeting_id =mpa.meeting_id and m.user_id !=mpa.user_id left join dbo.security_user s on s.user_id=mpa.user_id  and s.is_decision_maker=1 left join dbo.decision_maker_user dmu on dmu.user_id=s.user_id left join dbo.company comp on comp.company_id=s.company_id where " +
        filter_start_date +
        filter_end_date +
        "   m.user_id=@user_id  " +
        sorting +
        " OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY";

      const response = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("page_size", sql.Int, pagesize)
        .input("page_no", sql.Int, pageno)
        .query(get_my_meetings);
    
      var count = response.recordset.length;
     
      const get_no_of_meetings =
        "select count(m.user_id) as no_of_meets  from dbo.meeting m left join meeting__participant_audit mpa on m.meeting_id =mpa.meeting_id and m.user_id !=mpa.user_id left join dbo.security_user s on s.user_id=mpa.user_id  and s.is_decision_maker=1 left join dbo.decision_maker_user dmu on dmu.user_id=s.user_id left join dbo.company comp on comp.company_id=s.company_id where " +
        filter_start_date +
        filter_end_date +
        " m.user_id=@user_id  ";

      const response_count = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .query(get_no_of_meetings);

      const my_all_meetings = await Promise.all(
        response.recordset.map(async item => {
         
          return {
            user_id: item.user_id,
            dm_id: item.dm_id,
            requested_on: item.requested_on !== null ? item.requested_on : 0,

            meeting_id: item.meeting_id,
            status: item.status,

          
       
            start_date:
              item.start_date != null
                ? moment(item.start_date.toUTCString()).format("lll")
                : 0,

            end_date:
              item.end_date != null
                ? moment(item.end_date.toUTCString()).format("lll")
                : 0,
            //  start_date:item.start_date!=null ? item.start_date.toUTCString():0,       //for server
            //  end_date:item.end_date!=null?item.end_date.toUTCString():0,
            // start_date:item.start_date!=null? moment(moment(item.start_date.toUTCString()).subtract(11,"hours")).format('lll'):0,       //this is for what you enter you will get
            // end_date:item.end_date!=null?moment(moment(item.end_date.toUTCString()).subtract(11,"hours")).format('lll'):0,
            duration: item.duration,
            twilio_cred: item.twilio_cred,
            remarks: item.remarks,
            name: item.name,
            status: item.status,
            dm_description: item.dm_description,
            dm_charity_amount: item.dm_charity_amount,
            dm_hours_per_month: item.dm_hours_per_month,
            company: item.company_name,
            company_website: item.company_website,
            image_url:
              item.image_url != null
                ? "https://" +
                  server_ip +
                  "/profilepic?im_path=" +
                  item.image_url
                : ""
          };
        })
      );

      return {
        meetings_all: my_all_meetings,
     
        no_of_meets: response_count.recordset[0].no_of_meets
      };
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Meeting_Filter_Api
};
