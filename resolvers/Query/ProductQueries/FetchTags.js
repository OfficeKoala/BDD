const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");


const fetch_tags_using_product_id = async (_, { product_id }, ctx) => {
  try {
    const userObj = await authenticate(ctx);
  
  
    const get_tags =
      "SELECT product_tag_id,product_tag FROM dbo.product_tags_audit WHERE product_id=@product_id";

    const poolT = await pool;
    const res = await poolT
      .request()
      .input("product_id", sql.Int, product_id)
      .query(get_tags);

    return res.recordset;
  } catch (err) {
    throw new Error(err);
  }
};

const fetch_tags = async _ => {
  try {

    const get_all_tags = "SELECT * FROM [dbo].[keywords] ";

    const poolT = await pool;
    const res = await poolT.request().query(get_all_tags);

   return res.recordset.map(item=>{

      return {
        product_tag_id:item.keywords_id,
        product_tag:item.keywords_name
      } 

    })

    
  } catch (err) {
    throw new Error(err);
  }
};





module.exports = {
  fetch_tags,
  fetch_tags_using_product_id
};
