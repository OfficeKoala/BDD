const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const bcrypt = require("bcryptjs");
const errors = require("../../Error_and_constants/Errors");

const Update_User_Account_Settings = async (
  _,
  { first_name, last_name, email_address, user_name, contact_no, password },
  ctx
) => {
  const userObj = await authenticate(ctx);
  // const userObj= {user_id:12,company_id:4}

  try {
    if (password === "" || password === undefined) {
      const update_values =
        "UPDATE dbo.security_user SET first_name =@first_name,last_name =@last_name,email_address=@email,user_name=@user_name,contact_no=@contact_no WHERE user_id=@user_id;";

      let poolT = await pool;
      await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("first_name", sql.VarChar, first_name)
        .input("last_name", sql.VarChar, last_name)
        .input("email", sql.VarChar, email_address)
        .input("user_name", sql.VarChar, user_name)
        .input("contact_no", sql.VarChar, contact_no)
        // .input("image_url", sql.VarChar, image_url)
        .query(update_values);

      return {
        stat: "Updated Successfully"
      };
    } else if (password !== "") {
      //********** */

      const _password = await bcrypt.hash(password, 10);
      const update_values =
        "UPDATE dbo.security_user SET first_name =@first_name,last_name =@last_name,email_address=@email,user_name=@user_name,contact_no=@contact_no,password=@password WHERE user_id=@user_id;";

      let poolT = await pool;
      await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("first_name", sql.VarChar, first_name)
        .input("last_name", sql.VarChar, last_name)
        .input("email", sql.VarChar, email_address)
        .input("user_name", sql.VarChar, user_name)
        .input("contact_no", sql.VarChar, contact_no)
        .input("password", sql.VarChar, _password)
        // .input("image_url", sql.VarChar, image_url)
        .query(update_values);

      return {
        stat: "Updated Successfully"
      };
    }
  } catch (error) {
    throw new Error(error);
  }
};

//***************************************************************************** /
//***************************************************************************** /
//***************************************************************************** /

const Update_Company_Settings = async (
  _,
  {
    company_id,
    company_country,
    company_address,
    company_zip,
    company_city,
    company_state,
    company_website,
    insert_industry_ids,
    deleted_industry_tags,
    insert_management_ids,
    deleted_management_tags,
    company_size_id
  },

  ctx
) => {
  const userObj = await authenticate(ctx);
  //  const userObj= {user_id:184,company_id:18}
  try {
    if (company_id > 0) {
      const query =
        "Select company_id from dbo.security_user where user_id=@user_id";
      let poolT = await pool;
      const res1 = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .query(query);
      if (res1.recordset.length > 0) {
        if (res1.recordset[0].company_id == company_id) {
          const update_query =
            "UPDATE dbo.company SET company_address=@company_address,Company_Country=@company_country,company_zip=@company_zip,Company_State=@company_state,company_website=@company_website,company_size_id=@company_size_id,company_city=@company_city WHERE company_id=@company_id";
          let pool1 = await pool;
          await pool1
            .request()
            .input("company_id", sql.Int, company_id)
            .input("company_website", sql.VarChar, company_website)
            .input("company_address", sql.VarChar, company_address)
            .input("company_zip", sql.VarChar, company_zip)
            .input("company_state", sql.Int, company_state)
            .input("company_city", sql.VarChar, company_city)
            .input("company_size_id", sql.Int, company_size_id)
            .input("company_country", sql.Int, company_country)
            .query(update_query);
        } else {
          stat: "Company does not exists.";
        }
      } else
        return {
          stat: "Company does not exists."
        };
    } else {
      throw new Error(errors.update_settings.incorrect_data);
    }

    const query2 =
      "DELETE  from dbo.user_management_level_audit where user_id=@user_id AND management_level_id=@deleted_management_tags";
    deleted_management_tags.map(async item => {
      let pool2 = await pool;
      const res2 = await pool2
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .input("deleted_management_tags", sql.Int, item)
        .query(query2);
    });

    const query3 =
      "SELECT [management_level_id] FROM dbo.user_management_level_audit WHERE user_id=@user_id";
    let pool3 = await pool;
    const res3 = await pool3
      .request()
      .input("user_id", sql.Int, userObj.user_id)
      .query(query3);

    insert_management_ids.map(async item => {
      var existing = res3.recordset.find(function(element) {
        return element.management_level_id === parseInt(item);
      });
      if (existing === undefined) {
        const insert_to_user_management_level_audit =
          "INSERT INTO dbo.user_management_level_audit VALUES(@user_id,@insert_management_ids,1)";
        let poolT = await pool;
        await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("insert_management_ids", sql.Int, item)
          .query(insert_to_user_management_level_audit);
      }
    });

    // const response_of_industry = await Promise.all(
    //   deleted_industry_tags.map(async item => {
    //     let pool2 = await pool;
    //     await pool2
    //       .request()
    //       .input("user_id", sql.Int, userObj.user_id)
    //       .input("deleted_industry_tags", sql.Int, item)
    //       .query(
    //         "DELETE  from dbo.user_industry_audit where user_id=@user_id AND industry_id=@deleted_industry_tags"
    //       );
    //   })
    // ); //code must be in promise.all function

    const deleteQuery= "DELETE  from dbo.user_industry_audit where user_id=@user_id"
    let pooll = await pool;
        await pooll
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(deleteQuery)
    const query5 =
      "SELECT [industry_id] from dbo.user_industry_audit where user_id=@user_id";
    let pool4 = await pool;
    const res4 = await pool4
      .request()
      .input("user_id", sql.Int, userObj.user_id)
      .query(query5);

    const reso = await Promise.all(
      insert_industry_ids.map(async item => {
        //  var found = res4.recordset.find(function(element) {
        //   return element < 12;
        // });

        var existing = res4.recordset.find(function(element) {
          return element.industry_id === parseInt(item);
        });
        // console.log("print","****", existing )
        // var existing = res4.recordset.find(x => x.industry_id === item);
        // console.log("x.industry_id","****", existing )
        if (existing === undefined) {
          const insert_to_industry_management_level_audit =
            "INSERT INTO dbo.user_industry_audit VALUES(@user_id,@insert_industry_ids,1) ;";

          // insert_industry_ids.map(async item => {
          let poolT = await pool;
          await poolT
            .request()
            .input("user_id", sql.Int, userObj.user_id)
            .input("insert_industry_ids", sql.Int, item)
            .query(insert_to_industry_management_level_audit);
          // });
        } else {
          // console.log("Deleteitem", item)
          const query4 =
            "DELETE  from dbo.user_industry_audit where user_id=@user_id AND industry_id=@deleted_id";
          let poolT = await pool;
          await poolT
            .request()
            .input("user_id", sql.Int, userObj.user_id)
            .input("deleted_id", sql.Int, res4.recordset.industry_id)
            .query(query4);
        }
      })
    );

    return {
      stat: "status update successfully"
    };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  Update_User_Account_Settings,
  Update_Company_Settings
};
