const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
var moment = require("moment"); //for time in moment
const product_charity_and_pending_meeting_details = async (
  _,
  { flag, product_id },
  ctx
) => {
  const poolT = await pool;

  try {
    if (flag === 1) {
      const get_charity_raised_by_product =
        "select c.company_name,m.product_id,concat(su.first_name,' ',su.last_name) as decision_maker_name,su.company_id ,mpa.user_id as dm_id, m.user_id,m.meeting_id,m.status,m.charity_amount from dbo.meeting m left join dbo.meeting__participant_audit mpa on mpa.meeting_id=m.meeting_id left join dbo.security_user su on su.user_id=mpa.user_id left join dbo.company c on c.company_id=su.company_id where m.product_id=@product_id and su.is_decision_maker=1";
     
        const response = await poolT
        .request()
        .input("product_id", sql.Int, product_id)
        .query(get_charity_raised_by_product);
    
        const detail=response.recordset.map(async item=>{
          const charity_query= " Select c.org_name  as charity_name  from dbo.charity_audit ca left join dbo.security_user s on s.user_id= ca.dm_user_id left join dbo.charities c on c.org_id= ca.org_id left join meeting m  on m.user_id=s.user_id where s.user_id=@item union all  select dco.organisation_name as charity_name from dbo.dm_charity_organisation dco left join dbo.security_user s on s.user_id= dco.dm_id left join meeting m on m.user_id= s.user_id where s.user_id=@item"
        const reso=await poolT
          .request()
        .input("item", sql.Int,item.dm_id)
        .query(charity_query)
       
        
        var charity_name= reso.recordset?reso.recordset.map(e=>e.charity_name).join(','):null
      return { 
        company_name: item.company_name,
        product_id: item.product_id,
        decision_maker_name: item.decision_maker_name,
        company_id: item.company_id,
        dm_id: item.dm_id,
        meeting_id: item.meeting_id,
        status: item.status,
        charity_amount: item.charity_amount,
        charity_name:charity_name 
       };
    })
    return { charity_raised_data: detail };
  } 
    
    if(flag===2)
    {
      const get_pending_meetings_of_product =
        "select c.company_name,m.product_id,concat(su.first_name,' ',su.last_name) as decision_maker_name,su.company_id ,mpa.user_id as dm_id, m.user_id,m.meeting_id,m.status,m.charity_amount,m.start_date,m.start_time from dbo.meeting m left join dbo.meeting__participant_audit mpa on mpa.meeting_id=m.meeting_id left join dbo.security_user su on su.user_id=mpa.user_id left join dbo.company c on c.company_id=su.company_id where m.product_id=@product_id and su.is_decision_maker=1 and m.status<5";
      const response = await poolT
        .request()
        .input("product_id", sql.Int, product_id)
        .query(get_pending_meetings_of_product);

      const all_pending_meetings_data = response.recordset.map(async item => {
        const charity_query= " Select c.org_name  as charity_name  from dbo.charity_audit ca left join dbo.security_user s on s.user_id= ca.dm_user_id left join dbo.charities c on c.org_id= ca.org_id left join meeting m  on m.user_id=s.user_id where s.user_id=@item union all  select dco.organisation_name as charity_name from dbo.dm_charity_organisation dco left join dbo.security_user s on s.user_id= dco.dm_id left join meeting m on m.user_id= s.user_id where s.user_id=@item"
        const reso=await poolT
        .request()
      .input("item", sql.Int,item.dm_id)
      .query(charity_query)
      var charity_name= reso.recordset?reso.recordset.map(e=>e.charity_name).join(','):null
        return {
          company_name: item.company_name,
          product_id: item.product_id,
          decision_maker_name: item.decision_maker_name,
          company_id: item.company_id,
          dm_id: item.dm_id,
          meeting_id: item.meeting_id,
          status: item.status,
          charity_amount: item.charity_amount,
     

          start_date:
          item.start_date != null
            ? moment(item.start_date.toUTCString()).format("lll")
            : 0,

           
          start_time: (item.end_date?item.start_time.toTimeString():0),
          charity_name:charity_name
        };
      });

      return { pending_meeting_data: all_pending_meetings_data };
    }

    if(flag===3)
    {
      const get_success_meeting_of_product= "select c.company_name,m.product_id,concat(su.first_name,' ',su.last_name) as decision_maker_name,su.company_id ,mpa.user_id as dm_id, m.user_id,m.meeting_id,m.status,m.charity_amount,m.start_date,m.start_time from dbo.meeting m left join dbo.meeting__participant_audit mpa on mpa.meeting_id=m.meeting_id left join dbo.security_user su on su.user_id=mpa.user_id left join dbo.company c on c.company_id=su.company_id where m.product_id=@product_id and su.is_decision_maker=1 and m.status=2"
    
      const response = await poolT
      .request()
      .input("product_id", sql.Int, product_id)
      .query(get_success_meeting_of_product);

      const all_success_data= response.recordset.map(async item=>
        {
          const charity_query= " Select c.org_name  as charity_name  from dbo.charity_audit ca left join dbo.security_user s on s.user_id= ca.dm_user_id left join dbo.charities c on c.org_id= ca.org_id left join meeting m  on m.user_id=s.user_id where s.user_id=@item union all  select dco.organisation_name as charity_name from dbo.dm_charity_organisation dco left join dbo.security_user s on s.user_id= dco.dm_id left join meeting m on m.user_id= s.user_id where s.user_id=@item"
            const response=await poolT
            .request()
          .input("item", sql.Int,item.dm_id)
          .query(charity_query)
          var charity_name= response.recordset?response.recordset.map(e=>e.charity_name).join(','):null
          
          return{

            company_name: item.company_name,
          product_id: item.product_id,
          decision_maker_name: item.decision_maker_name,
          company_id: item.company_id,
          dm_id: item.dm_id,
          meeting_id: item.meeting_id,
          status: item.status,
          charity_amount: item.charity_amount,
          charity_name:charity_name,
          start_date:
          item.start_date !== null
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
  product_charity_and_pending_meeting_details
};
