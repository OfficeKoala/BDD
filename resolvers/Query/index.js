// const Fetch_Product = require("./ProductQueries/Fetch_Product");
// const Signup_checks = require("../Query/Fast_check_queries/signup_checks");
// const {
//   fetch_keywords,
//   fetch_charities
// } = require("./Signup_UI_DM_Queries/index");
// const {
//   get_all_my_meetings_list
// } = require("./meeting/get_all_my_meetings_list");
// const {
//   get_all_decision_makers
// } = require("./DashBoard/get_all_decision_makers");

// const {
//   product_charity_and_pending_meeting_details
// } = require("./ProductQueries/product_charity_and_pending_meeting_details");

// const { get_dm_by_Id } = require("./DM/get_dm_by_id");
// const { fetch_UserSettings } = require("./User_Settings/Usr_Settings");

// const { filter_lookup } = require("./DashBoard/Filter_Lookups/filter_lookup");

// const { get_decision_maker_by_Id } = require("./DM/get_decision_maker_by_Id");
// const {
//   fetch_tags,
//   fetch_tags_using_product_id
// } = require("./ProductQueries/FetchTags");
// const {
//   fetch_document_type
// } = require("./ProductQueries/Product_Document_Related_Queries/Fetch_Doc_type");
// const { pool } = require("../../utils");
// const { fetch_messages } = require("./InBox/Message_List_Revised");
// const { fetch_message_By_Id } = require("./InBox/Message_By_Id");
// const {
//   Inbox_Unread_Draft_Messages
// } = require("./InBox/Inbox_Unread_Draft_Messages");
// const { Inbox_Unread_Messages } = require("./InBox/Inbox_Unread_Message");
// const { fetch_messages_by_tag } = require("./InBox/Message_List_tags");
// // const { uploads } = require("../Mutation/File_Upload/uploadfile");
// const {
//   Access_For_DM_In_Meeting
// } = require("./meeting/Access_For_DM_In_Meeting");
// const { Total_Charity_From_App } = require("./meeting/Charity_Amount");

// //All Normal UI Fetch API's
// //DropDown During Signup***********
// const { fetch_messages_by_tags } = require("./InBox/Message_Tag_List");
// const { get_meeting_list_by_Id } = require("./meeting/Get_Meeting_Detail");
// const {
//   Meeting_Filter_LookUp
// } = require("./meeting/Meeting_Filter/MeetingLookUp");
// const {
//   Meeting_Filter_Api
// } = require("./meeting/Meeting_Filter/Meeting_Filter");

// const {
//   product_charity_and_pending_meeting_data
// } = require("./ProductQueries/Product_Data_With_Detail");
// const { participant_detail } = require("./meeting/Participant_Detail_Api");
// const { Pending_Meeting_Detail } = require("./meeting/Pending_Meeting");
// const sql = require("mssql");

// const fetch_company_size = async _ => {
//   const get_company_size_range = "SELECT * from dbo.number_of_employees ";
//   const poolTub = await pool;
//   const results = await poolTub.request().query(get_company_size_range);

//   return results.recordset;
// };

// const fetch_country_state = async (_, { flag, country_id }) => {
//   if (flag === 1) {
//     //For Country_lookup
//     const get_all_countries = "SELECT * from dbo.countries ";
//     const poolTub = await pool;
//     const results = await poolTub.request().query(get_all_countries);

//     return results.recordset;
//   } else {
//     const get_all_states =
//       "SELECT location_name as state,location_id state_id from dbo.location_us_states where country_id=@country_id";
//     const poolTub = await pool;
//     const results = await poolTub
//       .request()
//       .input("country_id", sql.Int, country_id)
//       .query(get_all_states);

//     return results.recordset;
//   }
// };

// const { check_and_create_room_api } = require("./Twilio/Check_And_Create_Room");
// const fetch_management_level_data = async _ => {
//   const get_managementlevel_data = "SELECT * from dbo.management_level ";
//   const poolTub = await pool;
//   const results = await poolTub.request().query(get_managementlevel_data);

//   return results.recordset;
// };

// const fetch_Message_tags = async _ => {
//   const get_message_tag_data = "SELECT * from dbo.message_tag";
//   const poolTub = await pool;
//   const results = await poolTub.request().query(get_message_tag_data);
//   return results.recordset;
// };

// const peek_value_lookup = async _ => {
//   const get_peek =
//     "SELECT max(dm_charity_amount) as max_donation ,max(dm_hours_per_month)*60  max_availability from dbo.decision_maker_user";
//   const poolTub = await pool;
//   const results = await poolTub.request().query(get_peek);
//   return results.recordset[0];
// };

// const fetch_charity_details_using_dmID = async (_, { dm_id }) => {
//   const get_charity_details =
//     "select c.org_id ,c.org_name as charity_name,dmu.dm_charity_amount  from dbo.charity_audit ca left join dbo.charities c on c.org_id=ca.org_id left join dbo.decision_maker_user dmu on dmu.user_id=ca.dm_user_id where dmu.user_id=@user_id";
//   const poolTub = await pool;
//   const results = await poolTub
//     .request()
//     .input("user_id", sql.Int, dm_id)
//     .query(get_charity_details);

//   return results.recordset;
// };

// const {
//   get_room_by_meeting_id_api
// } = require("./Twilio/Get_Room_by_meeting_id");

