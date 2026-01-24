const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

const sendOTP = async (to, otp) => {
  const subject = 'Your OTP Code';
  const text = `Your OTP code is: ${otp}`;
  return sendEmail(to, subject, text);
};

module.exports = { sendEmail, sendOTP }; 