const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const { pool } = require("../../utils");
const config = require("../../config");
const allqueries = require("../Query/login_signup_Queries");
var rimraf = require("rimraf");
var copyFile = require("quickly-copy-file");
const { server_ip } = require("./../..//config/index");
const compress_images = require("compress-images");
const errors =require("./../Error_and_constants/Errors");
const Jimp=require("jimp");

const mail = require("./Signup_Mail");

//FOR MAIL...........................

//User-SignUp API
const signup = async (
  _,
  {
    first_name,
    last_name,
    email,
    password,
    user_name,
    contact_no,
    company_name,
    company_website,
    company_shortname,
    company_address,
    company_zip,
    company_city,
    company_state,
    company_country,
    company_description,
    company_size_id,
    is_decision_maker,
    industry_id,
    management_level_id,
    keywords_ids,
    job_function_id,
    charity_ids,
    preferredtimefrom,
    preferredtimeto,
    dm_description,
    dm_charity_amount,
    dm_hours_per_month,
    charity_org,
    location_id,
    path
  }
) => {
  let file_name = path.substring(path.lastIndexOf("/") + 1);

  console.log("----------- IMAGE FILE PATH RECEIVED IN AUTHMUTATION FILE--------->>>>>>>>>>>>>>>>",path)
  const filesystem_key = "uid_";
  try {
    //Checking if email is Already taken or not

    const poolT = await pool;
    const res = await poolT
      .request()
      .input("email", sql.VarChar, email)
      .query(allqueries.check_email_duplicacy);

    if (res.recordset.length > 0) {
      return new Error(errors.signup_login.email_exists);
    } 
    else {
      //Checking if company name provided by the user is already registered With Us
      const poolT = await pool;
      const res_company = await poolT
        .request()
        .input("company_name", sql.VarChar, company_name)
        .query(allqueries.check_company_already_registered);
      if (res_company.recordset.length > 0) {
        // throw new Error("Company Name already Registered With Us");
        //************************************************************ */
        //If company Exists then get company_id of the company and save user_details in user_table

        const user = await save_user_details(
          first_name,
          last_name,
          email,
          password,
          user_name,
          res_company.recordset[0].company_id,
          poolT,
          contact_no,
          is_decision_maker,
          industry_id,
          management_level_id,
          keywords_ids,
          job_function_id,
          charity_ids,
          preferredtimefrom,
          preferredtimeto,
          dm_description,
          dm_charity_amount,
          dm_hours_per_month,
          charity_org,
          location_id
        );


        try{
          const poolT = await pool;
          const update_company_details= "update dbo.company set company_description=@company_description,company_shortname=@company_shortname,company_website=@company_website,company_address=@company_address,company_zip=@company_zip,company_city=@company_city,Company_Country=@company_country,Company_State=@company_state,company_size_id=@company_size_id where company_id=@company_id "
        
           await poolT
          .request()
          .input("company_website",sql.VarChar,company_website?company_website:null)
          .input("company_address", sql.VarChar,company_address?company_address:null)
          .input("company_zip", sql.VarChar,company_zip?company_zip:null)
          .input("company_city", sql.VarChar,company_city)
          .input("company_country",sql.Int,company_country)
          .input("company_state",sql.Int,company_state)
          .input("company_size_id",sql.Int,company_size_id?company_size_id:null)
          .input("company_id",sql.Int,res_company.recordset[0].company_id)
          .input("company_shortname",sql.VarChar,company_shortname)
          .input("company_description",sql.VarChar,company_description?company_description:null)
          .query(update_company_details)
            
  }
  catch(err)
  {
    throw new Error("Updation Error")
  }

        const token = jwt.sign(
          {
            user_id: user.user_id,
            company_id: res_company.recordset[0].company_id
          },
          config.SESSION_SECRET,
          { expiresIn: 60 * 60 * 24 * 2 }
        );

        let folder =
          "./uploads/" + filesystem_key + user.user_id + "/personal/";
          console.log("----------------+++++++++++++++----FILE FOLDER WHERE FILE WILL BE SAVED--------++++++++++++++++++------",folder)

        if (path) {
          try {

            Jimp.read(path, (err, lenna) => {
              if (err) throw err;
              lenna
                .resize(256, 256) // resize
                .quality(60) // set JPEG quality // set greyscale
                .write(folder+file_name); // save
            });           
            // compress_images(
            //   path,
            //   folder,
            //   { compress_force: false, statistic: true, autoupdate: true },
            //   false,
            //   { jpg: {engine: 'jpegRecompress', command: ['--quality', 'low', '--min', '30']} },
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

            const insert_to_security_user =
              "update dbo.security_user set image_url=@path  where user_id=@user_id";
            await poolT
              .request()
              .input("user_id", sql.Int, user.user_id)
              .input("path", sql.VarChar, "/" + folder.substring(1) + file_name)
              .query(insert_to_security_user);
            path ? rimraf(path, function() {}) : "";
          } catch (error) {
            throw new Error(error);
          }
        }
     

        return { token };
      } else {
        // If company doesn't Exists in the Database Then company will be inserted in the database

        const check_if_company_inserted = await insert_company_details(
          company_name,
          company_website,
          company_shortname,
          company_address,
          company_zip,
          company_city,
          company_state,
          company_country,
          company_description,
          company_size_id,
          pool
        );

        if (check_if_company_inserted>0) {
          const user = await save_user_details(
            first_name,
            last_name,
            email, 
            password,
            user_name,
            check_if_company_inserted,
            poolT,
            contact_no,
            is_decision_maker,
            industry_id,
            management_level_id,
            keywords_ids,
            job_function_id,
            charity_ids,
            preferredtimefrom,
            preferredtimeto,
            dm_description,
            dm_charity_amount,
            dm_hours_per_month,
            charity_org,
            location_id
          );

          const token = jwt.sign(
            { user_id: user.user_id, company_id: check_if_company_inserted },
            config.SESSION_SECRET,
            { expiresIn: 60 * 60 * 24 * 2 }
          );

         

          let folder =
            "./uploads/" + filesystem_key + user.user_id + "/personal/";
            // console.log("----------------+++++++++++++++----FILE FOLDER WHERE FILE WILL BE SAVED--------++++++++++++++++++------",folder)
          // path ? copyFile(path, folder) : "";
          if (path) {
            try {
// console.log("------>>>>>>>Filename ",file_name)

//HERARE
Jimp.read(path, (err, lenna) => {
  if (err) throw err;
  lenna
    .resize(256, 256) // resize
    .quality(60) // set JPEG quality // set greyscale
    .write(folder+file_name); // save
});

              // compress_images(
              //   path,
              //   folder,
              //   { compress_force: false, statistic: true, autoupdate: true },
              //   false,
              //   { jpg: {engine: 'jpegRecompress', command: ['--quality', 'low', '--min', '30']} },
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

              const insert_to_security_user =
                "update dbo.security_user set image_url=@path  where user_id=@user_id";
              await poolT
                .request()
                .input("user_id", sql.Int, user.user_id)
                .input(
                  "path",
                  sql.VarChar,
                  "/" + folder.substring(1) + file_name
                )
                .query(insert_to_security_user);
              path ? rimraf(path, function() {}) : "";
            } catch (error) {
              throw new Error(error);
            }
          }

          return { token: token };
        }

        
      }
    }
 
    const get_detail_of_user =
      "Select s.email_address, s.first_name, s.last_name from dbo.security_user s where s.user_id=@userID;";
    const ras = await poolT
      .request()
      .input("meeting_id", sql.Int, userID)
      .query(get_detail_of_user);

    //****************************************** */
  } catch (err) {
    throw new Error(err);
  }
};
//User-SignUp End
//********************** */

