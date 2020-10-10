const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

Favourite_UnFavourite_Product = async (_, { flag, product_id }, ctx) => {
  const userObj = await authenticate(ctx);

  try {
    if (flag === 1) {
      const query1 =
        "SELECT product_id from dbo.vendor_product WHERE product_id=@product_id";
      let pool1 = await pool;
      const res = await pool1
        .request()
        .input("product_id", sql.Int, product_id)
        .query(query1);
      if (res.recordset.length > 0) {
        const query2 =
          "INSERT INTO dbo.product_mark_favourite_audit(user_id,product_id) VALUES(@user_id,@product_id)";
        let poolT = await pool;
        await poolT
          .request()
          .input("product_id", sql.Int, product_id)
          .input("user_id", sql.Int, userObj.user_id)
          .query(query2);

        return {
          stat: "Product Marked Favourite"
        };
      }
    }

    if (flag === 0) {
      const query3 =
        "DELETE FROM dbo.product_mark_favourite_audit where product_id=@product_id";
      let pool2 = await pool;
      await pool2
        .request()
        .input("product_id", sql.Int, product_id)
        .query(query3);
      return {
        stat: "Product Marked unfavourite"
      };
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Favourite_UnFavourite_Product
};
