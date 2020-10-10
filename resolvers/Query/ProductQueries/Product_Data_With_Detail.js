const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
var moment = require("moment"); //for time in moment
const product_charity_and_pending_meeting_data = async (
  _,
  { flag },
  ctx
) => {
  const poolT = await pool;
 const userObj= await authenticate(ctx)

 

  try {
    if (flag === 1) {
        const get_charity_raised_by_product =   "select top 5 c.company_name,m.product_id,su.company_id,mpa.user_id as dm_id,m.start_time,m.start_time,m.meeting_id,m.status,m.charity_amount from meeting m join meeting__participant_audit mpa on m.meeting_id=mpa.meeting_id join security_user su on mpa.user_id=su.user_id join company c on c.company_id=su.company_id  where m.user_id=@user_id and mpa.User_id not in (@user_id) order by start_date desc"
        const response = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .query(get_charity_raised_by_product);
    
        const all_pending_meetings_data = response.recordset.map(async item => {
            const get_name_of_dm= "SELECT concat(su.first_name,' ',su.last_name) as decision_maker_name from dbo.security_user su left join meeting__participant_audit mpa on mpa.user_id=su.user_id and su.is_decision_maker=1 where meeting_id=@meeting_id"
            const res= await poolT.request()
            .input("meeting_id",sql.Int, item.meeting_id)
            .query(get_name_of_dm)
            
            
            const charity_query= " Select c.org_name  as charity_name  from dbo.charity_audit ca left join dbo.security_user s on s.user_id= ca.dm_user_id left join dbo.charities c on c.org_id= ca.org_id left join meeting m  on m.user_id=s.user_id where s.user_id=@item union all  select dco.organisation_name as charity_name from dbo.dm_charity_organisation dco left join dbo.security_user s on s.user_id= dco.dm_id left join meeting m on m.user_id= s.user_id where s.user_id=@item"
            const response=await poolT
            .request()
          .input("item", sql.Int,item.dm_id)
          .query(charity_query)
        
         
          const charity_name= response.recordset?response.recordset.map(e=>e.charity_name).join(','):null;

            return {
              company_name: item.company_name,
              product_id: item.product_id,
              decision_maker_name: res.recordset[0].decision_maker_name,
              company_id: item.company_id,
              dm_id: item.dm_id,
              meeting_id: item.meeting_id,
              status: item.status,
              charity_amount: item.charity_amount,
         
              charity_name:charity_name,
    
              start_date:
              item.start_date != null
                ? moment(item.start_date.toUTCString()).format("lll")
                : 0,
  
           
              start_time: (item.end_date?item.start_time.toTimeString():0)
            };
          });


      return { charity_raised_data: all_pending_meetings_data };
    } 
    
    if(flag===2)
    {
      const get_pending_meetings_of_product =
        "select TOP 5 c.company_name,m.product_id,su.company_id ,mpa.user_id as dm_id, m.user_id,m.meeting_id,m.status,m.charity_amount,m.start_date,m.start_time from dbo.meeting m left join dbo.meeting__participant_audit mpa on mpa.meeting_id=m.meeting_id left join dbo.security_user su on su.user_id=mpa.user_id left join dbo.company c on c.company_id=su.company_id where su.user_id=@user_id and m.status<5 order by start_date desc";
      const response = await poolT
        .request()
        .input("user_id", sql.Int, userObj.user_id)
        .query(get_pending_meetings_of_product);


       
      const all_pending_meetings_data = response.recordset.map(async item => {
        const get_name_of_dm= "SELECT concat(su.first_name,' ',su.last_name) as decision_maker_name from dbo.security_user su left join meeting__participant_audit mpa on mpa.user_id=su.user_id and su.is_decision_maker=1 where meeting_id=@meeting_id"
        const res= await poolT.request()
        .input("meeting_id",sql.Int, item.meeting_id)
        .query(get_name_of_dm)
      
        const charity_query= " Select c.org_name  as charity_name  from dbo.charity_audit ca left join dbo.security_user s on s.user_id= ca.dm_user_id left join dbo.charities c on c.org_id= ca.org_id left join meeting m  on m.user_id=s.user_id where s.user_id=@item union all  select dco.organisation_name as charity_name from dbo.dm_charity_organisation dco left join dbo.security_user s on s.user_id= dco.dm_id left join meeting m on m.user_id= s.user_id where s.user_id=@item"
        const reso=await poolT
        .request()
       .input("item", sql.Int,item.dm_id)
       .query(charity_query)
       
       const charity_name= reso.recordset?reso.recordset.map(e=>e.charity_name).join(','):null;
        return {
          company_name: item.company_name,
          product_id: item.product_id,
          decision_maker_name: res.recordset[0].decision_maker_name,
          company_id: item.company_id,
          dm_id: item.dm_id,
          meeting_id: item.meeting_id,
          status: item.status,
          charity_amount: item.charity_amount,
          charity_name:charity_name,


          start_date:
              item.start_date != null
                ? moment(item.start_date.toUTCString()).format("lll")
                : 0,
  
           
           
          start_time: (item.end_date?item.start_time.toTimeString():0)
        };
      });

      return { pending_meeting_data: all_pending_meetings_data };
    }

    if(flag===3)
    {
      const get_success_meeting_of_product= "select TOP 5 c.company_name,m.product_id,su.company_id ,mpa.user_id as dm_id, m.user_id,m.meeting_id,m.status,m.charity_amount,m.start_date,m.start_time from dbo.meeting m left join dbo.meeting__participant_audit mpa on mpa.meeting_id=m.meeting_id left join dbo.security_user su on su.user_id=mpa.user_id left join dbo.company c on c.company_id=su.company_id where su.user_id=@user_id and m.status=2  order by start_date desc"
    
      const response = await poolT
      .request()
      .input("user_id", sql.Int, userObj.user_id)
      .query(get_success_meeting_of_product);
      
    
      const all_success_data= response.recordset.map(async item=>
        {
            const get_name_of_dm= "SELECT concat(su.first_name,' ',su.last_name) as decision_maker_name from dbo.security_user su left join meeting__participant_audit mpa on mpa.user_id=su.user_id and su.is_decision_maker=1 where meeting_id=@meeting_id"
            const res= await poolT.request()
            .input("meeting_id",sql.Int, item.meeting_id)
            .query(get_name_of_dm)  
          
            const charity_query= " Select c.org_name  as charity_name  from dbo.charity_audit ca left join dbo.security_user s on s.user_id= ca.dm_user_id left join dbo.charities c on c.org_id= ca.org_id left join meeting m  on m.user_id=s.user_id where s.user_id=@item union all  select dco.organisation_name as charity_name from dbo.dm_charity_organisation dco left join dbo.security_user s on s.user_id= dco.dm_id left join meeting m on m.user_id= s.user_id where s.user_id=@item"
            const response=await poolT
            .request()
           .input("item", sql.Int,item.dm_id)
           .query(charity_query)
     
           const charity_name= response.recordset?response.recordset.map(e=>e.charity_name).join(','):null;
           return{

            company_name: item.company_name,
          product_id: item.product_id,
          decision_maker_name: res.recordset[0].decision_maker_name,
          company_id: item.company_id,
          dm_id: item.dm_id,
          meeting_id: item.meeting_id,
          status: item.status,
          charity_amount: item.charity_amount,
          charity_name:charity_name,
          start_date:
          item.start_date != null
            ? moment(item.start_date.toUTCString()).format("lll")
            : 0,

 
          }

        })
      
    return {success_meeting_data:all_success_data}

    }
  } catch (error) {
    throw new Error(error)
  }
};

module.exports = {
    product_charity_and_pending_meeting_data
};
