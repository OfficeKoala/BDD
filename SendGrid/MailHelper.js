



// const sgMail = require('@sendgrid/mail');

// // const mime = require('mime');
// //  sgMail.setApiKey(constant.SENDGRID_API_KEY);
// //  function sendEmail()
// //  {
// sgMail.setApiKey('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')
// const msg = {
//   to: ['aparna@qsstechnologies.com' ] ,//, 'manaligupta395@gmail.com'],
//   // Cc: 'aditya.singh@qsstechnosoft.in',
//   Bcc :'manaligupta395@gmail.com',
  
  
//   from: 'stanleypatela@gmail.com',
//   // from : 'manaligupta395@gmail.com',
//   subject: 'This mail is sent by Manali Gupta',
  

//   // attachments: [
//   //   {
//   //     content: 'Some base 64 encoded attachment content',
//   //     // filename: 'some-attachment.txt',
//   //     type: 'plain/text',
//   //     // disposition: 'attachment',
//   //     // contentId: 'mytext'
//   //   },
//   // ],

// //   attachments : [{
// //     // 'content' : pdf,
// //     // 'filename' : data['filename'],
// //     // 'type' : 'application/pdf'
// // }],
              
//   text: 'I hope you are enjoying sendgrid services',
//   html: '<strong>keep enjoying sendgrid services</strong>',
//   // attachments:         'C:\Users\manali.gupta\Pictures\images'

// // files     : [{filename:'Report.pdf',content:'data:application/pdf;base64,'+base64data}],
// };
// sgMail.sendMultiple(msg);   
// console.log("mail sent") 
// // var base64File = new Buffer(file).toString('base64');
// // var base64File = new Buffer(res.body).toString('base64');
// // console.log(base64File)
// // 'manali.gupta@qsstechnosoft.com', 'aditya.singh@qsstechnosoft.in',

// // sgMail.sendMultiple(msg);  is used If you want to send multiple individual emails to multiple recipient where they don't see each other's email addresses, use sendMultiple instead:
// //  }
// //  module.exports= {sendEmail}

//  module.exports= {msg}



 /*************SendGrid*************/
 const sgMail = require('@sendgrid/mail');
//  const fs= require('fs')
 sgMail.setApiKey('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')

//  fs.readFile('./attachment.txt', function (err, data) {
 const msg = {
  to: ['manali.gupta@qsstechnosoft.com'] ,
  Bcc :'manaligupta395@gmail.com',
  replyTo:'manaligupta395@gmail.com',
  from: 'stanleypatela@gmail.com',
  subject: 'This mail is sent by Manali Gupta',
  text: 'I hope you are enjoying sendgrid services',
  html: '<strong>keep enjoying sendgrid services</strong>',
  attachments: [{filename:'attachment.txt',type : 'text/csv',content: 'data'}]
};

sgMail.sendMultiple(msg); 


