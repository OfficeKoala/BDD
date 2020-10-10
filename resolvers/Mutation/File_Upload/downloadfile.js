var fs = require("fs");
const mimeType = require("mime");
const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const jwt = require("jsonwebtoken");
const config=require('../../../config/index')
const errors=require("../../Error_and_constants/Errors")
const sqlqueries=require("../../Sql_queries/Mutation_queries")

const download_file = async (
  _,
  { file_type, file_id, flag, vendor_id, tokenVal },
  ctx
) => {

  let poolT = await pool;
  try{
  const userObj = flag === 0 ? authenticate(ctx) : { user_id: vendor_id };
  const check_if_dm =
    flag === 1
      ? jwt.verify(tokenVal, config.SESSION_SECRET, (err, decoded) => {
          return decoded.user_id;
        })
      : "";

  function base64Encode(file) {
    var body = fs.readFileSync(file);

    return body.toString("base64");
  }

  const get_file_path =
    file_type === 1
      ? sqlqueries.download_file_query.get_image_url
      : sqlqueries.download_file_query.get_doc_path;
  const response_path = await poolT
    .request()
    .input(
      file_type === 1 ? "user_id" : "product_doc_id",
      sql.Int,
      file_type === 1 ? userObj.user_id : file_id
    )
    .query(get_file_path);

  let authentic_user_download_access =
    file_type !== 1
      ? await check_product_doc_download_authenticity(poolT, userObj, file_id)
      : undefined;

  let file_path_string =
    file_type === 1
      ? response_path.recordset[0].image_url.substring(1)
      : authentic_user_download_access === true
      ? response_path.recordset[0].product_document_path.substring(1)
      : undefined;

  var fileType =
    file_path_string !== "" && file_path_string !== null
      ? mimeType.getType("." + file_path_string)
      : "";

  var base64String =
    file_path_string !== "" &&
    file_path_string !== null &&
    file_path_string !== undefined
      ? base64Encode("." + file_path_string)
      : undefined;

  if (base64String) {
    if (flag === 1) {
 
      if (check_if_dm) {
        return {
          fileData: base64String,
          mimeType: fileType
        };
      } else {
        throw new Error(errors.download_file.not_authorized);
      }
    } else {
      return {
        fileData: base64String,
        mimeType: fileType
      };
    }
  } else {
    throw new Error(
      errors.download_file.file_not_exists
    );
  }
  }
  catch(err)
  {
    throw new Error(err);
  }

};

const check_product_doc_download_authenticity = async (
  poolT,
  userObj,
  file_id
) => {
  try{
 const authentic_user_download = await poolT
    .request()
    .input("user_id", sql.Int, userObj.user_id)
    .input("file_id", sql.Int, file_id)
    .query(sqlqueries.download_file_query.check_authenticity_for_downloading);

  return authentic_user_download.recordset.length > 0;
  }
  catch(err)
  {
    throw new Error(err)
  }

};


module.exports = {
  download_file
};
