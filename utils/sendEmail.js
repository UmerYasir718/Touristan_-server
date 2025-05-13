const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create a transporter using Gmail with app password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD // App password generated from Google Account
      }
    });

    // Define email options
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.GMAIL_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    // Add CC if provided
    if (options.cc) {
      mailOptions.cc = options.cc;
    }

    // Add attachments if provided
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent: ${info.messageId}`);
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
