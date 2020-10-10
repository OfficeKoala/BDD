const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const fetch_messages = async (
  _,
  { page_size, page_no, messages_type },
  ctx
) => {
  const userObj = await authenticate(ctx); 

  //InBox Messages
  if (messages_type === 1) {
    try {
      const fetch_message_query =
        "SELECT ms.message_tag,ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ms.message_subject FROM dbo.message ms left join dbo.message_receiver_audit ra on ms.message_id=ra.message_id   where ra.receiver_id=@user_id AND ms.sender_id=1 AND isReceived=1 AND ra.message_type=1 AND ra.isActive=1 and ms.message_replied_id=0 ORDER BY ms.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY";
      // console.log("********",query)
      if (page_no > 0) {
        let poolT = await pool;
        const res = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .query(fetch_message_query);

        const messages = res.recordset;

        const fetch_sender_name =
          "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@sender_id;";

        const get_messages_count =
          "SELECT COUNT(ra.message_id) as no_of_messages FROM dbo.message ms left join dbo.message_receiver_audit ra on ms.message_id=ra.message_id   where ra.receiver_id=@user_id AND ms.sender_id=1 AND isReceived=1 AND ra.message_type=1 AND ra.isActive=1 and ms.message_replied_id=0;";
        const reso = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(get_messages_count);

        const get_all_receivers =
          "SELECT distinct receiver_id from dbo.message_receiver_audit Where message_id=@message_id ;";

        const get_all_replies =
          "SELECT  message_subject,message_body,message_id,createdat,sender_id from dbo.message where message_replied_id=@ms_id ORDER BY createdat  ;SELECT count(message_id) as no_of_replies from dbo.message where message_replied_id=@ms_id";

        const get_sender_replies =
          "select first_name,last_name,user_name,email_address from dbo.security_user u where u.user_id=@user_id";

        //********************************************************************** */
        const InBox_Messages = await Promise.all(
          messages.map(async item => {
            const ras = await poolT
              .request()
              .input("ms_id", sql.Int, item.message_id)
              .query(get_all_replies); //CURRENTLY WORKING HERE

            let resultss;
            const Replies = await Promise.all(
              ras.recordsets[0].map(async item => {
                resultss = await poolT
                  .request()
                  .input("user_id", sql.Int, item.sender_id)
                  .query(get_sender_replies);

                return {
                  message_subject: item.message_subject,
                  message_body: item.message_body,
                  message_id: item.message_id,
                  createdat: item.createdat.toString(),
                  sender_details: resultss.recordsets[0]
                };
              })
            );

            //****************FETCH NAME OF THE SENDERS*/
            const respo = await poolT
              .request()
              .input("sender_id", sql.Int, item.sender_id)
              .query(fetch_sender_name);

            //***************************************** */

            resp = await poolT
              .request()
              .input("message_id", sql.Int, item.message_id)
              .query(get_all_receivers);

            Receivers = await Promise.all(
              resp.recordset.map(async elem => {
                ress = await poolT
                  .request()
                  .input("receiver_id", sql.Int, elem.receiver_id)
                  .query(
                    "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@receiver_id"
                  );

                return {
                  email_address: ress.recordset[0].email_address,
                  Name:
                    ress.recordset[0].first_name +
                    " " +
                    ress.recordset[0].last_name
                };
              })
            );

            const find_tag =
              "Select message_tag_name as message_tag from dbo.message_tag where message_tag_id=@message_tag ; ";
            const rs = await poolT
              .request()
              .input("message_tag", sql.Int, item.message_tag)
              .query(find_tag);

            //**************************************** */

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
              other_receivers: Receivers,
              message_tag: item.message_tag,
              message_tag_name: rs.recordset[0].message_tag,
              replies: Replies,
              no_of_replies: ras.recordsets[1][0].no_of_replies
            };
          })

          //*********END OF MAP */******************************************** */
        ); //*PROMISE END

        return {
          messages: InBox_Messages,
          no_of_messages: reso.recordset[0].no_of_messages
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
      const fetch_message_query =
        "SELECT ms.message_tag,ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ms.message_subject FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id   where ra.sender_id=@user_id AND isSent=1 AND ra.message_type=4 AND ra.isActive=1 and ms.message_replied_id=0 ORDER BY ms.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY";
      // console.log("********",query)
      if (page_no > 0) {
        let poolT = await pool;
        const res = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .query(fetch_message_query);

        const messages = res.recordset;

        const fetch_sender_name =
          "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@sender_id;";

        const get_messages_count =
          "SELECT count(ra.message_id) no_of_messages FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id   where ra.sender_id=@user_id AND isSent=1 AND ra.message_type=4 AND ra.isActive=1 and ms.message_replied_id=0;";
        const reso = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(get_messages_count);
          
          const get_replies =
          "SELECT  message_subject,message_body,message_id,createdat,sender_id from dbo.message where message_replied_id=@ms_id ORDER BY createdat  ;SELECT count(message_id) as no_of_replies from dbo.message where message_replied_id=@ms_id";

        const get_senders_replies =
          "select first_name,last_name,user_name,email_address from dbo.security_user u where u.user_id=@user_id";


        const get_all_receivers =
          "SELECT distinct receiver_id from dbo.message_receiver_audit Where message_id=@message_id ;";

        //********************************************************************** */
        const InBox_Messages = await Promise.all(
          messages.map(async item => {
            //****************FETCH NAME OF THE SENDERS*/
            const ras = await poolT
            .request()
            .input("ms_id", sql.Int, item.message_id)
            .query(get_replies); //CURRENTLY WORKING HERE

          let resultss;
          const Replied = await Promise.all(
            ras.recordsets[0].map(async item => {
              resultss = await poolT
                .request()
                .input("user_id", sql.Int, item.sender_id)
                .query(get_senders_replies);

              return {
                message_subject: item.message_subject,
                message_body: item.message_body,
                message_id: item.message_id,
                createdat: item.createdat.toString(),
                sender_details: resultss.recordsets[0]
              };
            })
          );

        



            const respo = await poolT
              .request()
              .input("sender_id", sql.Int, item.sender_id)
              .query(fetch_sender_name);

            //***************************************** */

            resp = await poolT
              .request()
              .input("message_id", sql.Int, item.message_id)
              .query(get_all_receivers);

            Receivers = await Promise.all(
              resp.recordset.map(async elem => {
                ress = await poolT
                  .request()
                  .input("receiver_id", sql.Int, elem.receiver_id)
                  .query(
                    "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@receiver_id"
                  );

                return {
                  email_address: ress.recordset[0].email_address,
                  Name:
                    ress.recordset[0].first_name +
                    " " +
                    ress.recordset[0].last_name
                };
              })
            );

            const find_tag =
              "Select message_tag_name as message_tag from dbo.message_tag where message_tag_id=@message_tag ; ";
            const rs = await poolT
              .request()
              .input("message_tag", sql.Int, item.message_tag)
              .query(find_tag);

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
              other_receivers: Receivers,
              message_tag: item.message_tag,
              message_tag_name: rs.recordset[0].message_tag,
              replies: Replied,
              no_of_replies: ras.recordsets[1][0].no_of_replies
            };
          })

          //*********END OF MAP */******************************************** */
        ); //*PROMISE END

        return {
          messages: InBox_Messages,
          no_of_messages: reso.recordset[0].no_of_messages
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
        "select  ms.sentat,ms.sender_id,m.message_tag,m.message_subject,m.message_body,ms.isRead,ms.isFavourite,m.message_replied_id,m.message_id from dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id AND ms.sender_id=@user_id AND ms.isDeleted=1 AND ms.isActive=0  ORDER BY ms.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY;select  m.message_subject,m.message_body,mr.isRead,mr.isFavourite,m.message_replied_id,m.message_id,mr.receivedat,m.message_tag from dbo.message m left join dbo.message_receiver_audit mr on m.message_id=mr.message_id where mr.receiver_id=@user_id AND mr.isDeleted=1 AND mr.isActive=0 ORDER BY mr.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY;";
      // console.log("********",query)
      if (page_no > 0) {
        let poolT = await pool;
        const res = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .query(fetch_deleted_message_query);

        // console.log("*********",res)

        const messages = res.recordsets[0];
        const messages2 = res.recordsets[1];

        //********************************************************************** */      MESSAGES COUNT IN TRASH //********************************************************************** */

        const get_messages_count =
          "select Sum(trashedmessages) as no_of_messages from ( select count(m.message_id) as trashedmessages from dbo.message m  join dbo.message_receiver_audit mr on m.message_id=mr.message_id where mr.receiver_id=4 AND mr.isDeleted=1 AND mr.isActive=0  UNION ALL select count(m.message_id) as trashedmessages from dbo.message m join dbo.message_sender_audit ms on m.message_id=ms.message_id where ms.sender_id=4 AND ms.isDeleted=1 AND ms.isActive=0 ) x";
        const reso = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .query(get_messages_count);

        //********************************************************************** */      MESSAGES COUNT IN TRASH END   //********************************************************************** */

        const fetch_sender_name =
          "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@sender_id;";
        //Count of trash messages

        const get_all_receivers =
          "SELECT distinct receiver_id from dbo.message_receiver_audit Where message_id=@message_id ;";

        //********************************************************************** */
        const Sent_Draft_Messages = await Promise.all(
          messages.map(async item => {
            //****************FETCH NAME OF THE SENDERS*/
            const respo = await poolT
              .request()
              .input("sender_id", sql.Int, item.sender_id)
              .query(fetch_sender_name);

            //***************************************** */

            resp = await poolT
              .request()
              .input("message_id", sql.Int, item.message_id)
              .query(get_all_receivers);

            if (resp.recordset.length > 0) {
              //********************************************** */
              Receivers = await Promise.all(
                resp.recordset.map(async elem => {
                  ress = await poolT
                    .request()
                    .input("receiver_id", sql.Int, elem.receiver_id)
                    .query(
                      "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@receiver_id"
                    );

                  return {
                    email_address: ress.recordset[0].email_address,
                    Name:
                      ress.recordset[0].first_name +
                      " " +
                      ress.recordset[0].last_name
                  };
                })
              );

              //RECEIVERS PROMISE END
            }

            const find_tag =
              "Select message_tag_name as message_tag from dbo.message_tag where message_tag_id=@message_tag ; ";
            const rs = await poolT
              .request()
              .input("message_tag", sql.Int, item.message_tag)
              .query(find_tag);

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
              message_received_date: item.sentat.toString(),
              isFavourite: item.isFavourite.toJSON().data[0],
              isRead: item.isRead.toJSON().data[0],
              message_id: item.message_id,
              other_receivers: Receivers,
              message_tag: item.message_tag,
              message_tag_name: rs.recordset[0].message_tag
            };
          })

          //*********END OF MAP */******************************************** */
        ); //*PROMISE END
        //************************************************************************************************************* */

        // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",Sent_Draft_Messages)

        // console.log("*************************",messages2)

        const InBox_Messages = await Promise.all(
          messages2.map(async item => {
            //****************FETCH NAME OF THE SENDERS*/
            const respo = await poolT
              .request()
              .input("sender_id", sql.Int, userObj.user_id)        
              .query(fetch_sender_name);

            //***************************************** */

            resp = await poolT
              .request()
              .input("message_id", sql.Int, item.message_id)
              .query(get_all_receivers);

            Receivers = await Promise.all(
              resp.recordset.map(async elem => {
                ress = await poolT
                  .request()
                  .input("receiver_id", sql.Int, elem.receiver_id)
                  .query(
                    "SELECT email_address,first_name,last_name from dbo.security_user WHERE user_id=@receiver_id"
                  );

                return {
                  email_address: ress.recordset[0].email_address,
                  Name:
                    ress.recordset[0].first_name +
                    " " +
                    ress.recordset[0].last_name
                };
              })
            );

            const find_tag =
              "Select message_tag_name as message_tag from dbo.message_tag where message_tag_id=@message_tag ; ";
            const rs = await poolT
              .request()
              .input("message_tag", sql.Int, item.message_tag)
              .query(find_tag);

            return {
              sender_name:
                respo.recordset[0].first_name +
                " " +
                respo.recordset[0].last_name,
              sender_mail: respo.recordset[0].email_address,
              message_subject: item.message_subject,
              message_body: item.message_body,
              message_received_date:
                item.receivedat !== null ? item.receivedat.toString() : "Null",
              isFavourite: item.isFavourite.toJSON().data[0],
              isRead: item.isRead.toJSON().data[0],
              message_id: item.message_id,
              other_receivers: Receivers,
              message_tag: item.message_tag,
              message_tag_name: rs.recordset[0].message_tag
            };
          })

          //*********END OF MAP */******************************************** */
        );

        InBox_Messages.map(item => {
          Sent_Draft_Messages.push(item);
        });

        // console.log("*************************",Sent_Draft_Messages)

        return {
          messages: Sent_Draft_Messages,
          no_of_messages: reso.recordset[0].no_of_messages
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
        "SELECT ms.message_tag,ra.isRead,ra.isFavourite,ra.message_id,ms.message_body,ms.sender_id,ms.createdat,ms.message_subject FROM dbo.message ms left join dbo.message_sender_audit ra on ms.message_id=ra.message_id  where ra.sender_id=@user_id AND isSent=0 AND ra.message_type=2 AND ra.isActive=1 ORDER BY ms.message_id desc OFFSET @page_size * (@page_no-1) ROWS FETCH NEXT @page_size ROWS ONLY";
      // console.log("********",query)
      if (page_no > 0) {
        let poolT = await pool;
        const res = await poolT
          .request()
          .input("user_id", sql.Int, userObj.user_id)
          .input("page_size", sql.Int, page_size)
          .input("page_no", sql.Int, page_no)
          .query(fetch_message_query);

        const messages = res.recordset;
        const get_messages_count =
          "SELECT COUNT(message_id) as no_of_messages FROM dbo.message_sender_audit WHERE isActive=1 AND isDeleted=0 AND sender_id=@user_id AND message_type=2 AND isSent=0;";
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
            message_tag: item.message_tag
          };
        });

        return {
          messages: InBox_Messages,
          no_of_messages: reso.recordset[0].no_of_messages
        };
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  //InBox Messages
};

module.exports = {
  fetch_messages
};
