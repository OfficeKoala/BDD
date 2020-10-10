const { pool } = require("../../../utils");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const config = require("../../../config");
var path = require('path');

const Access_For_DM_In_Meeting = async (_, { meeting_id, dm_ID, pin }, ctx) => {
  const token = jwt.sign({ user_id: dm_ID }, config.SESSION_SECRET);
  const fs = require("fs"); //Load the filesystem module

  


  try {
  
    const PoolT = await pool;
    const Accessibility_according_to_pin =
      "select pin from  meeting__participant_audit where meeting_id= @meeting_id AND user_id=@dm_ID ";
    const res = await PoolT.request()
      .input("meeting_id", sql.Int, meeting_id)
      .input("dm_ID", sql.Int, dm_ID)
      .query(Accessibility_according_to_pin);

   

   
var pin_value=res.recordset[0].pin.toString()
    if (pin_value=== pin) {
      
      const Dm_detail =
        "select  Distinct s.first_name, s.last_name , s.image_url, s.contact_no,c.company_name, c.company_website, ch.org_name, ch.org_website  from dbo.decision_maker_user d left join dbo.security_user s on d.user_id=s.user_id left join dbo.company c on s.company_id=c.company_id left join dbo.charity_audit ca on ca.dm_user_id=s.user_id left join dbo.charities ch on ch.org_id = ca.org_id  left join meeting m on m.user_id=s.user_id   where s.is_decision_maker=1 and d.user_id= @user_id";
      const response = await PoolT.request()
        .input("user_id", sql.Int, dm_ID)
        .query(Dm_detail);
      const user_name =
        response.recordset[0].first_name +
        " " +
        response.recordset[0].last_name;
      // console.log("hhhhhh", response);

      const get_product_documents =
        "select   pd.product_doc_id as document_id,m.user_id,m.product_id,pd.document_type_id as file_id, pd.product_document_name, pd.product_document_path  from dbo.product_documents pd left join dbo.meeting m on m.product_id=pd.product_id where m.meeting_id=@meeting_id";
      const response_data_documents = await PoolT.request()
        .input("meeting_id", sql.Int, meeting_id)
        .query(get_product_documents);
       const vendor_id_query= "select user_id from dbo.meeting where meeting_id=@meeting_id"
       const response_from_vendor = await PoolT
       .request()
       .input("meeting_id", sql.Int,meeting_id)
       .query(vendor_id_query)
       const docs_data=response_data_documents.recordset.map(item=>{
        
       const stats = fs.statSync(path.join(__filename,'../../../../',item.product_document_path.substring(1)));
       const fileSizeInBytes = stats.size;

       const fileSizeInKilobytes = fileSizeInBytes / 1000;
        

        return{
          document_id: item.document_id,
          user_id: item.user_id,
          product_id:item.product_id,
          file_id:item.file_id,
          product_document_name:item.product_document_name,
          product_document_path:item.product_document_path,
          file_size:fileSizeInKilobytes

        }


       })

     

     

      return {
        user_name: user_name,
        image_url: response.recordset[0].image_url,
        contact_no: response.recordset[0].contact_no,
        company_name: response.recordset[0].company_name,
        company_website: response.recordset[0].company_website,
        org_name: response.recordset[0].org_name,
        org_website: response.recordset[0].org_name,
        product_documents: docs_data,
        flag: true,
        dm_id:dm_ID,
        token:token,
        vendor_id: response_from_vendor.recordset[0].user_id
      };
    } else {
      return { flag: false };
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { Access_For_DM_In_Meeting };
