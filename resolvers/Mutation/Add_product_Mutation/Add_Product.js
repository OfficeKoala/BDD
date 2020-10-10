const sql = require("mssql");
const { pool } = require("../../../utils");
const { authenticate } = require("../../../utils");
var rimraf = require("rimraf");
var copyFile = require("quickly-copy-file");
const errors = require("../../Error_and_constants/Errors");
const sqlqueries = require("../../Sql_queries/Mutation_queries");

const Add_product = async (
  _,
  {
    company_id,
    product_name,
    product_description,
    product_link,
    product_images_path,
    product_document_path,
    tags,
    price,
    presentation_doc_path,
    supporting_doc_array
  },
  ctx
) => {
  try {
    const filesystem_key = "uid_";

    var d = new Date();
    var current_time = d.getTime();
    let poolT1 = await pool;
    const userObj = authenticate(ctx);
    const file_path =
      "./uploads/" + filesystem_key + userObj.user_id + "/docs/p_";

    const ans = await poolT1
      .request()
      .input("product_name", sql.VarChar, product_name)
      .query(sqlqueries.product.check_duplicacy);

    if (ans.recordset.length > 0) {
      throw new Error(errors.product.product_name_exists);
    } else {
      if (product_description === undefined) {
        product_description = product_name;
      }

      const result = await poolT1
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("company_id", sql.Int, company_id)
        .input("product_name", sql.VarChar, product_name)
        .input("product_description", sql.VarChar, product_description)
        .input("product_link", sql.VarChar, product_link)
        .input("product_images_path", sql.VarChar, product_images_path)
        .input("product_document_path", sql.VarChar, product_document_path)
        .input("price", sql.Float, price)
        .query(sqlqueries.product.insert_in_vendor_product);

      const product_id = await result.recordset[0].product_id;

      //*********************************************** */

      product_id
        ? supporting_doc_array
          ? supporting_doc_array.length <= 3
            ? supporting_doc_array.map(async path => {
                path
                  ? copyFile(
                      path,
                      file_path +
                        product_id +
                        "/" +
                        current_time +
                        path.substring(path.lastIndexOf("/") + 1)
                    )
                  : "";
                if (path) {
                  try {
                    await poolT1
                      .request()
                      .input("product_id", sql.Int, product_id)
                      .input("document_type_id", sql.Int, 3)
                      .input(
                        "product_document_name",
                        sql.VarChar,
                        path.substring(path.lastIndexOf("/") + 1)
                      )
                      .input(
                        "product_document_path",
                        sql.VarChar,
                        "/" +
                          (
                            file_path +
                            product_id +
                            "/" +
                            current_time +
                            path.substring(path.lastIndexOf("/") + 1)
                          ).substring(1)
                      )
                      .query(sqlqueries.product.insert_in_product_documents);

                    path ? rimraf(path, function() {}) : "";
                  } catch (error) {
                    throw new Error(error);
                  }
                }
              })
            : " "
          : " "
        : "";

      //********************************************************* */
      if (product_id) {
        presentation_doc_path != "" &&
        presentation_doc_path !== null &&
        presentation_doc_path !== undefined
          ? copyFile(
              presentation_doc_path,
              file_path +
                product_id +
                "/" +
                current_time +
                presentation_doc_path.substring(
                  presentation_doc_path.lastIndexOf("/") + 1
                )
            )
          : "";
        if (presentation_doc_path) {
          try {
            await poolT1
              .request()
              .input("product_id", sql.Int, product_id)
              .input("document_type_id", sql.Int, 2)
              .input(
                "product_document_name",
                sql.VarChar,
                presentation_doc_path.substring(
                  presentation_doc_path.lastIndexOf("/") + 1
                )
              )
              .input(
                "product_document_path",
                sql.VarChar,
                "/" +
                  (
                    file_path +
                    product_id +
                    "/" +
                    current_time +
                    presentation_doc_path.substring(
                      presentation_doc_path.lastIndexOf("/") + 1
                    )
                  ).substring(1)
              )
              .query(
                sqlqueries.product
                  .insert_in_product_documents_if_presentation_doc_path
              );

            presentation_doc_path
              ? rimraf(presentation_doc_path, function() {})
              : "";
          } catch (error) {
            throw new Error(error);
          }
        }
      }

      //*********************************************************** */

      if (tags) {
        const tag_ids = await Promise.all(
          tags.map(async tag => {
            poolT1 = await pool;

            let resultant = await poolT1
              .request()
              .input("product_id", sql.Int, product_id)
              .input("product_tag", sql.VarChar, tag.value)
              .query(sqlqueries.product.insert_to_tags_audit);

            return resultant.recordset[0].product_tag_id;
          })
        );
      }

      // const alltags = product_tag_names.map((item, index) => {

      //   return { product_tag_id: tags[index], product_tag:item };
      // });

      const status = "Product Succesfully Added ";

      return { product_id, product_name, status };
    }
  } catch (err) {
    throw new Error(err);
  }
};

