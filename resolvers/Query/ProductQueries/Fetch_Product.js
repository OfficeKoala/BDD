const {
  pool
} = require("../../../utils");
const sql = require("mssql");
const {
  authenticate
} = require("../../../utils");
const path = require("path");
const fs = require("fs");

const fetch_Products = async (
  _, {
    page_size,
    page_no,
    sorting_flag,
    order_flag
  },
  ctx
) => {
  const userObj = await authenticate(ctx);
  // const userObj = { user_id: 21, company_id: 16 };

  try {
    var sort_query = " order by isfavourite , ";
    switch (sorting_flag) {
      case 1:
        sort_query += "product_name " + (order_flag == 1 ? "asc " : "desc ");
        break;

      case 3:
        sort_query += "price " + (order_flag == 1 ? "asc " : "desc ");
        break;

      default:
        sort_query += "vp.product_id ";
        break;
    }

    const get_products =
      "SELECT vp.*,fav.[product_mark_favourite_id] as isfavourite, pd.document_type_id ,pd.product_document_name FROM dbo.vendor_product vp left join [dbo].[product_mark_favourite_audit] fav on vp.product_id=fav.product_id and fav.user_id=@user_id left join dbo.product_documents pd on pd.product_id= vp.product_id and pd.document_type_id=2 where vp.created_by=@user_id AND isactive=1 " +
      (sorting_flag == 1 || sorting_flag == 3 ?
        sort_query :
        " order by isfavourite desc ") +
      " OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY;       SELECT sum(m.charity_amount) as charity_raised,count(m.meeting_id) as no_of_meets, vp.product_id as product_id FROM dbo.vendor_product vp left join [dbo].[product_mark_favourite_audit] fav on vp.product_id=fav.product_id and fav.user_id=@user_id left join meeting m on vp.product_id=m.product_id where vp.created_by=@user_id AND vp.isactive=1 group by vp.product_id  order by vp.product_id  OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY  ";
    // console.log("@@@@@@@@@@@@@@@@@@@@@@@", get_products)
    if (page_no > 0) {
      let poolT = await pool;
      const res = await poolT
        .request()
        .input("page_size", sql.Int, page_size)
        .input("page_no", sql.Int, page_no)
        .input("user_id", sql.Int, userObj.user_id)
        .query(get_products);

      const product = res.recordsets[0];
      // console.log("$$$$$$$$$$$$", product)

      const product_performance_object = res.recordsets[1];
      const get_product_count =
        "SELECT COUNT(isActive) as no_of_products FROM dbo.vendor_product WHERE isActive=1 AND created_by=@user_id;";
      const query_res = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .query(get_product_count);

      const final_data = product.map(item => {
        if (item.isfavourite > 0) {
          item.isfavourite = true;
        } else {
          item.isfavourite = false;
        }
        if (item.isActive == null) {
          item.isActive = false;
        } else if (item.isActive.toJSON().data == 0) {
          item.isActive = false;
        } else {
          item.isActive = true;
        }

        if (item.document_type_id === 2) {
          item.document_type_id = true;
          item.product_document_name = item.product_document_name
        } else {
          item.document_type_id = false;
          item.product_document_name = ''
        }
        if (item.isActive) {
          var dep_obj = product_performance_object.filter(
            x => x.product_id === item.product_id
          );

          // console.log("myArray",myArray);

          return {
            product_id: item.product_id,
            product_name: item.product_name,
            product_link: item.product_link,
            product_description: item.product_description,
            product_price: item.price,
            charity_raised: dep_obj.length > 0 ? dep_obj[0].charity_raised : 0,
            no_of_meetings: dep_obj.length > 0 ? dep_obj[0].no_of_meets : 0,
            fav_product: item.isfavourite ? 1 : 0,
            has_presentation: item.document_type_id,
            product_document_name: item.product_document_name
          };
        }
      });
      switch (sorting_flag) {
        case 2:
          order_flag == 1 ?
            final_data.sort((x, y) =>
              x.no_of_meetings > y.no_of_meetings ? 1 : -1
            ) :
            final_data.sort((x, y) =>
              x.no_of_meetings < y.no_of_meetings ? 1 : -1
            );
          break;

        case 4:
          order_flag == 1 ?
            final_data.sort((x, y) =>
              x.charity_raised > y.charity_raised ? 1 : -1
            ) :
            final_data.sort((x, y) =>
              x.charity_raised < y.charity_raised ? 1 : -1
            );
          break;
        default:
          break;
      }

      // console.log("final data", final_data);
      return {
        product_data: final_data,
        products_no: query_res.recordset[0].no_of_products
      };
    }
  } catch (err) {
    throw new Error(err);
  }
};

const fetch_product_info_by_id = async (_, {
  product_id
}, ctx) => {
  try {
    const userObj = await authenticate(ctx);

    const get_product_info =
      "SELECT product_id,product_name,product_description,product_link,price from dbo.vendor_product  WHERE product_id=@product_id";
    const poolT1 = await pool;
    const resultant = await poolT1
      .request()
      .input("product_id", sql.Int, product_id)
      .query(get_product_info);

    const get_all_product_documents =
      "SELECT product_doc_id as file_id,product_document_path,product_document_name,document_type_id from dbo.product_documents WHERE product_id=@product_id";
    const res_product_documents = await poolT1
      .request()
      .input("product_id", sql.Int, product_id)
      .query(get_all_product_documents);

    const docs_data = res_product_documents.recordset.map(item => {
      const stats = fs.statSync(
        path.join(
          __filename,
          "../../../../",
          item.product_document_path.substring(1)
        )
      );
      const fileSizeInBytes = stats.size;

      const fileSizeInKilobytes = fileSizeInBytes / 1000;

      return {
        file_id: item.file_id,
        product_document_path: item.product_document_path,
        product_document_name: item.product_document_name,
        document_type_id: item.document_type_id,
        file_size: fileSizeInKilobytes
      };
    });

    const get_product_tags =
      "SELECT * from dbo.product_tags_audit WHERE product_id=@product_id";

    const res = await poolT1
      .request()
      .input("product_id", sql.Int, product_id)
      .query(get_product_tags);

    const final = resultant.recordset.map(item => {
      return {
        product_id: item.product_id,
        product_name: item.product_name,
        product_link: item.product_link,
        product_price: item.price,
        product_description: item.product_description,
        product_tags: res.recordset,
        product_documents: docs_data
      };
    });

    // return {product:resultant.recordset[0],product_tags:TAGS}

    return final;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  fetch_Products,
  fetch_product_info_by_id
};