// const fetch_industries = async _ => {
//   return fetch_industries_recursive_support();
// };

// const fetch_industries_recursive_support = async parentId => {
//   const get_industries =
//     "WITH MyTest as(   SELECT P.industry_id as value,P.industry as name, P.parentId,P.industry_description,   CAST(P.industry AS VarChar(Max)) as level FROM dbo.industries P    WHERE P.parentId=0    UNION ALL    SELECT P1.industry_id as value, P1.industry as text,P1.parentId,P1.industry_description,  M.level  + ' >> ' +  CAST(P1.industry AS VarChar(Max))    FROM dbo.industries P1     INNER JOIN MyTest M ON M.value = P1.parentId )   SELECT * From MyTest order by level";
//   // "WITH MyTest as(SELECT P.industry_id as value,P.industry as name, P.parentId,P.industry_description,CAST(P.industry_id AS VarChar(Max)) as level FROM dbo.industries P WHERE P.parentId=0 UNION ALL SELECT P1.industry_id as value, P1.industry as text,P1.parentId,P1.industry_description, CAST(P1.industry_id AS VarChar(Max)) + ',' + M.level FROM dbo.industries P1  INNER JOIN MyTest M ON M.value = P1.parentId )SELECT * From MyTest";

//   const poolTub = await pool;
//   const results = await poolTub.request().query(get_industries);
//   const data = results.recordset;
//   // const abs_data = data.filter(item => {
//   //   if (item.parentId === 0)
//   //   {
//   //     return item;
//   //   }

//   // });

//   // transform_lookup_data(data, abs_data);

//   // return abs_data;
//   return data;
// };

// //COMMON TRANSFORM DATA FUNCTION FOR JOB FUNCTION AND INDUSTRIES LOOKUP---***********************
// const transform_lookup_data = (data, abs_data, flag) => {
//   abs_data.map(item => {
//     const array = [];
//     data.map(element => {
//       if (
//         element.parentId === (flag === 1 ? item.job_function_id : item.value)
//       ) {
//         array.push(element);
//       }
//     });
//     item.checked = true;
//     item.children = array;
//     transform_lookup_data(data, item.children);
//   });
// };

// const fetch_jobs = async _ => {
//   try {
//     const get_all_jobs =
//       "WITH MyTest as( SELECT P.job_function_id,P.job_function as name, P.parentId,CAST(P.job_function AS VarChar(Max)) as level FROM dbo.job_function P  WHERE P.parentId=0  UNION ALL   SELECT P1.job_function_id, P1.job_function,P1.parentId,   M.level  + ' >> ' +  CAST(P1.job_function AS VarChar(Max)) FROM dbo.job_function P1    INNER JOIN MyTest M ON M.job_function_id = P1.parentId )SELECT * From MyTest order by level";

//     // " WITH MyTest as(SELECT P.job_function_id,P.job_function as name, P.parentId,CAST(P.job_function_id AS VarChar(Max)) as level FROM dbo.job_function P WHERE P.parentId=0 UNION ALL SELECT P1.job_function_id, P1.job_function,P1.parentId, CAST(P1.job_function_id AS VarChar(Max)) + ',' + M.level FROM dbo.job_function P1  INNER JOIN MyTest M ON M.job_function_id = P1.parentId )SELECT * From MyTest";
//     const poolTub = await pool;
//     const results = await poolTub.request().query(get_all_jobs);

//     const data = results.recordset;
//     return data;
//     // const absolute_data = data.filter(item => {
//     //   if (item.parentId === 0) return item;
//     // });

//     // // console.log("---------------->>>>>>>>>>>>>>",data);

//     // transform_lookup_data(data,absolute_data,1);

//     // return absolute_data;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// module.exports = {
//   ...Fetch_Product,
//   ...Signup_checks,
//   fetch_company_size,
//   fetch_management_level_data,
//   fetch_industries,
//   fetch_keywords,
//   fetch_charities,
//   fetch_jobs,
//   fetch_tags,
//   fetch_tags_using_product_id,
//   fetch_document_type,
//   fetch_UserSettings,
//   fetch_messages,
//   fetch_Message_tags,
//   fetch_messages_by_tag,
//   fetch_messages_by_tags,
//   fetch_message_By_Id,
//   Inbox_Unread_Messages,
//   fetch_country_state,
//   // get_all_decision_makers,
//   // filter_lookup,
//   Inbox_Unread_Draft_Messages,
//   get_meeting_list_by_Id,
//   participant_detail,
//   Pending_Meeting_Detail,
//   get_all_decision_makers,
//   filter_lookup,
//   Inbox_Unread_Draft_Messages,
//   get_all_my_meetings_list,
//   check_and_create_room_api,
//   get_room_by_meeting_id_api,
//   get_decision_maker_by_Id,
//   Total_Charity_From_App,
//   Access_For_DM_In_Meeting,
//   fetch_charity_details_using_dmID,
//   product_charity_and_pending_meeting_details,

//   Meeting_Filter_LookUp,
//   Meeting_Filter_Api,
//   product_charity_and_pending_meeting_data,
//   get_dm_by_Id,
//   peek_value_lookup
// };
const someQuery=async (_, args, ctx)=>{
return "Some Query"
}

const duplicacyCheckerLookup=require("../../utils/checkDuplicacy")

module.exports = {someQuery,duplicacyCheckerLookup};
