/* eslint-disable no-console */
// Load environment variables from .env file
require("dotenv").config();
const url = require("url");
const jwt = require("jsonwebtoken");
const { GraphQLServer } = require("graphql-yoga");
const helmet = require("helmet");
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const config = require("./config");
const express = require("express");
var path = require("path");
const { pool } = require("./utils");
const sql = require("mssql");
const { server_ip } = require("./config/index");
var cors = require("cors");
const fs = require("fs");
const https = require("https");
const cron=require("node-cron");
const job=require("./cronjob")
// const httpsOptions = {
// key: fs.readFileSync(__dirname + '/config/private.key'),
// cert: fs.readFileSync(__dirname + '/config/primary.crt'),
// requestCert: false
// }

//STRIPE TEST
// const stripe = require("stripe")("sk_test_QOzFaYWdFPtcizvcKzvwZ8rL003dhAGPDG");

const resolvers = {
  Query,
  Mutation
};

const server = new GraphQLServer({
  typeDefs: "./schema.graphql", //schema
  resolvers,
  context: req => ({ ...req })
});

//create a cors middleware
// server.express.use(function(req, res, next) {
//   //set headers to allow cross origin request.
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
// server.express.use(cors());

// HTTP security middleware
server.express.use(helmet());

const ngrok = require('ngrok');
// (async function() {

//   const url = await ngrok.connect(4000);

//   console.log("--------NGROK STARTED --------",url)

// })();
(async function() {

  const url = await ngrok.connect(4000);

  console.log("--------NGROK STARTED -UI-------",url)

})();



// only if you're behind a reverse proxy
// (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)
server.express.enable("trust proxy");

//  apply rate limiter to all requests
server.express.use(config.limiter);
server.start(
  config.options,
  ({ port }) => { 
    console.log(`🚀  Server running at http://localhost:${port} `);

    console.log(`🚀 🚀 🚀  Server running at ${server_ip}`);
    // job.cronjob();
  }
  // ,
  // {
  //   cors: {
  //     credentials: true,
  //     origin: ["*"], //FrontEND URL
  //     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  //     preflightContinue: false,
  //     optionsSuccessStatus: 204
  //   }
  // }
);





//********************************************************* */

// server.express.use("/max",(req,res)=>{

// res.send("Hello from other wodl ~")

// })
// server.express.use(express.static('tmp'));

server.express.use("/profilepic", function(request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  query.im_path;

  response.sendFile(path.join(__dirname + query.im_path.substring(1)));
});


// server.express.use("/password_change*", function(request, response) {
//   var url_parts = url.parse(request.url, true);
//   var query = url_parts.query;
//   response.send(query.token);

// });

//Stripe TEST
/////******************************************************************* */
/////******************************************************************* */
/////******************************************************************* */
/////******************************************************************* */
// /////******************************************************************* */
// server.express.use("/strip", async (req, res) => {
//   //stripe customer create

//   const customer = await stripe.customers.create({
//     email: "jenny.rosen@example.com",
//     source: "src_1EwkujCMAwiKUB2gdCWrTz3O"
//   });

//   // console.log(customer)
//   // stripe.paymentIntents.create({
//   //   amount: 2000,
//   //   currency: 'usd',
//   //   payment_method_types: ['card'],
//   // }, function(err, paymentIntent) {
//   //   // asynchronously called
//   // });

//   res.send(customer);
// });

/////******************************************************************* */
/////******************************************************************* */
/////******************************************************************* */
/////******************************************************************* */
/////******************************************************************* */
// server.express.use("/viewdoc", async (request, response) => {
//   var url_parts = url.parse(request.url, true);
//   var query = url_parts.query;
//   var pid = query.product_id;
//   var tokenVal = query.token;
//   var vendor_id = query.v_id;

//   // const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJjb21wYW55X2lkIjozLCJpYXQiOjE1NjE1Mzk0NzF9.RRPPmcWGsP5wpjqmQO2N_4nXC-CgakEdDOc32GNKct4"
//   const user_id = jwt.verify(
//     tokenVal,
//     config.SESSION_SECRET,
//     (err, decoded) => {
//       return decoded.user_id;
//     }
//   );

//   if (user_id) {
//     response.sendFile(
//       path.join(
//         __dirname +
//           "/uploads/uid_" +
//           vendor_id +
//           "/docs/" +
//           "p_" +
//           pid +
//           "/" +
//           query.filename
//       )
//     );
//   }

// });
