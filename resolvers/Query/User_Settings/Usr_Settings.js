const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const { server_ip } = require("./../../../config/index");
var moment = require("moment");
const ip = require("ip");
const fetch_UserSettings = async (_, {}, ctx) => {
  const userObj = await authenticate(ctx); 
  // const userObj= {user_id:2,company_id:2}
  try {
    const query =
      "SELECT payment_status,payment_amount,date_of_subscription,first_name,last_name,email_address,user_name,contact_no,company_id,image_url from dbo.security_user s left join dbo.subscription sb on s.user_id=sb.user_id and sb.payment_status=1 where s.user_id=@user_id ";
    let poolT = await pool;
    const res = await poolT
      .request()
      .input("user_id", sql.Int, userObj.user_id)
      .query(query);

    const cmp_id = res.recordset[0].company_id;

    const query_for_company =
      "SELECT c.country_name, c.country_id,company_name,location_name,company_website,company_address,company_zip, Company_State,company_size_id, company_city, Company_Country  from dbo.company left join dbo.countries c on c.country_id= Company_Country left join  location_us_states on location_id=Company_State where company_id=@company_id ";

    const result = await poolT
      .request()
      .input("company_id", sql.Int, cmp_id)
      .query(query_for_company);
      // console.log("%%%", result.recordset[0].Company_State)
    const query_for_industry =
      "SELECT ia.industry_id as value,i.industry as level from dbo.user_industry_audit ia join dbo.industries i on ia.industry_id = i.industry_id where ia.user_id=@user_id";

    const result_industry = await poolT
      .request()
      .input("user_id", sql.Int, userObj.user_id)
      .query(query_for_industry);

    const industries = await result_industry.recordset;
    //******************************* */

    const query_for_management_level =
      "SELECT ia.management_level_id,i.rank_name from dbo.user_management_level_audit ia join dbo.management_level i on ia.management_level_id = i.rank_id where ia.user_id=@user_id;";
    const result_management = await poolT
      .request()
      .input("user_id", sql.Int, userObj.user_id)
      .query(query_for_management_level);
    


    ///*******************************************/
    if (result.recordset.length > 0) {
      return {
        first_name: res.recordset[0].first_name,
        last_name: res.recordset[0].last_name,
        user_name: res.recordset[0].user_name,
        email_address: res.recordset[0].email_address,
        contact_no: res.recordset[0].contact_no,
        company_name: result.recordset[0].company_name,
        company_website: result.recordset[0].company_website,
        company_address: result.recordset[0].company_address,
        company_zip: result.recordset[0].company_zip,
        state_id: result.recordset[0].Company_State,
        state:result.recordset[0].location_name,
        company_city:result.recordset[0]. company_city, 
        country_name:result.recordset[0].country_name,
        country_id:result.recordset[0].country_id,
        industries: industries,
        management_level: result_management.recordset,
        company_id: cmp_id,
        company_size_id: result.recordset[0].company_size_id,
        date_of_subscription:res.recordset[0].date_of_subscription?moment(res.recordset[0].date_of_subscription.toUTCString()).format('lll'):null,
payment_amount:res.recordset[0].payment_amount?res.recordset[0].payment_amount:null,
renewal_date:res.recordset[0].date_of_subscription?moment(res.recordset[0].date_of_subscription.toUTCString()).add(1, 'M').format('lll'):null,
payment_status:res.recordset[0].payment_status?res.recordset[0].payment_status.toJSON().data[0]:0,
        image_url:
          res.recordset[0].image_url != null
            ? "https://" +
              server_ip +
              "/profilepic?im_path=" +
              res.recordset[0].image_url
            : ""
      };
    } else {
      return {
        first_name: res.recordset[0].first_name,
        last_name: res.recordset[0].last_name,
        user_name: res.recordset[0].user_name,
        email_address: res.recordset[0].email_address,
        contact_no: res.recordset[0].contact_no,
        company_name: null,
        company_website: null,
        company_address: null,
        company_zip: null,
        state_id: null,
        industries: null,
        management_level: null,
        company_id: null,
        state:null,
        country_name:null,
        company_size_id: null,
        image_url:
          res.recordset[0].image_url != null
            ? "https://" +
              server_ip+
              "/profilepic?im_path=" +
              res.recordset[0].image_url
            : ""
      };
    }
  } catch (Err) {
    throw new Error(Err);
  }
};

module.exports = {
  fetch_UserSettings
};
