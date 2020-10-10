const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const sqlqueries=require("../../Sql_queries/Mutation_queries")


fav_unfav_dm= async (_, { flag, dm_id }, ctx) => {
    let poolT = await pool;
  const userObj =  await authenticate(ctx);

  try {
    if (flag === 1) {
     try{     

      await poolT
        .request()
        .input("dm_user_id", sql.Int, dm_id)
        .input("user_id", sql.Int, userObj.user_id)
        .query(sqlqueries.fav_unfav_dms.insert_in_vendor_fav_table);

        return {
            stat: "Decision Maker Marked Favourite"
          };
        }
     catch(err)
     {
         throw new Error(err)
     }
        
    }

    if (flag === 0) {    
            await poolT
        .request()
        .input("dm_user_id", sql.Int, dm_id)
        .input("user_id", sql.Int, userObj.user_id)
        .query(sqlqueries.fav_unfav_dms.unfavourite_dm);
      return {
        stat: "Decision Maker Marked Unfavourite"
      };
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  fav_unfav_dm
};
