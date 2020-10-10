const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(
  "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"
);


  function mailNotification(to,from,subject,body)
  { 

    const msg = {
      
        to : to,
  
        from:from,
        subject:subject,
        html:body,

       
  }

  
  sgMail.sendMultiple(msg);

}

module.exports = { mailNotification };