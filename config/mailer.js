const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: "rahulsingh894856@gmail.com",
      pass: "xnwh orwp yuzc lxpl",
    },
  });


  const sendMail= async (toEmail,subject, htmlContent)=>{
    const mailOptions={
        from:`BlogApp <rahulsingh894856@gmail.com>`,
        to:toEmail,
        subject,
        html:htmlContent
    };

    return transporter.sendMail(mailOptions);
  }

  module.exports=sendMail;