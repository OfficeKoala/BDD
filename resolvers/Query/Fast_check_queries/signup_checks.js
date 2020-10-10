const { pool } = require("../../../utils");
const sql = require("mssql");
const allqueries = require("../login_signup_Queries");

//Checking if email is Already taken or not //User_name is taken or not
const check_email_user_name_ifexists = async (_, { email, user_name }) => {
  try {
    let error1 = undefined;
    let error2 = undefined;

    const poolT = await pool;
    const res = await poolT
      .request()
      .input("email", sql.VarChar, email)
      .query(allqueries.check_email_duplicacy);

    if (res.recordset.length > 0) {
      error2 = "Email Already In Use";

      return { Error: error2, ErrorCode: 1 };
    } else {
      const poolT1 = await pool;
      const result = await poolT1
        .request()
        .input("user_name", sql.VarChar, user_name)
        .query(allqueries.check_user_name_duplicacy);

      if (result.recordset.length > 0) {
        error1 = "Username Already In Use";

        return { Error: error1, ErrorCode: 1 };
      }
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  check_email_user_name_ifexists
};
