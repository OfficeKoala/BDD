const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const Delete_product = async (_, { product_id }, ctx) => {
  try{
  const userObj = await authenticate(ctx);
  const del_query =
    "UPDATE dbo.vendor_product SET isActive =0  WHERE product_id=@product_id;";

  let poolT = await pool;
  await poolT
    .request()
    .input("product_id", sql.Int, product_id)
    .query(del_query);

  return { stat: "Product Successfully isNotActive" };
  }
  catch(err)
  {
    throw new Error(err)
  }
};

module.exports = {
  Delete_product
};