//LOGIN API
const login = async (_, { email, user_name, password }) => {
  try {
    const poolT = await pool;
    if (!user_name || user_name.length == 0) user_name = email;
    const res = await poolT
      .request()
      .input("email", sql.VarChar, email)
      .input("user_name", sql.VarChar, user_name)
      .query(allqueries.login_query);

    if (res.recordset.length < 1) {
      throw new Error(errors.signup_login.invalid_credentials);
    }

    const user = res.recordset[0];

    const pwd_valid = await bcrypt.compare(password, user.password);
    // remove password from user object to limit scope (security)
    user.password = undefined;
    user.subscription=res.recordset[0].payment_status?res.recordset[0].payment_status.toJSON().data[0]:0;
    user.email = res.recordset[0].email_address;
    user.image_url =
      user.image_url !== null
        ? "https://" + server_ip + "/profilepic?im_path=" + user.image_url
        : "";
   

    if (!pwd_valid) {
      throw new Error(errors.signup_login.invalid_credentials);
    }
    var token = jwt.sign(
      { user_id: user.user_id, company_id: user.company_id },
      config.SESSION_SECRET,
      { expiresIn: 60 * 60 * 24 * 2 }
    );

    // const queryForSubscription="select  payment_status as subscription  from dbo.subscription where user_id=@user_id"
    // const poolhub= await pool
    // const resp= await poolhub
    // .request()
    // .input("user_id",sql.Int,user.user_id)
    // .query(queryForSubscription)

    // console.log("^^^^T",resp.recordset[0])
    return {
      token: token,
      // subscription:resp.recordset[0]?resp.recordset[0].subscription.toJSON().data[0]:0,
      user
    };

    // , {expiresIn: 60 * 60 } //add for Token expiry 
  } catch (err) {
    throw new Error(err);
  }
};
//END LOGIN API

