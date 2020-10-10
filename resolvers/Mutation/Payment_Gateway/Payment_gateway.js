
const config=require("./Stripe_config")
const dotenv=require("dotenv")
const result = dotenv.config()
const { pool } = require("./../../../utils");
const sql = require("mssql");
const { authenticate } = require("../../../utils");

const stripe = require('stripe')(config.stripe.secretKey);
stripe.setApiVersion(config.stripe.apiVersion);
 
// if (result.error) {
//   throw result.error
// }
 
// console.log(result.parsed)



// const products = [
//     {
//       id: 'G565654y87',
//       name: '7477',
//       price: 459,
      
//     }
    
//   ];
  
//   // Creates a collection of Stripe Products and SKUs to use in your storefront
//   const createStoreProducts = async () => {
//     try {
//       const stripeProducts = await Promise.all(
//         products.map(async product => {
//           const stripeProduct = await stripe.products.create({
//             id: product.id,
//             name: product.name,
//             type: 'good',
//             // attributes: Object.keys(product.attributes),
//             // metadata: product.metadata,
//           });
  
//           const stripeSku = await stripe.skus.create({
//             product: stripeProduct.id,
//             price: product.price,
//             currency: config.currency,
//             // attributes: product.attributes,
//             inventory: {type: 'infinite'},
//           });
  

//          const prodo= await stripe.products.list(
//             { limit: 25 },
//             function(err, products) {
//                 // console.log("$%$%$%$%$%$%$%$",products)
//                 return products
//               // asynchronously called
//             }
//           );
          


         
        
          
// // console.log("**************",{stripeProduct, stripeSku})
//           return {stripeProduct, stripeSku};


//         })
//       );
  
//       console.log(
//         `🛍️  Successfully created ${stripeProducts.length} products on your Stripe account.`
//       );
//     } catch (error) {
//       console.log(`⚠️  Error: ${error.message}`);
//       return;
//     }
//   };
  
  





//   const token = request.body.stripeToken; 


Payment_gateway= async (_, { meeting_id,amount,stripe_customer_id,payment_token,customer_description}, ctx) => {
  let poolT=await pool;
 
// const charge_token=ctx;
const userObj= await authenticate(ctx);



try {


if(stripe_customer_id)
{
 
  const customer_exists=await stripe.customers.retrieve(
    stripe_customer_id
  ); 

if(customer_exists)
{

 
  const charge = await stripe.charges.create({
    amount: amount,
    currency: 'usd',
    description: 'charging customer ==>'+customer_exists.sources.data[0].name,
    receipt_email:"vy4693@gmail.com",
    // source: "tok_1Ewmc9CMAwiKUB2ggA9d5kiL",
    customer:stripe_customer_id,// ADD customer_ID if exists ...
  });

  if(charge)
  {
  
    payment_audit_record(meeting_id,charge);
  
  }
    

  // console.log(charge)


}
// console.log(my_customer)

}

else{

  const new_customer=await stripe.customers.create({
    description:customer_description,
    source: payment_token // obtained from frontend  
  })
 
    const update_stripe_customer_id="UPDATE dbo.security_user set stripe_customerID=@customer_id where user_id=@user_id"
    await poolT
   .request()
   .input("customer_id", sql.VarChar,new_customer.id)
   .input("user_id", sql.VarChar,userObj.user_id)
   .query(update_stripe_customer_id)






  
  const charge = await stripe.charges.create({
    amount: amount,
    currency: 'usd',
    description: 'charging customer ==>'+new_customer.sources.data[0].name,
    receipt_email:"vy4693@gmail.com",
    // source: "tok_1Ewmc9CMAwiKUB2ggA9d5kiL",
    customer:new_customer.id,// ADD customer_ID if exists ...
  });
 

  if(charge)
{

  payment_audit_record(meeting_id,charge);

}
  

  // //Delete Customer
  // stripe.customers.del(
  //   'cus_FRgxW1nwzVyrKR',
  //   function(err, confirmation) {
  //     // asynchronously called
  //   }
  // );

  // console.log(new_customer)




  
}











 







  // console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",my_customer)


// console.log(charge)

}
catch(error)
{
throw error
}
    

// console.log("$$$$$$$$$$$$$$$$",charge)

//   createStoreProducts();

  return {stat:"payment succeeded"}

};





const payment_audit_record=async(meeting_id,charges_object)=>{
 
//   const insert_in_payment_audit =
//   "INSERT INTO dbo.payment_audit(user_id,status,payment_method,finger_print,Stripe_customer_id,source_id,receipt_email,receipt_number,receipt_url,charges_id,meeting_id,createdAt,amount) VALUES(@user_id,@status,@payment_method,@finger_print,@Stripe_customer_id,@source_id,@receipt_email,@receipt_number,@receipt_url,@charges_id,@meeting_id,@createdAt,@amount)";
// const poolT = await pool;
//  await poolT
//   .request()
//   .input("user_id", sql.Int, user_id) //only
//   .input("status", sql.VarChar, status)
//   .input("payment_method", sql.VarChar,charges_object.payment_method)
//   .input("finger_print", sql.VarChar, charges_object.source.fingerprint)
//   .input("Stripe_customer_id", sql.VarChar, charges_object.source.customer)
//   .input("source_id", sql.VarChar,charges_object.source.id)
//   .input("receipt_email", sql.VarChar, charges_object.receipt_email)
//   .input("receipt_number", sql.VarChar, charges_object.receipt_number)
//   .input("receipt_url", sql.VarChar, charges_object.receipt_url)
//   .input("charges_id", sql.VarChar, charges_object.id)
//   .input("meeting_id", sql.VarChar, meeting_id)
//   .input("createdAt", sql.VarChar, charges_object.created)
//   .input("amount", sql.VarChar, amount)

//   .query(insert_in_payment_audit );




}











module.exports = {
    Payment_gateway
};
