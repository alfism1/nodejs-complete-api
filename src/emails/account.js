var nodemailer = require('nodemailer');

const EMAIL = process.env.EMAIL;
const PASS = process.env.PASSWORD;

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