//INSERT DETAILS OF THE COMPANY TO TABLE COMPANY
//********************************************* */

const insert_company_details = async (
  company_name,
  company_website,
  company_shortname,
  company_address,
  company_zip,
  company_city,
  company_state,
  company_country,
  company_description,
  company_size_id,
  pool
) => {
  const insert_in_company_query =
    "INSERT INTO dbo.company(company_name,company_website,company_shortname,company_status,company_address,company_zip,company_city,Company_State,Company_Country,company_description,company_size_id) VALUES(@company_name,@company_website,@company_shortname,1,@company_address,@company_zip,@company_city,@company_state,@company_country,@company_description,@company_size_id);select scope_identity() as company_id";
  const poolT1 = await pool;
  const resIns = await poolT1
    .request()
    .input("company_name", sql.VarChar, company_name) //only
    .input("company_website", sql.VarChar, company_website)
    .input("company_shortname", sql.VarChar, company_shortname)
    .input("company_address", sql.VarChar, company_address)
    .input("company_zip", sql.VarChar, company_zip)
    .input("company_city", sql.VarChar, company_city)
    .input("company_state", sql.Int, company_state)
    .input("company_country", sql.Int, company_country)
    .input("company_description", sql.VarChar, company_description)
    .input("company_size_id", sql.Int, company_size_id ? company_size_id : null)
    .query(insert_in_company_query);
  return resIns.recordset[0].company_id;
};

