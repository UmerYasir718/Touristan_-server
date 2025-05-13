// Email templates for various notifications

// Password reset email
exports.passwordResetTemplate = (user, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .header { background-color: #007bff; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; }
        .footer { background-color: #f1f1f1; padding: 10px; text-align: center; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Hello ${user.name || "User"},</p>
          <p>We received a request to reset your password for your account on <b>Your Site Name</b>.</p>
          <p>To reset your password, please click the button below or copy and paste the link into your browser:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p style="word-break:break-all;">${resetUrl}</p>
          <p><b>Instructions for resetting your password:</b></p>
          <ol>
            <li>Click the "Reset Password" button above, or copy the link into your browser.</li>
            <li>Enter your new password in the form provided.</li>
            <li>Submit the form to complete the reset process.</li>
          </ol>
          <p>This link will expire in 10 minutes for your security.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Your Site Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Booking confirmation email
exports.bookingConfirmationTemplate = (booking) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 10px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .footer {
          background-color: #f1f1f1;
          padding: 10px;
          text-align: center;
          border-radius: 0 0 5px 5px;
        }
        .booking-details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .button {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Booking Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear ${booking.customerName},</p>
          <p>Thank you for booking with us! Your tour package has been successfully booked.</p>
          
          <div class="booking-details">
            <h3>Booking Details:</h3>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Package:</strong> ${booking.packageName}</p>
            <p><strong>Travel Date:</strong> ${new Date(
              booking.travelDate
            ).toLocaleDateString()}</p>
            <p><strong>Number of Travelers:</strong> ${booking.travelers}</p>
            <p><strong>Total Amount:</strong> PKR ${booking.totalAmount.toLocaleString()}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
          </div>
          
          <p>You can view your booking details and manage your reservation by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/bookings/${
    booking._id
  }" class="button">View Booking</a>
          </p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          <p>Thank you for choosing our services!</p>
          <p>Best regards,<br>The Tour Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Tour Pakistan. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Booking status update email
exports.bookingStatusUpdateTemplate = (booking) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #3498db;
          color: white;
          padding: 10px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .footer {
          background-color: #f1f1f1;
          padding: 10px;
          text-align: center;
          border-radius: 0 0 5px 5px;
        }
        .booking-details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .status {
          font-weight: bold;
          color: ${
            booking.status === "confirmed"
              ? "#4CAF50"
              : booking.status === "cancelled"
              ? "#e74c3c"
              : booking.status === "completed"
              ? "#3498db"
              : "#f39c12"
          };
        }
        .button {
          display: inline-block;
          background-color: #3498db;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Booking Status Update</h2>
        </div>
        <div class="content">
          <p>Dear ${booking.customerName},</p>
          <p>We're writing to inform you that the status of your booking has been updated.</p>
          
          <div class="booking-details">
            <h3>Booking Details:</h3>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Package:</strong> ${booking.packageName}</p>
            <p><strong>Travel Date:</strong> ${new Date(
              booking.travelDate
            ).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status">${booking.status.toUpperCase()}</span></p>
            <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
          </div>
          
          ${
            booking.status === "confirmed"
              ? `<p>Your booking has been confirmed! We're looking forward to providing you with an amazing travel experience.</p>`
              : booking.status === "cancelled"
              ? `<p>Your booking has been cancelled. If you have any questions about this cancellation, please contact our customer service.</p>`
              : booking.status === "completed"
              ? `<p>Your tour has been marked as completed. We hope you had a wonderful experience with us!</p>`
              : `<p>Your booking status has been updated. Please check your booking details for more information.</p>`
          }
          
          <p>You can view your booking details by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/bookings/${
    booking._id
  }" class="button">View Booking</a>
          </p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          <p>Thank you for choosing our services!</p>
          <p>Best regards,<br>The Tour Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Tour Pakistan. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Payment confirmation email
exports.paymentConfirmationTemplate = (payment, booking) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #27ae60;
          color: white;
          padding: 10px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .footer {
          background-color: #f1f1f1;
          padding: 10px;
          text-align: center;
          border-radius: 0 0 5px 5px;
        }
        .payment-details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .button {
          display: inline-block;
          background-color: #27ae60;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Payment Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear ${booking.customerName},</p>
          <p>Thank you for your payment! We've received your payment for the tour package booking.</p>
          
          <div class="payment-details">
            <h3>Payment Details:</h3>
            <p><strong>Payment ID:</strong> ${payment._id}</p>
            <p><strong>Amount Paid:</strong> PKR ${payment.amount.toLocaleString()}</p>
            <p><strong>Payment Date:</strong> ${new Date(
              payment.createdAt
            ).toLocaleString()}</p>
            <p><strong>Payment Status:</strong> ${payment.status}</p>
            <p><strong>Payment Method:</strong> Credit/Debit Card</p>
          </div>
          
          <div class="payment-details">
            <h3>Booking Details:</h3>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Package:</strong> ${booking.packageName}</p>
            <p><strong>Travel Date:</strong> ${new Date(
              booking.travelDate
            ).toLocaleDateString()}</p>
            <p><strong>Number of Travelers:</strong> ${booking.travelers}</p>
          </div>
          
          <p>You can view your booking and payment details by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/bookings/${
    booking._id
  }" class="button">View Booking</a>
          </p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          <p>Thank you for choosing our services!</p>
          <p>Best regards,<br>The Tour Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Tour Pakistan. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Contact reply notification email
exports.contactReplyTemplate = (contact) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background-color: #9b59b6;
          color: white;
          padding: 10px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .footer {
          background-color: #f1f1f1;
          padding: 10px;
          text-align: center;
          border-radius: 0 0 5px 5px;
        }
        .message-box {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #9b59b6;
        }
        .reply-box {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #3498db;
        }
        .button {
          display: inline-block;
          background-color: #9b59b6;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Response to Your Inquiry</h2>
        </div>
        <div class="content">
          <p>Dear ${contact.name},</p>
          <p>Thank you for contacting us. We have received your message and our team has provided a response.</p>
          
          <div class="message-box">
            <h3>Your Message:</h3>
            <p><strong>Subject:</strong> ${contact.subject}</p>
            <p><strong>Sent on:</strong> ${new Date(
              contact.createdAt
            ).toLocaleString()}</p>
            <p>${contact.message}</p>
          </div>
          
          <div class="reply-box">
            <h3>Our Response:</h3>
            <p>${contact.reply.text}</p>
            <p><strong>Replied on:</strong> ${new Date(
              contact.reply.date
            ).toLocaleString()}</p>
          </div>
          
          <p>If you have any further questions or need additional assistance, please don't hesitate to contact us again.</p>
          <p>Thank you for your interest in our services!</p>
          <p>Best regards,<br>The Tour Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Tour Pakistan. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Welcome email for new users
exports.welcomeTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
          background-color: #fff;
        }
        .welcome-image {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .footer {
          background-color: #f1f1f1;
          padding: 15px;
          text-align: center;
          border-radius: 0 0 5px 5px;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 15px;
        }
        .features {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          flex-wrap: wrap;
        }
        .feature {
          flex-basis: 30%;
          text-align: center;
          padding: 15px 0;
        }
        .feature-icon {
          font-size: 24px;
          margin-bottom: 10px;
          color: #6a11cb;
        }
        h1 {
          margin: 0;
          font-size: 28px;
        }
        h2 {
          color: #6a11cb;
        }
        @media (max-width: 600px) {
          .feature {
            flex-basis: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to TouriStan!</h1>
        </div>
        <div class="content">
          <img src="https://res.cloudinary.com/dngm7icac/image/upload/v1/packages/welcome_banner" alt="Welcome to TouriStan" class="welcome-image">
          
          <h2>Hello ${user.name},</h2>
          <p>Thank you for joining TouriStan! We're thrilled to have you as part of our community of travel enthusiasts.</p>
          
          <p>With your new account, you can:</p>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">🔍</div>
              <p>Discover amazing tour packages across Pakistan</p>
            </div>
            <div class="feature">
              <div class="feature-icon">📅</div>
              <p>Book and manage your travel plans</p>
            </div>
            <div class="feature">
              <div class="feature-icon">💰</div>
              <p>Get exclusive deals and offers</p>
            </div>
          </div>
          
          <p>Start exploring the beauty of Pakistan with us. Whether you're looking for adventure, cultural experiences, or relaxation, we have the perfect package for you.</p>
          
          <p style="text-align: center;">
            <a href="${
              process.env.FRONTEND_URL
            }/packages" class="button">Explore Packages</a>
          </p>
          
          <p>If you have any questions or need assistance, our customer support team is always ready to help.</p>
          
          <p>Happy travels!<br>The TouriStan Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TouriStan. All rights reserved.</p>
          <p>Address: Islamabad, Pakistan | Phone: +92-XXX-XXXXXXX</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Payment status update email
exports.paymentStatusUpdateTemplate = (booking) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .header {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
          background-color: #fff;
        }
        .footer {
          background-color: #f1f1f1;
          padding: 15px;
          text-align: center;
          border-radius: 0 0 5px 5px;
          font-size: 12px;
        }
        .payment-details {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #11998e;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          color: white;
          background-color: ${
            booking.paymentStatus === "paid"
              ? "#38ef7d"
              : booking.paymentStatus === "partial"
              ? "#f39c12"
              : booking.paymentStatus === "refunded"
              ? "#3498db"
              : "#e74c3c"
          };
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Status Update</h1>
        </div>
        <div class="content">
          <p>Dear ${booking.customerName},</p>
          
          <p>We're writing to inform you that the payment status for your booking has been updated.</p>
          
          <div class="payment-details">
            <h3>Payment Status: <span class="status-badge">${booking.paymentStatus.toUpperCase()}</span></h3>
            
            <h3>Booking Details:</h3>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Package:</strong> ${booking.packageName}</p>
            <p><strong>Travel Date:</strong> ${new Date(
              booking.travelDate
            ).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> PKR ${booking.totalAmount.toLocaleString()}</p>
            <p><strong>Booking Status:</strong> ${booking.status}</p>
          </div>
          
          ${
            booking.paymentStatus === "paid"
              ? `<p>Great news! Your payment has been confirmed and fully processed. Your booking is now confirmed, and you're all set for your upcoming trip.</p>`
              : booking.paymentStatus === "partial"
              ? `<p>We've received your partial payment. Please complete the remaining payment before your travel date to confirm your booking fully.</p>`
              : booking.paymentStatus === "refunded"
              ? `<p>Your payment has been refunded. The refund should appear in your account within 5-7 business days, depending on your bank's processing time.</p>`
              : `<p>Your payment is currently pending. Please complete the payment process to confirm your booking.</p>`
          }
          
          <p>You can view your booking details and payment information by clicking the button below:</p>
          
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/bookings/${
    booking._id
  }" class="button">View Booking</a>
          </p>
          
          <p>If you have any questions or need assistance regarding your payment, please don't hesitate to contact our customer support team.</p>
          
          <p>Thank you for choosing TouriStan for your travel needs!</p>
          
          <p>Best regards,<br>The TouriStan Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TouriStan. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
