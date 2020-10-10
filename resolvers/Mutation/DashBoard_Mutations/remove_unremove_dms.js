const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const sqlqueries=require("../../Sql_queries/Mutation_queries")

remove_unremove_dms = async (_, { flag, dm_id }, ctx) => {
  let poolT = await pool;
  const userObj =  await authenticate(ctx);

  try {
    if (flag === 1) {
      try {
    
        await poolT
          .request()
          .input("dm_user_id", sql.Int, dm_id)
          .input("user_id", sql.Int, userObj.user_id)
          .query(sqlqueries.remove_unremove_query.insert_in_vendor_user_remove_table);

        return {
          stat: "User Removed"
        };
      } catch (err) {
        throw new Error(err);
      }
    }

    if (flag === 0) {
      
      await poolT
        .request()
        .input("dm_user_id", sql.Int, dm_id)
        .input("user_id", sql.Int, userObj.user_id)
        .query(sqlqueries.remove_unremove_query.remove_dm_from_vendor_user);
      return {
        stat: "User Unremoved"
      };
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
    remove_unremove_dms
};