//SAVE USER -DETAILS TO SECURITY USER TABLE
//**************************************** */
const save_user_details = async (
  first_name,
  last_name,
  email,
  password,
  user_name,
  company_id,
  poolT,
  contact_no,
  is_decision_maker,
  industry_id,
  management_level_id,
  keywords_ids,
  job_function_id,
  charity_ids,
  preferredtimefrom,
  preferredtimeto,
  dm_description,
  dm_charity_amount,
  dm_hours_per_month,
  charity_org,
  location_id
) => {
  try {
    if (contact_no.length > 14) {
      throw new Error(errors.signup_login.contact_error);
    }

    var _password = null;
    if (password != null || password != undefined) {
      _password = await bcrypt.hash(password, 10);
    }
    const queryIns =
      "INSERT INTO dbo.security_user(company_id,email_address,user_name,first_name,last_name, password,date_created,isactive,is_decision_maker,is_support_user,contact_no) VALUES(@company_id,@email,@user_name,@first_name,@last_name, @password,getdate(),1,@is_decision_maker,0,@contact_no);select scope_identity() as user_id";
    // deconstruction magic - no need for another varibale
    const resIns = await poolT
      .request()
      .input("email", sql.VarChar, email)
      .input("user_name", sql.VarChar, user_name)
      .input("first_name", sql.VarChar, first_name)
      .input("last_name", sql.VarChar, last_name)
      .input("password", sql.VarChar, _password)
      .input("company_id", sql.Int, company_id)
      .input("contact_no", sql.VarChar, contact_no)
      .input("is_decision_maker", sql.Int, is_decision_maker)
      .query(queryIns);

    const user = resIns.recordset[0];

    const userID = user.user_id;
           
    //  , {expiresIn: 60 * 60 }

    //If User SIGNs-UP AS A DECISION_MAKER
    if (is_decision_maker === 1) {
      try {
        const insert_to_user_industry_audit =
        "INSERT INTO dbo.user_industry_audit VALUES(@userID,@industry_id,1)";
        
      
      if (industry_id != null || industry_id != undefined) {
        industry_id.map(async item => {
          await poolT
            .request()
            .input("userID", sql.Int, userID)
            .input("industry_id", sql.Int, item)
            .query(insert_to_user_industry_audit);

        });
      }
       

        if (dm_charity_amount === undefined) {
          throw new Error(errors.signup_login.dm_charity_nan);
        }
        if (keywords_ids != null || keywords_ids != undefined) {
          const insert_to_keywords_audit =
            "INSERT INTO dbo.dm_keywords_audit (user_id,keywords_id) VALUES(@userID,@keywords_id)";
          keywords_ids.map(async item => {
            await poolT
              .request()
              .input("userID", sql.Int, userID)
              .input("keywords_id", sql.Int, item)
              .query(insert_to_keywords_audit);
          });
        }
      } catch (err) {
        throw new Error(err);
      }

      try {


const insert_job_function="insert into [job_function] (job_function) values(@job_function);select scope_identity() as jb_id"

 const resk= await poolT.request().input("job_function",sql.VarChar,job_function_id).query(insert_job_function)


        const insert_to_decision_maker_user =
          "INSERT INTO dbo.decision_maker_user (rank_id,user_id,job_function_id,preferredtimefrom,preferredtimeto,dm_description,dm_charity_amount,dm_hours_per_month,location_id) VALUES(@rank_id,@userID,@job_function_id,@preferredtimefrom,@preferredtimeto,@dm_description,@dm_charity_amount,@dm_hours_per_month,@location_id)";

        await poolT
          .request()
          .input("userID", sql.Int, userID)
          .input("rank_id", sql.Int, management_level_id)
          .input("job_function_id", sql.Int, resk.recordset[0].jb_id)
          .input("preferredtimefrom", sql.VarChar, preferredtimefrom)
          .input("preferredtimeto", sql.VarChar, preferredtimeto)
          .input("dm_description", sql.VarChar, dm_description)
          .input("dm_charity_amount", sql.Float, dm_charity_amount)
          .input("dm_hours_per_month", sql.Float, dm_hours_per_month)
          .input("location_id", sql.Float, location_id)
          .query(insert_to_decision_maker_user);


          
      

      } catch (err) {
        throw new Error(err);
      }
      if (charity_org != null && charity_org.length > 0) {
        try {

          const insert_into_dm_charity_organization =
            "INSERT into dbo.dm_charity_organisation(dm_id,organisation_name,organisation_website) VALUES (@userID,@charity_org,@charity_weblink);select scope_identity() as dm_charity_organisation_id";
          charity_org.map(async item => {
            const customCharityResponse = await poolT
              .request()
              .input("userID", sql.Int, userID)
              .input("charity_org", sql.VarChar, item.orgname)
              .input("charity_weblink", sql.VarChar, item.orgwebsite)
              .query(insert_into_dm_charity_organization);
          });
        } catch (err) {
          throw new Error(err);
        }
      }

      try {
        if (charity_ids !== undefined && charity_ids.length > 0) {
          const insert_to_charity_audit =
            "INSERT INTO dbo.charity_audit (org_id,dm_user_id,donation_amount,timestamp) VALUES (@org_id,@userID,0,GETUTCDATE());";
          charity_ids.map(async item => {
            await poolT
              .request()
              .input("org_id", sql.Int, item)
              .input("userID", sql.Int, userID)
              .query(insert_to_charity_audit);
          });
        }
      } catch (err) {
        throw new Error(err);
      }

      
    }

   else{
    const insert_to_user_industry_audit =
    "INSERT INTO dbo.user_industry_audit VALUES(@userID,@industry_id,1)";

  if (industry_id != null || industry_id != undefined) {
    industry_id.map(async item => {
      await poolT
        .request()
        .input("userID", sql.Int, userID)
        .input("industry_id", sql.Int, item)
        .query(insert_to_user_industry_audit);
    });
  }

const insert_to_user_management_level_audit =
  "INSERT INTO dbo.user_management_level_audit VALUES(@userID,@management_level_id,1)";
if (management_level_id != null || management_level_id != undefined) {
  management_level_id.map(async item => {
    await poolT
      .request()
      .input("userID", sql.Int, userID)
      .input("management_level_id", sql.Int, item)
      .query(insert_to_user_management_level_audit);
  });
}
   }
    
      
    mail.sendEmail(email, "goupendo@mail.com");
    return user;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  signup,
  login
};
