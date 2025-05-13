const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const timeout = require("./middleware/timeout");
// require('./DummyData/Packages');

// Load env vars
dotenv.config();

// Check if critical environment variables are set
console.log('Environment variables loaded:');
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set ' : 'Not set ');
console.log('- STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set ' : 'Not set ');
console.log('- MONGO_URI:', process.env.MONGO_URI ? 'Set ' : 'Not set ');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Set ' : 'Not set ');

// Connect to database
connectDB();

// Route files
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const packageRoutes = require("./routes/packages");
const reviewRoutes = require("./routes/reviews");
const contactRoutes = require("./routes/contact");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");
const dashboardRoutes = require("./routes/dashboard");
const siteSettingRoutes = require("./routes/siteSetting");
const chatRoutes = require("./routes/chat");

const app = express();

// Body parser
app.use(express.json());

// Special raw body parser for Stripe webhooks
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    // Raw body needed for Stripe signature verification
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
});

// Enable CORS
app.use(cors());

// Set request timeout (30 seconds for all routes)
app.use(timeout(30));

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", siteSettingRoutes);
app.use("/api/chat", chatRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
