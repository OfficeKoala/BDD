const { pool } = require("../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");
const { constant_file } = require("../../../utils");
const errors = require("../../Error_and_constants/Errors");
const sqlqueries = require("../../Sql_queries/Mutation_queries");

const config = require("./../Payment_Gateway/Stripe_config");
const dotenv = require("dotenv");

const stripe = require("stripe")(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);

const Request_Meeting = async (
  _,
  {
    remarks,
    charity_id,
    product_id,
    UserId,
    amount,
    stripe_customer_id,
    payment_token,
    customer_description,
    meeting_id
  },
  ctx
) => {
  // amount = amount * 100;
  amount=50;
  const userObj = await authenticate(ctx);
  //  const userObj= {user_id: 14 , company_id:4}
  const poolT = await pool;
  try {
    if (meeting_id === undefined) {
      if (UserId.length > 0) {
        const is_valid_dm_res = await poolT
          .request()
          .input("user_id", sql.Int, UserId[0])
          .query(sqlqueries.request_meeting_query.valid_dms);

        if (is_valid_dm_res.recordset[0].count > 0) {
          const Request_For_Meeting = `INSERT INTO dbo.meeting (user_id,status,requested_on,isActive,product_id,remarks,charity_id)VALUES (@user_id, ${constants.request_status} ,getutcdate(),1,@product_id,@remarks,@charity_id);SELECT scope_identity() as meeting_id`;
          const res = await poolT
            .request()
            .input("user_id", sql.Int, userObj.user_id)
            .input("product_id", sql.Int, product_id)
            .input("remarks", sql.VarChar, remarks)
            .input("charity_id", sql.Int, charity_id)
            .query(Request_For_Meeting);

          const meeting_id = res.recordset[0].meeting_id;
          if (meeting_id > 0) {
            UserId.push(userObj.user_id);
            const Insert_into_meeting__participant_audit = `INSERT INTO dbo.meeting__participant_audit (meeting_id,user_id,status,isActive) Values(@meeting_id,@user_id, ${constants.request_status} ,1)`;
            await UserId.map(async item => {
              const respo = await poolT
                .request()
                .input("meeting_id", sql.Int, meeting_id)
                .input("user_id", sql.Int, item)
                .query(Insert_into_meeting__participant_audit);
            });
          }

          //PAYMENT INITIATON
          try {
            const payment_charged = await payment_gateway(
              meeting_id,
              amount,
              stripe_customer_id,
              payment_token,
              customer_description,
              userObj.user_id
            );
            if (payment_charged) { 
              await poolT
                .request()
                .input("meeting_id", sql.Int, meeting_id)
                .query(
                  sqlqueries.request_meeting_query.update_meeting_status_8
                ); 
            }
          } catch (error) {
            await poolT
              .request()
              .input("meeting_id", sql.Int, meeting_id)
              .query(sqlqueries.request_meeting_query.update_meeting_status_7);
            throw error;
          }
          return {
            stat: "Meeting Requested Successfully",
            meeting_id: meeting_id
          };
        } else {
          throw new Error(errors.Meeting.provide_valid_dm);
        }
      } else {
        throw new Error(errors.Meeting.provide_valid_dm);
      }
    } else {
      try {
        const payment_charged = await payment_gateway(
          meeting_id,
          amount,
          stripe_customer_id,
          payment_token,
          customer_description,
          userObj.user_id
        );

        if (payment_charged) { 
          await poolT
            .request()
            .input("meeting_id", sql.Int, meeting_id)
            .query(sqlqueries.request_meeting_query.update_meeting_status_8);
         }
      } catch (error) {
        await poolT
          .request()
          .input("meeting_id", sql.Int, meeting_id)
          .query(sqlqueries.request_meeting_query.update_meeting_status_7);

        throw error;
      }
    }
  } catch (error) {
    throw error;
  }
};

//PAYMENT GATEWAY METHOD START------
const payment_gateway = async (
  meeting_id,
  amount,
  stripe_customer_id,
  payment_token,
  customer_description,
  user_id
) => {
  const poolT = await pool;

  try {
    if (stripe_customer_id) {
      const customer_exists = await stripe.customers.retrieve(
        stripe_customer_id
      );

      if (customer_exists) {
        const charge = await stripe.charges.create({
          amount: amount,
          currency: "usd",
          description:
            "charging customer ==>" + customer_exists.sources.data[0].name,
          receipt_email: "vy4693@gmail.com",
          // source: "tok_1Ewmc9CMAwiKUB2ggA9d5kiL",
          customer: stripe_customer_id // ADD customer_ID if exists ...
        });

        if (charge) {
          payment_audit_record(meeting_id, charge, user_id, amount);

          return charge;
        }
      }
    } else {
      const new_customer = await stripe.customers.create({
        description: customer_description,
        source: payment_token // obtained from frontend
      });

      await poolT
        .request()
        .input("customer_id", sql.VarChar, new_customer.id)
        .input("user_id", sql.VarChar, user_id)
        .query(
          sqlqueries.request_meeting_query.payment_update_stripe_customer_id
        );

      const charge = await stripe.charges.create({
        amount: amount,
        currency: "usd",
        description:
          "charging customer ==>" + new_customer.sources.data[0].name,
        receipt_email: "vy4693@gmail.com",
        // source: "tok_1Ewmc9CMAwiKUB2ggA9d5kiL",
        customer: new_customer.id // ADD customer_ID if exists ...
      });

      if (charge) {
        payment_audit_record(meeting_id, charge, user_id, amount);

        return charge;
      }

      // //Delete Customer
      // stripe.customers.del(
      //   'cus_FRgxW1nwzVyrKR',
      //   function(err, confirmation) {
      //     // asynchronously called
      //   }
      // );
    }
  } catch (error) {
    throw error;
  }
};

const payment_audit_record = async (
  meeting_id,
  charges_object,
  user_id,
  amount
) => {
  try {
    const poolT = await pool;
    await poolT
      .request()
      .input("user_id", sql.Int, user_id) //only
      .input(
        "status",
        sql.VarChar,
        charges_object.status === "succeeded" ? "1" : "0"
      )
      .input("payment_method", sql.VarChar, charges_object.payment_method)
      .input("finger_print", sql.VarChar, charges_object.source.fingerprint)
      .input("Stripe_customer_id", sql.VarChar, charges_object.source.customer)
      .input("source_id", sql.VarChar, charges_object.source.id)
      .input("receipt_email", sql.VarChar, charges_object.receipt_email)
      .input(
        "receipt_number",
        sql.VarChar,
        charges_object.receipt_number !== null
          ? charges_object.receipt_number
          : "NULL"
      )
      .input("receipt_url", sql.VarChar, charges_object.receipt_url)
      .input("charges_id", sql.VarChar, charges_object.id)
      .input("meeting_id", sql.Int, meeting_id)
      .input("amount", sql.Float, amount / 100)
      .query(sqlqueries.request_meeting_query.insert_in_payment_audit);
 
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  Request_Meeting
};
