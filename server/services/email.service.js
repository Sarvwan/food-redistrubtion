const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Standard configuration for Nodemailer
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] Email sent to ${to}: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Email error:`, error.message);
    return false;
  }
};

module.exports = { sendEmail };
