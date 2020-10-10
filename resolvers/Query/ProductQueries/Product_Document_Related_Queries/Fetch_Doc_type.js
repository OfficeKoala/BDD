const { pool } = require("../../../../utils");
const sql = require("mssql");
// const { authenticate } = require("../../../utils");

const fetch_document_type = async _ => {
  try {
    //   const user_id = authenticate(ctx);
    const get_doc_types = "SELECT * FROM dbo.document_type";

    const poolT = await pool;
    const res = await poolT.request().query(get_doc_types);

    return res.recordset;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  fetch_document_type
};
