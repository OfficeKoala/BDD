const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const fetch_messages = async (
  _,
  { page_size, page_no, messages_type, isDraft, search_string },
  ctx
) => {
  const userObj = await authenticate(ctx);
  // const userObj={user_id:2,company_id:2}
  let search = search_string
    ? " AND (message_subject like '%" +
      search_string +
      "%'" +
      " OR message_body like '%" +
      search_string +
      "%')"
    : "";
  //InBox Messages

  if (messages_type === 1) {
    try {
      //Subject of message
let searching=" AND (message.message_subject like '%"+search_string+"%' OR message.message_body like '%"+search_string+"%' OR tabledon.message_subject like '%"+search_string+"%' OR tabledon.message_body like '%"+search_string+"%')"
let fetch_message_query= (search_string?("with tabledon as ( SELECT ms.message_replied_id, q.count, ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.message_tag,ms.sender_id,ms.createdat,ms.message_subject FROM dbo.message ms left join dbo.message_receiver_audit ra on ms.message_id=ra.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on ms.message_id= q.message_replied_id where ra.receiver_id=@user_id AND ms.sender_id=1 AND isReceived=1 AND ra.message_type=1 AND ra.isActive=1 and ra.isDeleted=0 and ms.message_replied_id>=0  )select tabledon.message_replied_id,tabledon.count,tabledon.isRead,tabledon.message_id,tabledon.message_body,tabledon.message_tag,tabledon.sender_id,tabledon.createdat,tabledon.message_subject from tabledon left join message on message.message_replied_id=tabledon.message_id where tabledon.message_replied_id NOT IN (select tabledon.message_id from tabledon)  " +searching ):( "with tabledon as ( SELECT ms.message_replied_id, q.count, ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.message_tag,ms.sender_id,ms.createdat,ms.message_subject FROM dbo.message ms left join dbo.message_receiver_audit ra on ms.message_id=ra.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on ms.message_id= q.message_replied_id where ra.receiver_id=@user_id AND ms.sender_id=1 AND isReceived=1 AND ra.message_type=1 AND ra.isActive=1 and ra.isDeleted=0 and ms.message_replied_id>=0  )select tabledon.message_replied_id,tabledon.count,tabledon.isRead,tabledon.message_body,tabledon.message_tag,tabledon.sender_id,tabledon.createdat,tabledon.message_subject,tabledon.message_id from tabledon "))

         fetch_message_query+=" ORDER BY createdat desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY" ;
      
      if (page_no > 0) {
        let poolT = await pool;
        const res = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .query(fetch_message_query);
        var variable = res.recordset.length;
        const messages = res.recordset;
        //sender name of user
        const fetch_sender_name =
          "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@sender_id";

        const get_messages_count =
        search_string?"with tabledon as ( SELECT ms.message_replied_id, q.count, ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.message_tag,ms.sender_id,ms.createdat,ms.message_subject FROM dbo.message ms left join dbo.message_receiver_audit ra on ms.message_id=ra.message_id  left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id   join dbo.message_receiver_audit mra on m.message_id=mra.message_id   where  (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id)   as q on  ms.message_id= q.message_replied_id      where ra.receiver_id=@user_id AND ms.sender_id=1 AND isReceived=1 AND ra.message_type=1 AND ra.isActive=1 and ra.isDeleted=0 and ms.message_replied_id>=0 "+ search+" )select count(message_id) as no_of_messages from tabledon where tabledon.message_replied_id NOT IN (select tabledon.message_id from tabledon)" : "with tabledon as ( SELECT ms.message_replied_id, q.count, ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.message_tag,ms.sender_id,ms.createdat,ms.message_subject FROM dbo.message ms left join dbo.message_receiver_audit ra on ms.message_id=ra.message_id  left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id   join dbo.message_receiver_audit mra on m.message_id=mra.message_id   where  (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id)   as q on  ms.message_id= q.message_replied_id      where ra.receiver_id=@user_id AND ms.sender_id=1 AND isReceived=1 AND ra.message_type=1 AND ra.isActive=1 and ra.isDeleted=0 and ms.message_replied_id=0 "+ search+" )select count(message_id) as no_of_messages from tabledon where tabledon.message_replied_id NOT IN (select tabledon.message_id from tabledon)"

         
        const messageCountResp = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(get_messages_count);
        //********************************************************************** */
  

        const InBox_Messages = await Promise.all(
          messages.map(async item => {
            const senderInfoResp = await poolT
              .request()
              .input("sender_id", sql.Int, item.sender_id)
              .query(fetch_sender_name);
            return {
              sender_name:
                senderInfoResp.recordset[0].first_name +
                " " +
                senderInfoResp.recordset[0].last_name,
              sender_id: item.sender_id,
              sender_mail: senderInfoResp.recordset[0].email_address,
              message_subject: item.message_subject,
              message_body: item.message_body,
              message_received_date: item.createdat.toString(),
              isFavourite:item.isFavourite!==undefined?item.isFavourite.toJSON().data[0]:0,
              isRead:item.isRead!==undefined?item.isRead.toJSON().data[0]:0,
              message_id: item.message_id,
              message_tag: item.message_tag,
              message_type: messages_type,
              isTrail:item.message_replied_id,
              no_of_replies: item.count
            };
          })
        ); //*PROMISE END

        return {
          messages: InBox_Messages,
          // no_of_messages: variable
          no_of_messages: messageCountResp.recordset[0].no_of_messages
        };
      }
    } catch (err) {
      throw new Error(err);
    }
  }
  //*************************************%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%^^^^^^^^^^^^^^^^ */
  else if (messages_type === 4) {
    //FOR SENT MESSAGES
    try {
      const fetch_message_query= (search_string?("with tabledon as ( SELECT ms.message_replied_id,q.count, ms.message_tag,ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ra.message_type,ms.message_subject FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on ms.message_id= q.message_replied_id where ra.sender_id=@user_id AND isSent=1 AND ra.message_type=4 AND ra.isActive=1 and ra.isdeleted=0 and ms.message_replied_id>=0 " +search+ " )select * from tabledon where tabledon.message_replied_id NOT IN (select tabledon.message_id from tabledon)"):("with tabledon as ( SELECT ms.message_replied_id,q.count, ms.message_tag,ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ra.message_type,ms.message_subject FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on ms.message_id= q.message_replied_id where ra.sender_id=@user_id AND isSent=1 AND ra.message_type=4 AND ra.isActive=1 and ra.isdeleted=0 and ms.message_replied_id=0 )select * from tabledon where tabledon.message_replied_id NOT IN (select tabledon.message_id from tabledon) "))+" ORDER BY createdat desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY" ;
      // const fetch_message_query = search_string?
      //   "SELECT ms.message_replied_id,q.count, ms.message_tag,ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ra.message_type,ms.message_subject FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id  left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id   join dbo.message_receiver_audit mra on m.message_id=mra.message_id   where  (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id)   as q on  ms.message_id= q.message_replied_id     where ra.sender_id=@user_id AND isSent=1 AND ra.message_type=4 AND ra.isActive=1 and ra.isdeleted=0 and ms.message_replied_id>=0 " +
      //   search +
      //   " ORDER BY sentat desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY" :"SELECT ms.message_replied_id, q.count, ms.message_tag,ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ra.message_type,ms.message_subject FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id  left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id   join dbo.message_receiver_audit mra on m.message_id=mra.message_id   where  (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id)   as q on  ms.message_id= q.message_replied_id     where ra.sender_id=@user_id AND isSent=1 AND ra.message_type=4 AND ra.isActive=1 and ra.isdeleted=0 and ms.message_replied_id=0 " +
      //   search +
      //   " ORDER BY sentat desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY" ;
 

      if (page_no > 0) {
        let poolT = await pool;
        const res = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .query(fetch_message_query);



        var variable = res.recordset.length;
        const messages = res.recordset;
        const fetch_sender_name =
          "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@sender_id;";

        const get_messages_count =search_string?"with tabledon as ( SELECT ms.message_replied_id,q.count, ms.message_tag,ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ra.message_type,ms.message_subject FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on ms.message_id= q.message_replied_id where ra.sender_id=@user_id AND isSent=1 AND ra.message_type=4 AND ra.isActive=1 and ra.isdeleted=0 and ms.message_replied_id>=0 " +search+ " )select count(message_id) as no_of_messages from tabledon where tabledon.message_replied_id NOT IN (select tabledon.message_id from tabledon)":"with tabledon as ( SELECT ms.message_replied_id,q.count, ms.message_tag,ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ra.message_type,ms.message_subject FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on ms.message_id= q.message_replied_id where ra.sender_id=@user_id AND isSent=1 AND ra.message_type=4 AND ra.isActive=1 and ra.isdeleted=0 and ms.message_replied_id=0 )select count(message_id) as no_of_messages from tabledon where tabledon.message_replied_id NOT IN (select tabledon.message_id from tabledon) "
      
        
        const reso = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(get_messages_count);

    

        //********************************************************************** */
        const InBox_Messages = await Promise.all(
          messages.map(async item => {
            //****************FETCH NAME OF THE SENDERS*/
            const respo = await poolT
              .request()
              .input("sender_id", sql.Int, item.sender_id)
              .query(fetch_sender_name);

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
              sender_id: item.sender_id,
              no_of_replies: item.count,
              isTrail:item.message_replied_id,
              // other_receivers: Receivers,
              message_tag: item.message_tag,
              message_type: item.message_type
              //   message_tag_name: rs.recordset[0].message_tag
            };
          })

          //*********END OF MAP */******************************************** */
        ); //*PROMISE END

        return {
          messages: InBox_Messages,
          no_of_messages: reso.recordset[0].no_of_messages
          // no_of_messages: variable
        };
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  //Trash Messages
  if (messages_type === 3) {
    try {
      const fetch_deleted_message_query =
        "SELECT  q.count, ms.sentat as time_sent,ms.sender_id,m.message_tag,m.message_type ,m.message_subject ,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id   join dbo.message_receiver_audit mra on m.message_id=mra.message_id   where  (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id)   as q on  m.message_id= q.message_replied_id     where ms.sender_id=@user_id AND ms.isDeleted=1 AND ms.isActive=1 " +
        search +
        " UNION ALL SELECT q.count, mr.receivedat as time_sent,mr.receiver_id,m.message_tag ,mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id   join dbo.message_receiver_audit mra on m.message_id=mra.message_id   where  (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id)   as q on  m.message_id= q.message_replied_id     where mr.receiver_id=@user_id AND mr.isDeleted=1 AND mr.isActive=1 " +
        search +
        " ORDER BY time_sent desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY";
      // "select  ms.sentat,ms.sender_id,m.message_tag,m.message_subject,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id from dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id AND ms.sender_id=@user_id AND ms.isDeleted=1 AND ms.isActive=0  ORDER BY ms.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY;select  m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id,mr.receivedat,m.message_tag from dbo.message m left join dbo.message_receiver_audit mr on m.message_id=mr.message_id where mr.receiver_id=@user_id AND mr.isDeleted=1 AND mr.isActive=0 ORDER BY mr.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY;";

      if (page_no > 0) {
        let poolT = await pool;
        const res = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .query(fetch_deleted_message_query);
        var variable = res.recordset.length;
        const messages = res.recordsets[0];

        //********************************************************************** */      MESSAGES COUNT IN TRASH //********************************************************************** */

        const get_messages_count =
          "select Sum(trashedmessages) as no_of_messages from ( select count(m.message_id) as trashedmessages from dbo.message m  join dbo.message_receiver_audit mr on m.message_id=mr.message_id where mr.receiver_id=@user_id AND mr.isDeleted=1 AND mr.isActive=1 " +
          search +
          " UNION ALL select count(m.message_id) as trashedmessages from dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id where ms.sender_id=@user_id AND ms.isDeleted=1 AND ms.isActive=1 " +
          search +
          ") x";
        const reso = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(get_messages_count);

        //********************************************************************** */      MESSAGES COUNT IN TRASH END   //********************************************************************** */

        const fetch_sender_name =
          "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@sender_id;";
        //Count of trash messages

        // const get_all_receivers =
        //     "SELECT distinct receiver_id from dbo.message_receiver_audit Where message_id=@message_id ;";

        //********************************************************************** */
        const Trash_Messages = await Promise.all(
          messages.map(async item => {
            //****************FETCH NAME OF THE SENDERS*/
            const respo = await poolT
              .request()
              .input("sender_id", sql.Int, item.sender_id)
              .query(fetch_sender_name);

            if (respo.recordset[0].first_name) {
              respo.recordset[0];
            }

            return {
              sender_name:
                respo.recordset[0].first_name +
                " " +
                respo.recordset[0].last_name,
              sender_mail: respo.recordset[0].email_address,
              message_subject: item.message_subject,
              message_body: item.message_body,
              message_received_date: item.time_sent.toString(),
              isFavourite: item.isFavourite.toJSON().data[0],
              isRead: item.isRead.toJSON().data[0],
              message_id: item.message_id,
              // other_receivers: Receivers,
              message_tag: item.message_tag,
              message_type: item.message_type,
              no_of_replies: item.count
              // message_tag_name: rs.recordset[0].message_tag
            };
          })

          //*********END OF MAP */******************************************** */
        );
        return {
          messages: Trash_Messages,
          no_of_messages: reso.recordset[0].no_of_messages
          // no_of_messages: variable
        };
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  if (messages_type === 2) {
    //For Drafts
    try {
      const fetch_message_query =
        "SELECT ms.message_replied_id, ms.message_tag,ra.isRead,ra.message_type,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ms.message_subject FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id  where ra.sender_id=@user_id AND isSent=0 AND ra.message_type=2 AND ra.isActive=1 and ra.isdeleted=0  " +
        search +
        " ORDER BY ms.createdat desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY";

      if (page_no > 0) {
        let poolT = await pool;
        const res = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .query(fetch_message_query);
        var variable = res.recordset.length;
        const messages = res.recordset;
        const get_messages_count =
          "SELECT COUNT(ms.message_id) as no_of_messages FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id  where ra.sender_id=@user_id AND isSent=0 AND ra.message_type=2 AND ra.isActive=1 and ra.isdeleted=0  " +
          search +
          " ";
        const reso = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(get_messages_count);
        InBox_Messages = messages.map(item => {
          return {
            message_subject: item.message_subject,
            message_body: item.message_body,
            message_received_date: item.createdat.toString(),
            isFavourite: item.isFavourite.toJSON().data[0],
            isRead: item.isRead.toJSON().data[0],
            message_id: item.message_id,
            receiver_id: item.receiver_id,
            message_tag: item.message_tag,
            sender_id: item.sender_id,
            message_type: item.message_type,
            isTrail:item.message_replied_id
          };
        });

        return {
          messages: InBox_Messages,
          no_of_messages: reso.recordset[0].no_of_messages
          // no_of_messages: variable
        };
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  //***************************** FAVOURITE MESSAGES*/
  if (messages_type === 5) {
    try {
  // var searching= 
  // search_string
  //   ? " where (message_subject like '%" +
  //     search_string +
  //     "%'" +
  //     " OR message_body like '%" +
  //     search_string +
  //     "%')"
  //   : "";

    var searching =   "where (t.message_subject like '%"+ search_string+ "%'"+" or t.message_body like '%" + search_string+ "%'"+" or m.message_subject like '%" + search_string+"%'"+" or m.message_body like '%"+ search_string +"%')"
     
    let fetch_fav_message_query =search_string?"with tabledon as(SELECT q.count,ms.sentat as time_sent,ms.sender_id ,m.message_tag,ms.message_type,m.message_subject ,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where ms.sender_id=@user_id AND ms.isFavourite=1 AND ms.isActive=1 and ms.isDeleted=0  UNION ALL SELECT q.count, mr.receivedat as time_sent,mr.receiver_id,m.message_tag,mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where mr.receiver_id=@user_id AND mr.isFavourite=1 AND mr.isActive=1 and mr.isDeleted=0  )select distinct t.message_id,t.message_type,t.message_subject,t.message_body,t.message_tag, t.time_sent, t.sender_id,t.isRead, t.isFavourite from tabledon t left join message m on t.message_id=m.message_replied_id " + searching : "with tabledon as(SELECT q.count,ms.sentat as time_sent,ms.sender_id ,m.message_tag,ms.message_type,m.message_subject ,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where ms.sender_id=@user_id AND ms.isFavourite=1 AND ms.isActive=1 and ms.isDeleted=0 UNION ALL SELECT q.count, mr.receivedat as time_sent,mr.receiver_id,m.message_tag,mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where mr.receiver_id=@user_id AND mr.isFavourite=1 AND mr.isActive=1 and mr.isDeleted=0  ) select distinct t.message_id,t.message_type,t.message_subject,t.message_body,t.message_tag, t.time_sent,t.sender_id,t.isRead, t.isFavourite from tabledon t "
    fetch_fav_message_query=fetch_fav_message_query+"ORDER BY t.time_sent desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY"  
    
    // "SELECT q.count,ms.sentat as time_sent,ms.sender_id ,m.message_tag,ms.message_type,m.message_subject ,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id   join dbo.message_receiver_audit mra on m.message_id=mra.message_id   where  (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id)   as q on  m.message_id= q.message_replied_id     where ms.sender_id=@user_id AND ms.isFavourite=1 AND ms.isActive=1 and ms.isDeleted=0 " +
        // search +
        // " UNION ALL SELECT  q.count, mr.receivedat as time_sent,mr.receiver_id,m.message_tag,mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id   join dbo.message_receiver_audit mra on m.message_id=mra.message_id   where  (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id)   as q on  m.message_id= q.message_replied_id     where mr.receiver_id=@user_id AND mr.isFavourite=1 AND mr.isActive=1  and mr.isDeleted=0" +
        // search +
        // " ORDER BY time_sent desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY";
      // "select  ms.sentat,ms.sender_id,m.message_tag,m.message_subject,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id from dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id where ms.sender_id=@user_id AND ms.isFavourite=1 AND ms.isActive=1  ORDER BY ms.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY;select  m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id,mr.receivedat,m.message_tag from dbo.message m left join dbo.message_receiver_audit mr on m.message_id=mr.message_id where mr.receiver_id=@user_id AND mr.isFavourite=1 AND mr.isActive=1  ORDER BY mr.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY;";

      if (page_no > 0) {
        let poolT = await pool;
        const res = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .query(fetch_fav_message_query);
        


        const messages = res.recordsets[0];
        var count_of_messages = res.recordset.length;
        
        //********************************************************************** */      MESSAGES COUNT IN TRASH //********************************************************************** */

        const get_messages_count = search_string?"with tabledon as(SELECT q.count,ms.sentat as time_sent,ms.sender_id ,m.message_tag,ms.message_type,m.message_subject ,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where ms.sender_id=@user_id AND ms.isFavourite=1 AND ms.isActive=1 and ms.isDeleted=0  UNION ALL SELECT q.count, mr.receivedat as time_sent,mr.receiver_id,m.message_tag,mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where mr.receiver_id=@user_id AND mr.isFavourite=1 AND mr.isActive=1 and mr.isDeleted=0  )select distinct count(t.message_id) as no_of_messages from tabledon t left join message m on t.message_id=m.message_replied_id " + searching : "with tabledon as(SELECT q.count,ms.sentat as time_sent,ms.sender_id ,m.message_tag,ms.message_type,m.message_subject ,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where ms.sender_id=@user_id AND ms.isFavourite=1 AND ms.isActive=1 and ms.isDeleted=0 UNION ALL SELECT q.count, mr.receivedat as time_sent,mr.receiver_id,m.message_tag,mr.message_type,m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id FROM dbo.message m left join dbo.message_receiver_audit mr on m.message_id=mr.message_id left join ( SELECT count(message_replied_id) as count,message_replied_id FROM dbo.message m join dbo.message_sender_audit msa on m.message_id=msa.message_id join dbo.message_receiver_audit mra on m.message_id=mra.message_id where (mra.receiver_id=@user_id or msa.sender_id=@user_id) and m.message_replied_id>0 group by m.message_replied_id) as q on m.message_id= q.message_replied_id where mr.receiver_id=@user_id AND mr.isFavourite=1 AND mr.isActive=1 and mr.isDeleted=0  ) select distinct count(t.message_id) as no_of_messages from tabledon t "

        const reso = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(get_messages_count);

        //********************************************************************** */      MESSAGES COUNT IN TRASH END   //********************************************************************** */

        const fetch_sender_name =
          "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@sender_id;";
        //Count of trash messages

        //********************************************************************** */
        const favourite_messages = await Promise.all(
          messages.map(async item => {
            //****************FETCH NAME OF THE SENDERS*/
            const respo = await poolT
              .request()
              .input("sender_id", sql.Int, item.sender_id)
              .query(fetch_sender_name);
            if (respo.recordset[0].first_name) {
              respo.recordset[0];
            }

            

            return {
              sender_name:
                respo.recordset[0].first_name +
                " " +
                respo.recordset[0].last_name,
              sender_mail: respo.recordset[0].email_address,
              message_subject: item.message_subject,
              message_body: item.message_body,
              message_received_date: item.time_sent.toString(),
              isFavourite: item.isFavourite.toJSON().data[0],
              isRead: item.isRead.toJSON().data[0],
              message_id: item.message_id,
              sender_id: item.sender_id[0],
              // other_receivers: Receivers,
              message_tag: item.message_tag,
              message_type: item.message_type,
              isTrail:item.message_replied_id,
              no_of_replies: item.count
              // message_tag_name: rs.recordset[0].message_tag
            };
          })

          //*********END OF MAP */******************************************** */
        ); //*PROMISE END

        return {
          messages:favourite_messages,
          no_of_messages: reso.recordset[0].no_of_messages
          // no_of_messages: count_of_messages
        };
      }
    } catch (err) {
      throw new Error(err);
    }
  }
};

module.exports = {
  fetch_messages
};
