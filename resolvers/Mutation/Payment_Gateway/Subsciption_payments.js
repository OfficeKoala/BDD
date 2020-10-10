const {
  pool
} = require("../../../utils");
const sql = require("mssql");
const {
  authenticate
} = require("../../../utils");
// const errors = require("../../Error_and_constants/Errors");
const sqlqueries = require("../../Sql_queries/Mutation_queries");
const config = require("./Stripe_config");
const dotenv = require("dotenv");

const stripe = require("stripe")(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);
const Subscription_payments = async (
  _, {
    amount,
    stripe_customer_id,
    payment_token,
    customer_description,
    deactivate_flag
  },
  ctx
) => {

  // amount = amount * 100;
  amount = 50;
  // const userObj= {user_id: 2 , company_id:4}
  const userObj = await authenticate(ctx);
  const poolT = await pool;

  //Check If request is of Deactivate Subscription 
  if (deactivate_flag === 1) {
    const deactivate_subscription_if_any = "update dbo.subscription set payment_status=0 where user_id=@user_id";
    await poolT
      .request()
      .input("user_id", sql.Int, userObj.user_id)
      .query(deactivate_subscription_if_any)
    return "Your subscription has been successfully deactivated."

  } //Resubscribe or subscribe a user for Goupendo
  else {

    const checking_payment_subscription_required = await insert_in_subscription(userObj.user_id, amount);

    if (checking_payment_subscription_required !== true && checking_payment_subscription_required !== false) {
      const response = await payment_gateway(amount, stripe_customer_id, payment_token, customer_description, userObj.user_id);

      if (response) {

        const k = await poolT
          .request()
          .input("id", sql.VarChar, checking_payment_subscription_required)
          .query(
            "update dbo.subscription set payment_status=1 where id=@id"
          );

        return "Successfully Paid & Subscribed"
      } else {


        return "Payment unsuccessful"
      }

    } else {

      return "Subscription not yet expired"
    }

  }


}



const payment_gateway = async (
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
          description: "charging customer ==>" + customer_exists.sources.data[0].name,
          receipt_email: "vy4693@gmail.com",
          // source: "tok_1Ewmc9CMAwiKUB2ggA9d5kiL",
          customer: stripe_customer_id // ADD customer_ID if exists ...
        });

        if (charge) {
          payment_audit_record(charge, user_id, amount);

          return true;
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
        description: "charging customer ==>" + new_customer.sources.data[0].name,
        receipt_email: "vy4693@gmail.com",
        // source: "tok_1Ewmc9CMAwiKUB2ggA9d5kiL",
        customer: new_customer.id // ADD customer_ID if exists ...
      });

      if (charge) {
        payment_audit_record(charge, user_id, amount);
        return true;
      }

    }
  } catch (error) {
    throw error;
  }
};

const insert_in_subscription = async (user_id, amount) => {

  try {
    const poolT = await pool;
    const result = await poolT.request().input("user_id", sql.Int, user_id).query("select * from dbo.subscription where user_id=@user_id and payment_status=1");

    if (result.recordset.length > 0) {
      if ((result.recordset[0].payment_status.toJSON().data[0])) {
        return false;
      }

    } else { //Creating New Subscription 
      const result = await poolT
        .request()
        .input("user_id", sql.Int, user_id)
        .input("amount", sql.Int, amount / 100)
        .query("insert into dbo.subscription(user_id,date_of_subscription,payment_amount,payment_status) values (@user_id,getutcdate(),@amount,0);select scope_identity() as id");



      return result.recordset[0].id;

    }


  } catch (error) {
    throw error
  }
}

const payment_audit_record = async (
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
        charges_object.receipt_number !== null ?
        charges_object.receipt_number :
        "NULL"
      )
      .input("receipt_url", sql.VarChar, charges_object.receipt_url)
      .input("charges_id", sql.VarChar, charges_object.id)
      .input("amount", sql.Float, amount / 100)
      .query(sqlqueries.request_meeting_query.insert_in_payment_audit_without_meeting_id);

  } catch (error) {
    throw new Error(error);
  }
};



module.exports = {

  Subscription_payments

}