var fs = require("fs");
var rimraf = require("rimraf");
const { createWriteStream } = require("fs");
var copyFile = require("quickly-copy-file");
const mimeType = require("mime");
const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const errors = require("../../Error_and_constants/Errors");
const compress_images = require("compress-images");
const sqlqueries = require("../../Sql_queries/Mutation_queries");
const Jimp=require("jimp");

const uploadfile = async (
  _,
  { fileData, flag, product_id, path, document_type_id },
  ctx
) => {
  try {
    var product_doc_id = "";
    if (fileData) {
      var d = new Date();
      var current_time = d.getTime();

      const filesystem_key = "uid_";
      let poolT = await pool;
      // const userObj={user_id:2}
      //  const userObj =  flag === 2 || flag === 4 ? "" : await authenticate(ctx);
      const userObj={user_id:1}

      const resolvingAllFile = async item => {
        var file_name = null;
        var filePath = null;

        // fs = require('fs').promises;
        //File_return after resolving **
        const file_ = await new Promise((resolve, reject) => {
          if (item) resolve(item);
        })
          .then(async data => {
            let { filename, createReadStream, mimetype, encoding } = data;



            console.log("========DATA ============ ",data)
            const stream = createReadStream; 


            console.log("========Stream ============ ",stream)
            file_name = filename;

            // filePath = "/" + "/documents/document/" + file_name;

            //ALL PERSONAL UPLOADS IN FLAG-1
            if (flag === 1) {
              data=data
              if (data.mimetype.substring(0, 5) === "image") {
                return StoreUpload({ stream, filename, mimetype, encoding });
              } else {
                throw new Error(errors.upload_file.not_an_image);
              }
            } else if (flag === 2) {
              if (data.mimetype.substring(0, 5) === "image") {
                return StoreUpload(
                  { stream, filename, mimetype, encoding },
                  flag
                );
              } else {
                throw new Error(errors.upload_file.not_an_image);
              }
            }
            //PERSONAL FILES

            ///////////////FOR DOCUMENTS
            else if (flag === 3) {
              let ext = filename.substring(filename.lastIndexOf(".") + 1);
              if (
                ext === "pdf" ||
                ext === "csv" ||
                ext === "doc" ||
                ext === "docx" ||
                ext === "ppt" ||
                ext === "pptx" ||
                ext === "odp" ||
                ext === "ods" ||
                ext === "odt" ||
                ext === "xls" ||
                ext === "xlsx" ||
                ext === "rtf" ||
                ext === "txt" ||
                ext === "jpg" ||
                ext === "jpeg" ||
                ext === "png"
              ) {
                return StoreUpload({ stream, filename, mimetype, encoding });
              } else {
                throw new Error(errors.upload_file.not_supported_document);
              }
            } else if (flag === 4) {
              let ext = filename.substring(filename.lastIndexOf(".") + 1);

              if (document_type_id === 3) {
                if (
                  ext === "pdf" ||
                  ext === "csv" ||
                  ext === "doc" ||
                  ext === "docx" ||
                  ext === "ppt" ||
                  ext === "pptx" ||
                  ext === "odp" ||
                  ext === "ods" ||
                  ext === "odt" ||
                  ext === "xls" ||
                  ext === "xlsx" ||
                  ext === "rtf" ||
                  ext === "txt" ||
                  ext === "jpg" ||
                  ext === "JPG" ||
                  ext === "jpeg" ||
                  ext === "png"
                ) {
                  return StoreUpload(
                    { stream, filename, mimetype, encoding },
                    flag
                  );
                } else {
                  throw new Error(errors.upload_file.not_supported_document2);
                }
              } else {
                if (ext === "ppt" || ext === "pptx") {
                  return StoreUpload(
                    { stream, filename, mimetype, encoding },
                    flag
                  );
                } else {
                  throw new Error(errors.upload_file.not_valid_ppt);
                }
              }
            }
 
          })
          .then(async res => {
            //After Upload file insert Path into Database

            //If file was a product update product_document path
            if (flag === 3) {
              try {
                const file_path =
                  "//uploads/" +
                  filesystem_key +
                  userObj.user_id +
                  "/docs/p_" +
                  product_id +
                  "/" +
                  current_time +
                  file_name;

                const res = await poolT
                  .request()
                  .input("product_id", sql.Int, product_id)
                  .input("document_type_id", sql.Int, document_type_id)
                  .input("product_document_name", sql.VarChar, file_name)
                  .input("product_document_path", sql.VarChar, file_path)
                  .query(
                    sqlqueries.upload_file_query.insert_in_product_documents
                  );

                product_doc_id = res.recordset[0].product_doc_id;
              } catch (error) {
                throw new Error(error);
              }
            }
            //If Upload is PERSONAL PROFILE UPLOAD--USER SETTINGS --page
            else if (flag === 1) {
              try {                
                const upload_query =
                  sqlqueries.upload_file_query.insert_to_security_user +
                  filesystem_key +
                  userObj.user_id +
                  "/personal/" +
                  file_name +
                  "' where user_id=@user_id";
                await poolT
                  .request()
                  .input("user_id", sql.Int, userObj.user_id)
                  // .query(insert_to_security_user);
                  .query(upload_query);
              } catch (error) {
                throw new Error(error);
              }
            }

            flag === 1
              ? fs.existsSync(
                  "./uploads/" + filesystem_key + userObj.user_id + "/personal/"
                )
                ? rimraf(
                    "./uploads/" +
                      filesystem_key +
                      userObj.user_id +
                      "/personal/*",
                    function() {}
                  )
                : undefined
              : undefined; 

            let folder =
              "./uploads/" + filesystem_key + userObj.user_id + "/personal/";

            if (flag === 1) {

              

              // compress_images(
              //   "./temp/" + file_name,
              //   folder,
              //   { compress_force: false, statistic: true, autoupdate: true },
              //   false,
              //   {jpg: {engine: 'jpegRecompress', command: ['--quality', 'low', '--min', '30']}},
              //   { png: { engine: "pngquant", command: ["--quality=20-50"] } },
              //   { svg: { engine: "svgo", command: "--multipass" } },
              //   {
              //     gif: {
              //       engine: "gifsicle",
              //       command: ["--colors", "64", "--use-col=web"]
              //     }
              //   },
              //   function(error, completed, statistic) { 
              //     console.log(error);




              //     console.log(completed);
              //     console.log(statistic); 
              //   }
              // );
              Jimp.read("./temp/" + file_name, (err, lenna) => {
                if (err) throw err;
                lenna
                  .resize(256, 256) // resize
                  .quality(60) // set JPEG quality // set greyscale
                  .write(folder+file_name); // save
              });



            }

            console.log("-------FILE PATH FROM UPLOAD FILE------->",res)
            return flag === 2 || flag === 4
              ? res
              : flag === 1
              ? "Image updated successfully"
              : copyFile(
                  "./temp/" + file_name,
                  flag === 3
                    ? "./uploads/" +
                        filesystem_key +
                        userObj.user_id +
                        "/docs/p_" +
                        product_id +
                        "/" +
                        current_time +
                        file_name
                    : ""
                );
          })
          .then(data => { 

            return data
              ? data
              : path
              ? rimraf(path, function() {}) === null
                ? "Error"
                : `${product_doc_id}`
              : `${product_doc_id}`;
            //************************************/
          });

        return file_;
      };

      let dir = "./temp";

      //IF Directory Doesn't Exists then create the directory

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      let dire_ctory = "./tmp";

      if (!fs.existsSync(dire_ctory)) {
        fs.mkdirSync(dire_ctory);
      }

      //Files Resolved

      // const file_upload_status=await Promise.all(fileData);

      return await Promise.all(
        fileData.map(async element => {
          return await Promise.all([resolvingAllFile(element)])
            .then(res => {
              //  rimraf("./temp", function() {});
              return res[0];
            })
            .catch(error => {
              return error;
            });
        })
      );
    } else {
      throw new Error(errors.upload_file.file_not_received);
    }
  } catch (err) {
    throw err;
  }
};

//STORE UPLOAD METHOD
const StoreUpload = async ({ stream, filename, mimetype, encoding }, flag) => {
  if (flag === undefined) {
    return await new Promise((resolve, reject) => {
      stream
        .pipe(createWriteStream("./temp/" + filename))
        .on("finish", () => resolve("Uploaded"))
        .on("error", () => reject(Error(errors.upload_file.upload_error)));
    });
  } else {
    return await new Promise((resolve, reject) => {
      const temp_path = "./tmp/" + filename;
      stream
        .pipe(createWriteStream(temp_path))
        .on("finish", () => resolve(temp_path))
        .on("error", () => reject(Error(errors.upload_file.upload_error)));
    });
  }
};

module.exports = {
  uploadfile
};
