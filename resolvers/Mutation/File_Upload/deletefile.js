var fs = require("fs");
const mimeType = require("mime");
const rimraf=require('rimraf');
const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const sqlqueries =require("../../Sql_queries/Mutation_queries")

const delete_file = async(_, {file_type,file_id}, ctx) => {
    
    const userObj= authenticate(ctx);
   let poolT=await pool;

try{

  const get_file_path=(file_type===1)?sqlqueries.delete_file_query.get_image_url:sqlqueries.delete_file_query.get_doc_path;
  const response_path =await poolT
  .request()
  .input((file_type===1)?"user_id":"product_doc_id",sql.Int,(file_type===1)?userObj.user_id:file_id)
  .query(get_file_path) 
  let file_path_string=(file_type===1)?(response_path.recordset[0].image_url).substring(1):response_path.recordset[0].product_document_path.substring(1)
    rimraf("."+file_path_string,function () {});
  
  
  
    
  if(file_type===1)
  {
         await poolT
        .request()
        .input("user_id", sql.Int,userObj.user_id)
        .query(sqlqueries.delete_file_query.update_image_url)
        
        return {stat:"Deleted File Successfully"}
        
   }
   else
   { 
  
      await poolT
     .request()
     .input("product_doc_id",sql.Int,file_id)
     .query(sqlqueries.delete_file_query.delete_entry_from_db);
     return {stat:"Deleted File Successfully"}
  
   }

   }

catch(err)
{
  throw new Error(err)
}
};



//   function delete_a_file(file) {
//     var body = fs.readFileSync(file);
//       return body.toString("base64");
//   } 

//   let filestring=file_path.substring(1);
//   var fileType = mimeType.getType("."+filestring);
//   const file_path_type=file_path.indexOf("personal");
//   const user_id_from_path=parseInt(file_path.substring(file_path.indexOf("_")+1))

//   const file_path_type2=file_path.indexOf("docs");
//   const product_id_from_path=parseInt(file_path.substring(file_path.lastIndexOf("_")+1,file_path.lastIndexOf("/")))

  
  
//   if((file_path_type!==-1)&&(user_id_from_path)===(userObj.user_id)){
   
//     const update_image_url="UPDATE dbo.security_user set image_url=null where user_id=@user_id"
//      await poolT
//     .request()
//     .input("user_id", sql.Int,userObj.user_id)
//     .query(update_image_url);

//     rimraf("."+filestring,function () {});

//   }


//   if((file_path_type2!==-1)){


// const get_all_products_of_user="Select product_id from dbo.vendor_product where created_by= @user_id"
// const response=await poolT
// .request()
// .input("user_id", sql.Int,userObj.user_id)
// .query(get_all_products_of_user);


// response.recordset.map(async item=>{



//   if(product_id_from_path===item.product_id)
//   {
//     rimraf("."+filestring,function () {});
//     let delete_entry_from_db="delete from dbo.product_documents where product_id=@product_id and product_document_path=@product_document_path"
//   await poolT
//  .request()
//  .input("product_id",sql.Int,parseInt(product_id_from_path))
//  .input("product_document_path", sql.VarChar,file_path)
//  .query(delete_entry_from_db);

//   }
  

// })


    

//   }
 

//   var base64String = delete_a_file("."+filestring);
 


// if(base64String)
//   {
//     return {
//         stat: "File Deleted successfully",
//           };

//   }
//   else
//   {
//       throw new Error("File doesn't Exists")
//   }






module.exports = {

delete_file

};
