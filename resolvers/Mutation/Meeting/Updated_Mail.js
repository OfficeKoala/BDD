const sgMail = require("@sendgrid/mail");
const fs = require("fs");
sgMail.setApiKey(
  "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"
);

function sendEmail(
  to,
  cc,
  from,
  user_name,
  start_date,
  end_date,
  access_url,
  pin
) {
  fs.readFile("./test_file.txt", "base64", function(err, data) {
    const msg = {
      to: to,
      Cc: cc,
      from: from,
      subject: "Your meeting is scheduled at GoUpendo",
      html:
        "<html> <head> </head> <body> <p> <strong> Hi" +
        " " +
        user_name +
        " </strong> !" +
        "<br/>" +
        " " +
        "<br/>" +
        " Your meeting is scheduled at " +
        start_date +
        "." +
        " It will be end at " +
        end_date +
        "." +
        " <p> For joining your meeting following link is provided- </p>  " +
        access_url +
        "  </p> <p> And for joining meeting you have to enter following pin- </p> <p> " +
        pin +
        "</p> <p><b> Thank You ! </b></p></body > </html "
    };
    sgMail.sendMultiple(msg);
  });
}
module.exports = { sendEmail };