const Update_product = async (
  _,
  {
    created_by,
    company_id,
    product_id,
    product_name,
    product_description,
    product_link,
    product_images_path,
    product_document_path,
    tags,
    deleted_tags,
    price,
    presentation_doc_path,
    supporting_doc_array
  },
  ctx
) => {
  const userObj = authenticate(ctx);
  try {
    if (product_id <= 0) {
      throw new Error(errors.product.product_does_not_exists);
    }
    const filesystem_key = "uid_";

    var d = new Date();
    var current_time = d.getTime();
    const file_path =
      "./uploads/" + filesystem_key + userObj.user_id + "/docs/p_";
    let poolT1 = await pool;
    await poolT1
      .request()
      .input("product_name", sql.VarChar, product_name)
      .input("product_description", sql.VarChar, product_description)
      .input("product_link", sql.VarChar, product_link)
      .input("product_images_path", sql.VarChar, product_images_path)
      .input("product_document_path", sql.VarChar, product_document_path)
      .input("product_id", sql.Int, product_id)
      .input("price", sql.Float, price)
      .query(sqlqueries.product.update_in_vendor_product);

    //*********************************************** */
    product_id
      ? supporting_doc_array
        ? supporting_doc_array.length <= 3
          ? supporting_doc_array.map(async path => {
              path
                ? copyFile(
                    path,
                    file_path +
                      product_id +
                      "/" +
                      current_time +
                      path.substring(path.lastIndexOf("/") + 1)
                  )
                : "";
              if (path) {
                try {
                  await poolT1
                    .request()
                    .input("product_id", sql.Int, product_id)
                    .input("document_type_id", sql.Int, 3)
                    .input(
                      "product_document_name",
                      sql.VarChar,
                      path.substring(path.lastIndexOf("/") + 1)
                    )
                    .input(
                      "product_document_path",
                      sql.VarChar,
                      "/" +
                        (
                          file_path +
                          product_id +
                          "/" +
                          current_time +
                          path.substring(path.lastIndexOf("/") + 1)
                        ).substring(1)
                    )
                    .query(sqlqueries.product.insert_in_product_documents);

                  path ? rimraf(path, function() {}) : "";
                } catch (error) {
                  throw new Error(error);
                }
              }
            })
          : " "
        : " "
      : "";

    //********************************************************* */

    presentation_doc_path != "" &&
    presentation_doc_path !== null &&
    presentation_doc_path !== undefined
      ? copyFile(
          presentation_doc_path,
          file_path +
            product_id +
            "/" +
            current_time +
            presentation_doc_path.substring(
              presentation_doc_path.lastIndexOf("/") + 1
            )
        )
      : "";
    if (presentation_doc_path) {
      try {
        await poolT1
          .request()
          .input("product_id", sql.Int, product_id)
          .input("document_type_id", sql.Int, 2)
          .input(
            "product_document_name",
            sql.VarChar,
            presentation_doc_path.substring(
              presentation_doc_path.lastIndexOf("/") + 1
            )
          )
          .input(
            "product_document_path",
            sql.VarChar,
            "/" +
              (
                file_path +
                product_id +
                "/" +
                current_time +
                presentation_doc_path.substring(
                  presentation_doc_path.lastIndexOf("/") + 1
                )
              ).substring(1)
          )
          .query(
            sqlqueries.product
              .insert_in_product_documents_if_presentation_doc_path
          );

        presentation_doc_path
          ? rimraf(presentation_doc_path, function() {})
          : "";
      } catch (error) {
        throw new Error(error);
      }
    }
    if (deleted_tags) {
      const res = await poolT1
        .request()
        .input("product_id", sql.Int, product_id)
        .query(sqlqueries.product.get_all_for_product_id);

      deleted_tags.map(async item => {
        var existingObject = res.recordset.find(
          x => x.product_tag.toLowerCase() === item.value.toLowerCase()
        );

        if (existingObject) {
          await poolT1
            .request()
            .input("product_tag_id", sql.Int, item.id)
            .query(sqlqueries.product.del_tags);
        }
      });
    }

    //***************************************************** */
    if (tags) {
      const res = await poolT1
        .request()
        .input("product_id", sql.Int, product_id)
        .query(sqlqueries.product.get_all_for_product_id);

      tags.map(async item => {
        //If tag already exists
        var existingObject = res.recordset.find(
          x => x.product_tag.toLowerCase() === item.value.toLowerCase()
        );

        if (existingObject === undefined) {
          //insert it into product_tag_audit

          const conclusion = await poolT1
            .request()
            .input("product_id", sql.Int, product_id)
            .query(sqlqueries.product.check_for_product_id);

          if (conclusion.recordset) {
            await poolT1
              .request()
              .input("product_id", sql.Int, product_id)
              .input("product_tag", sql.VarChar, item.value)
              .query(sqlqueries.product.enter_to_audit);
          }
        }
        // if (item.id === res.recordset[index].product_tag_id) {
        //   await poolT1
        //     .request()
        //     .input("product_tag_id", sql.Int, product_tag_id)
        //     .input("product_tag", sql.Int, item.value)
        //     .query(update_tag);
        // }
      });
    }

    // const alltags = product_tag_names.map((item, index) => {

    //   return { product_tag_id: tags[index], product_tag:item };
    // });

    const status = "Product Successfully Updated ";

    return { product_id, status };
  } catch (err) {
    //Catch block of the whole Update_Product Api

    throw new Error(err);
  }
};

module.exports = { Add_product, Update_product };
