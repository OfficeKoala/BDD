const { pool } = require("../../../utils");
// const { uploads } = require("../Mutation/File_Upload/uploadfile");
const sql=require("mssql")
//All Normal UI Fetch API's
//For DropDowns During Signup*******DECISION MAKER****
const fetch_keywords = async _ => {
  const get_all_keywords = "SELECT keywords_id as value,keywords_name as level from dbo.keywords";
  const poolTub = await pool;
  const results = await poolTub.request().query(get_all_keywords);

  return results.recordset;
};

//fetch_keywords End

const fetch_charities = async _ => {
  const get_all_charity_names = "SELECT * from dbo.charities ";
  const poolTub = await pool;
  const results = await poolTub.request().query(get_all_charity_names);

  return results.recordset;
};

//fetch_charities End
//fetch_charities END

module.exports = {
  fetch_keywords,
  fetch_charities
};
