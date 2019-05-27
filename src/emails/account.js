var nodemailer = require('nodemailer');

const EMAIL = "your_email_address";
const PASS = "your_email_password";

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: PASS
  }
});

const sendRegisterEmail = (email, name) => {
  var mailOptions = {
    from: EMAIL,
    to: email,
    subject: 'Welcome bos!',
    text: `Hello, ${name}. glad to see you!`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info);
    }
  });
}

module.exports = {
  sendRegisterEmail
}