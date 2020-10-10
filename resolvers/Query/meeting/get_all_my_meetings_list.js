const {
    pool
} = require("../../../utils");
const sql = require("mssql");
const {
    authenticate
} = require("../../../utils");
const {server_ip}= require("../../../config/index")
const ip = require('ip');
const get_all_my_meetings_list = async (
    _, {
        page_size,
        page_no,
        startdate,
        enddate

    },
    ctx
) => {
    const userObj = await authenticate(ctx);
    // const userObj ={user_id:30, company_id:8}


    // console.log("==============>START DATE",startdate.toDateString())
    // console.log("==============>END DATE",enddate.toDateString())

    let poolT = await pool

    try {

        let filter_start_date = ((startdate !== undefined) && (startdate != "")) ? ("   m.start_date >= '" + startdate + "' and ") : " ";
        let filter_end_date = ((enddate !== undefined) && (enddate != "")) ? (((filter_start_date !== undefined) && (filter_start_date !== " ")) ? "   m.end_date <= '" + enddate : "  m.end_date <= '" + enddate) + "' and " : " ";


        const get_my_meetings = "select comp.company_name,comp.company_website,m.user_id,dmu.user_id as dm_id,m.requested_on,m.start_date,m.start_time,m.end_Date,m.meeting_id,m.end_time,m.duration,m.twilio_cred,m.remarks ,concat(s.first_name,' ', s.last_name) as name,m.status,dmu.dm_description,dmu.dm_charity_amount, s.image_url ,dmu.dm_hours_per_month from dbo.meeting m left join meeting__participant_audit mpa on m.meeting_id =mpa.meeting_id and m.user_id !=mpa.user_id left join dbo.security_user s on s.user_id=mpa.user_id  and s.is_decision_maker=1 left join dbo.decision_maker_user dmu on dmu.user_id=s.user_id left join dbo.company comp on comp.company_id=s.company_id where " + filter_start_date + filter_end_date + "   m.user_id=@user_id ORDER BY m.requested_on desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY"
    

      
    
        const response = await poolT
            .request()
            .input("user_id", sql.Int, userObj.user_id)
            .input("page_size", sql.Int, page_size)
            .input("page_no", sql.Int, page_no)
            .query(get_my_meetings)

 

        const get_no_of_meetings = "select count(m.user_id) as no_of_meets  from dbo.meeting m left join meeting__participant_audit mpa on m.meeting_id =mpa.meeting_id and m.user_id !=mpa.user_id left join dbo.security_user s on s.user_id=mpa.user_id  and s.is_decision_maker=1 left join dbo.decision_maker_user dmu on dmu.user_id=s.user_id left join dbo.company comp on comp.company_id=s.company_id where " + filter_start_date + filter_end_date + " m.user_id=@user_id "
   
        const response_count = await poolT
            .request()
            .input("user_id", sql.Int, userObj.user_id)
            .query(get_no_of_meetings)

           

       


        const my_all_meetings = await Promise.all(response.recordset.map(async item => {

            return {
                user_id: item.user_id,
                dm_id: item.dm_id,
                requested_on: item.requested_on !== null ? item.requested_on.toDateString() : 0,
                start_date: item.start_date !== null ? item.start_date.toDateString() : 0,
     
                start_time : (item.start_time!=null?
                    (item.start_time.getUTCHours()>12? 
                    ((item.start_time.getUTCHours()-12)>=10?item.start_time.getUTCHours()-12:"0"+(item.start_time.getUTCHours()-12))+":"+(item.start_time.getUTCMinutes()>=10?item.start_time.getUTCMinutes():"0"+item.start_time.getUTCMinutes())+" "+ "PM"+ " "+ "UTC"
                    
                    : (item.start_time.getUTCHours()==12?   item.start_time.getUTCHours()+":"+(item.start_time.getUTCMinutes()>=10?item.start_time.getUTCMinutes():"0"+item.start_time.getUTCMinutes())+" "+ "PM"+ " "+ "UTC"     
                    :   (item.start_time.getUTCHours()==0 ?    item.start_time.getUTCHours()+12+":"+(item.start_time.getUTCMinutes()>=10?item.start_time.getUTCMinutes():"0"+item.start_time.getUTCMinutes())+ " "+ "AM"+ " "+ "UTC  "               
                    :   (item.start_time.getUTCHours()>=10?item.start_time.getUTCHours():"0"+item.start_time.getUTCHours())+":"+(item.start_time.getUTCMinutes()>=10?item.start_time.getUTCMinutes():"0"+item.start_time.getUTCMinutes())+ " "+ "AM"+ " "+ "UTC " )          
                    
                    
                     )    
                      )
                    :0),
                // start_time :(item.start_time!=null?
                //     (item.start_time.getUTCHours()>12? 
                //     ("0"+item.start_time.getUTCHours()-12).slice(-2)+":"+("0"+item.start_time.getUTCMinutes()).slice(-2)+ " "+ "PM"+ " "+ "UTC"
                    
                //     : (item.start_time.getUTCHours()==12?  ("0"+ item.start_time.getUTCHours()).slice(-2)+":"+("0"+item.start_time.getUTCMinutes()).slice(-2)+ " "+ "PM"+ " "+ "UTC"     
                //     :   (item.start_time.getUTCHours()==0 ?    ("0"+item.start_time.getUTCHours()+12).slice(-2)+":"+("0"+item.start_time.getUTCMinutes()).slice(-2)+ " "+ "AM"+ " "+ "UTC"                 
                //     :   ("0"+item.start_time.getUTCHours()).slice(-2)+":"+("0"+item.start_time.getUTCMinutes()).slice(-2)+ " "+ "AM"+ " "+ "UTC " )          
                    
                    
                //      )    
                //       )
                //     :0) ,
                end_Date: item.end_Date != null ? item.end_Date.toDateString() : 0,
                meeting_id: item.meeting_id,
                status:item.status,
                end_time :(item.end_time!=null?
                    (item.end_time.getUTCHours()>12? 
                    (item.end_time.getUTCHours()-12>=10?item.end_time.getUTCHours()-12:"0"+(item.end_time.getUTCHours()-12))+":"+(item.end_time.getUTCMinutes()>=10?item.end_time.getUTCMinutes():"0"+item.end_time.getUTCMinutes())+ " "+ "PM"+ " "+ "UTC"
                    
                    : (item.end_time.getUTCHours()==12?   item.end_time.getUTCHours()+":"+(item.end_time.getUTCMinutes()>=10?item.end_time.getUTCMinutes():"0"+item.end_time.getUTCMinutes())+" "+ "PM"+ " "+ "UTC"     
                    :   (item.end_time.getUTCHours()==0 ?    item.end_time.getUTCHours()+12+":"+(item.end_time.getUTCMinutes()>=10?item.end_time.getUTCMinutes():"0"+item.end_time.getUTCMinutes())+ " "+ "AM"+ " "+ "UTC"                 
                    :   (item.end_time.getUTCHours()>=10?item.end_time.getUTCHours():"0"+item.end_time.getUTCHours())+":"+(item.end_time.getUTCMinutes()>=10?item.end_time.getUTCMinutes():"0"+item.end_time.getUTCMinutes())+ " "+ "AM"+ " "+ "UTC " )          
                    
                    
                     )    
                      )
                    :0),
                // end_time :(item.end_time!=null?
                //     (item.end_time.getUTCHours()>12? 
                //     (("0"+(item.end_time.getUTCHours()-12)).slice(-2))+":"+(("0"+(item.end_time.getUTCMinutes())).slice(-2))+ " "+ "PM"+ " "+ "UTC"
                    
                //     : (item.end_time.getUTCHours()==12?  (("0"+( item.end_time.getUTCHours())).slice(-2))+":"+(("0"+(item.end_time.getUTCMinutes())).slice(-2))+ " "+ "PM"+ " "+ "UTC"     
                //     :   (item.end_time.getUTCHours()==0 ?    (("0"+(item.end_time.getUTCHours()+12)).slice(-2))+":"+(("0"+(item.end_time.getUTCMinutes())).slice(-2))+ " "+ "AM"+ " "+ "UTC"                 
                //     :   (("0"+(item.end_time.getUTCHours())).slice(-2))+":"+(("0"+(item.end_time.getUTCMinutes())).slice(-2))+ " "+ "AM"+ " "+ "UTC " )          
                    
                    
                //      )    
                //       )
                //     :0) ,
                          
                duration: item.duration,
                twilio_cred: item.twilio_cred,
                remarks: item.remarks,
                name: item.name,
                status: item.status,
                dm_description: item.dm_description,
                dm_charity_amount: item.dm_charity_amount,
                dm_hours_per_month: item.dm_hours_per_month,
                company: item.company_name,
                company_website:item.company_website,
                image_url:(item.image_url!=null)?"https://"+ server_ip+"/profilepic?im_path="+item.image_url:"" ,
            }


        }))



        return {
            meetings_all: my_all_meetings,
            no_of_meets: response_count.recordset[0].no_of_meets
        };







    }
    catch (err) {
        throw new Error(err);
    }



}

module.exports = {
    get_all_my_meetings_list
};