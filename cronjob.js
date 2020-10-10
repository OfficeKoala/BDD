const cron = require("node-cron");
const { pool } = require("./utils");
const sql = require("mssql");
const moment = require("moment");

module.exports = {
  cronjob: async () => {
    const poolT = await pool;

    console.log("CronJob ----<<<<<Running>>>>");
    cron.schedule("0 */3 * * *", async () => {
      var date = new Date(Date.now()-3600000)
      var current_Date = moment(moment(date)).format("lll");
      const update_status_query =
        "update dbo.meeting set status=9 where end_date<@currentdate and status!=5 and (status=2 or status=3);";
      await poolT
        .request()
        .input("currentdate", sql.VarChar, current_Date)
        .query(update_status_query);
    });

//Subscription Check CRON
    cron.schedule("0 */12 * * *", async () => {      
      // var newdate = new Date(date);     
    // console.log(date)
      // var current_Date = moment(moment(date)).format("lll");
 const poolT=await pool;
const res=  await poolT
      .request()
      .query("select id,date_of_subscription from dbo.subscription ");
     
      res.recordset.map(async item=>{
         date = new Date(item.date_of_subscription);
         current_Date=new Date(Date.now());
                //  mydate=current_Date.setDate(current_Date.getDate() + 30)
        //  subscription_end_date=new Date(mydate);
             const diffTime = Math.abs(current_Date - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if(diffDays>30){
      await poolT
      .request()
      .input("id",sql.Int,item.id)
      .query("update dbo.subscription set payment_status=0 where id=@id");
    }
         
      })
  
    });


  }
};
