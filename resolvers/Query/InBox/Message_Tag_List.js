const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const fetch_messages_by_tags = async (
    _,
    { page_size, page_no, messages_tag, search_string },
    ctx
) => {
    const userObj = await authenticate(ctx);
    // const userObj={user_id:2,company_id:2}
    try {
  
        let searching = search_string
        ? " AND (message_subject like '%" +
          search_string +
          "%'" +
          " OR message_body like '%" +
          search_string +
          "%')"
        : "";
      
        let search = search_string ? "where (ms.message_body like '%" + search_string + "%' or ms.message_subject like '%" + search_string + "%' or tc.message_subject like '%" + search_string + "%' or tc.message_body like '%" + search_string + "%')" : ""
       
         let fetch_all_message_query = search_string ? "with tabledon as (  select q.count, ms.sentat,ms.sender_id,m.message_type,m.message_tag,m.message_subject,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id from dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id AND ms.sender_id=@user_id AND m.message_replied_id=0 AND ms.isActive=1 AND ms.isDeleted=0 left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where m.message_replied_id=0 and m.message_tag=@tag and ms.isdeleted=0), tableclash as ( select q.count, mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id,mr.receivedat,m.message_tag from dbo.message  m  left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa      on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where mr.receiver_id=@user_id AND mr.isActive=1 AND m.message_replied_id=0 AND m.message_tag=@tag and mr.isdeleted=0 ) select distinct tc.count,tc.message_type,tc.message_subject,tc.message_body,tc.isRead,tc.isFavourite,tc.message_replied_id,tc.message_id,tc.sentat as createdat,tc.message_tag from tabledon tc left join message ms on ms.message_replied_id=tc.message_id "+ search+ "union all select distinct tc.count,tc.message_type,tc.message_subject,tc.message_body,tc.isRead,tc.isFavourite,tc.message_replied_id,tc.message_id,tc.receivedat as createdat,tc.message_tag from tableclash tc left join message ms on ms.message_replied_id=tc.message_id "+ search :"with tabledon as (  select q.count, ms.sentat,ms.sender_id,m.message_type,m.message_tag,m.message_subject,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id from dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id AND ms.sender_id=@user_id AND m.message_replied_id=0 AND ms.isActive=1 AND ms.isDeleted=0 left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where m.message_replied_id=0 and m.message_tag=@tag and ms.isdeleted=0), tableclash as ( select q.count, mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id,mr.receivedat,m.message_tag from dbo.message  m  left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa      on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where mr.receiver_id=@user_id AND mr.isActive=1 AND m.message_replied_id=0 AND m.message_tag=@tag and mr.isdeleted=0 ) select distinct tc.count,tc.message_type,tc.message_subject,tc.message_body,tc.isRead,tc.isFavourite,tc.message_replied_id,tc.message_id,tc.sentat as createdat,tc.message_tag from tabledon tc left join message ms on ms.message_replied_id=tc.message_id  union all select distinct tc.count,tc.message_type,tc.message_subject,tc.message_body,tc.isRead,tc.isFavourite,tc.message_replied_id,tc.message_id,tc.receivedat as createdat,tc.message_tag from tableclash tc left join message ms on ms.message_replied_id=tc.message_id"
         fetch_all_message_query+=" ORDER BY createdat desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY" ;
        if (page_no > 0) {
            let poolT = await pool;
            const res = await poolT
                .request()
                .input("user_id", sql.Int, userObj.user_id)
                .input("page_size", sql.Int, page_size)
                .input("page_no", sql.Int, page_no)
                .input("tag", sql.Int, messages_tag)
                .query(fetch_all_message_query);
            var count = res.recordset.length;
// console.log("77777777777777777777777777777777777", fetch_all_message_query)
            const messages = res.recordsets[0];
            const messages2 = res.recordsets[1];
            const get_messages_count =
                search_string ?  "with tabledon as (  select q.count, ms.sentat,ms.sender_id,m.message_type,m.message_tag,m.message_subject,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id from dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id AND ms.sender_id=@user_id AND m.message_replied_id=0 AND ms.isActive=1 AND ms.isDeleted=0 left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where m.message_replied_id=0 and m.message_tag=@tag and ms.isdeleted=0  ) , tableclash as ( select q.count, mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id,mr.receivedat,m.message_tag from dbo.message  m   left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa      on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where mr.receiver_id=@user_id AND mr.isActive=1 AND m.message_replied_id=0 AND m.message_tag=@tag and mr.isdeleted=0 ) select sum(messages) as count_of_messages from (select count (tc.message_id) as messages from tabledon tc left join message ms on ms.message_replied_id=tc.message_id "+ search+"  union all select count(tc.message_id) as messages from tableclash tc left join message ms on ms.message_replied_id=tc.message_id "+search + " )x":" with tabledon as (  select q.count, ms.sentat,ms.sender_id,m.message_type,m.message_tag,m.message_subject,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id from dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id AND ms.sender_id=@user_id AND m.message_replied_id=0 AND ms.isActive=1 AND ms.isDeleted=0 left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where m.message_replied_id=0 and m.message_tag=@tag and ms.isdeleted=0  ) , tableclash as ( select q.count, mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id,mr.receivedat,m.message_tag from dbo.message  m   left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa      on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where mr.receiver_id=@user_id AND mr.isActive=1 AND m.message_replied_id=0 AND m.message_tag=@tag and mr.isdeleted=0 ) select sum(messages) as count_of_messages from (select count (tc.message_id) as messages from tabledon tc left join message ms on ms.message_replied_id=tc.message_id    union all select count(tc.message_id) as messages from tableclash tc left join message ms on ms.message_replied_id=tc.message_id )x;";
                    // console.log("************get ,message_count",get_messages_count)
            const reso = await poolT
                .request()
                .input("user_id", sql.Int, userObj.user_id)
                .input("tag", sql.Int, messages_tag)
                .query(get_messages_count);

     
            //********************************************************************** */      MESSAGES COUNT   //********************************************************************** */

            const fetch_sender_name =
                "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@sender_id;";
            //Count of trash messages

            //********************************************************************** */
            const Sent_Message = await Promise.all(
                messages.map(async item => {
                    //****************FETCH NAME OF THE SENDERS*/
                    const respo = await poolT
                        .request()
                        .input("sender_id", sql.Int,userObj.user_id)
                        .query(fetch_sender_name);
// console.log("**sender*****", item.sender_id)
                    //  const rs = await poolT
                    //   .request()
                    //   .input("message_tag", sql.Int, item.message_tag)
                    //   .query(find_tag);

                    return {
                        sender_name:
                            respo.recordset[0].first_name +
                            " " +
                            respo.recordset[0].last_name,
                        sender_mail: respo.recordset[0].email_address,
                        message_subject: item.message_subject,
                        message_body: item.message_body,
                        message_received_date: item.createdat.toString(),
                        isFavourite: item.isFavourite.toJSON().data[0],
                        isRead: item.isRead.toJSON().data[0],
                        message_id: item.message_id,
                        no_of_replies: item.count,
                        
                        // other_receivers: Receivers,
                        message_tag: item.message_tag,
                        message_type: item.message_type
                        // other_receivers:[Receivers],
                        // message_tag_name: rs.recordset[0].message_tag
                    };
                })

                //*********END OF MAP */******************************************** */
            ); //*PROMISE END
            //************************************************************************************************************* */

            // const _Messages = await Promise.all(
            //     messages2.map(async item => {
            //         //****************FETCH NAME OF THE SENDERS*/
            //         const respo = await poolT
            //             .request()
            //             .input("sender_id", sql.Int, userObj.user_id)
            //             .query(fetch_sender_name);

            //         return {
            //             sender_name:
            //                 respo.recordset[0].first_name +
            //                 " " +
            //                 respo.recordset[0].last_name,
            //             sender_mail: respo.recordset[0].email_address,
            //             message_subject: item.message_subject,
            //             message_body: item.message_body,
            //             message_received_date:
            //                 item.receivedat !== null ? item.createdat.toString() : "Null",
            //             isFavourite: item.isFavourite.toJSON().data[0],
            //             isRead: item.isRead.toJSON().data[0],
            //             message_id: item.message_id,
            //             no_of_replies: item.count,
                       
            //             // other_receivers: Receivers,
            //             message_tag: item.message_tag,
            //             message_type: item.message_type
            //             // other_receivers:[Receivers],
            //             // message_tag_name: rs.recordset[0].message_tag
            //         };
            //     })

            //     //*********END OF MAP */******************************************** */
            // );

            // _Messages.map(item => {
            //     Sent_Message.push(item);
            // });

            return {
                messages: Sent_Message,
                // no_of_messages:count
                no_of_messages: reso.recordset[0].count_of_messages

            };
        }
    } catch (err) {
        throw new Error(err);
    }
};

module.exports = {
    fetch_messages_by_tags
};
