const Booking = require("../models/Booking");
const Package = require("../models/Package");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate(
    "package",
    "title img price duration"
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  // Check if booking belongs to user or user is admin
  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(401).json({ message: "Not authorized" });
  }

  res.json(booking);
});

// @desc    Get all bookings for a user
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate("package", "title img price duration")
    .sort({ bookingDate: -1 });

  res.json(bookings);
});

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings/admin
// @access  Private/Admin
exports.getAllBookings = asyncHandler(async (req, res) => {
  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  // Get total count for pagination
  const total = await Booking.countDocuments();
  
  // Query with pagination
  const bookings = await Booking.find({})
    .populate("package", "title img price duration")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  res.json({
    success: true,
    count: bookings.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: bookings
  });
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res) => {
  const {
    packageId,
    travelDate,
    travelers,
    customerName,
    customerEmail,
    customerPhone,
  } = req.body;

  // Find the package
  const package = await Package.findById(packageId);
  if (!package) {
    return res.status(404).json({ message: "Package not found" });
  }

  // Calculate total amount
  const totalAmount = package.price * travelers;

  // Create booking
  const booking = await Booking.create({
    package: packageId,
    user: req.user.id,
    packageName: package.title,
    packageImage: package.img,
    travelDate,
    travelers,
    customerName: customerName || req.user.name,
    customerEmail: customerEmail || req.user.email,
    customerPhone,
    totalAmount,
  });

  // Send booking confirmation email
  try {
    const sendEmail = require('../utils/sendEmail');
    const { bookingConfirmationTemplate } = require('../utils/emailTemplates');
    
    await sendEmail({
      email: booking.customerEmail,
      subject: `Booking Confirmation - ${booking.packageName}`,
      html: bookingConfirmationTemplate(booking)
    });
  } catch (emailError) {
    console.error('Error sending booking confirmation email:', emailError);
    // Continue even if email fails
  }

  res.status(201).json({
    success: true,
    data: booking,
  });
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private/Admin
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  // Send booking status update email
  try {
    const sendEmail = require('../utils/sendEmail');
    const { bookingStatusUpdateTemplate } = require('../utils/emailTemplates');
    
    await sendEmail({
      email: booking.customerEmail,
      subject: `Booking Status Update - ${booking.packageName}`,
      html: bookingStatusUpdateTemplate(booking)
    });
  } catch (emailError) {
    console.error('Error sending booking status update email:', emailError);
    // Continue even if email fails
  }

  res.json({
    success: true,
    data: booking,
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  // Check if booking belongs to user or user is admin
  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(401).json({ message: "Not authorized" });
  }

  // Only allow cancellation of pending bookings or confirmed bookings that haven't happened yet
  const currentDate = new Date();
  const travelDate = new Date(booking.travelDate);
  
  // Check if the booking is in the past
  if (travelDate < currentDate) {
    return res.status(400).json({
      success: false,
      message: "Cannot cancel a booking for a past travel date",
    });
  }
  
  // Check if booking status allows cancellation
  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return res.status(400).json({
      success: false,
      message: "Cannot cancel booking that is not in pending or confirmed status",
    });
  }

  // Update booking status
  booking.status = "cancelled";
  
  // If payment was made, mark it for refund consideration
  if (booking.paymentStatus === "paid") {
    booking.paymentStatus = "refund_pending";
  }
  
  await booking.save();

  // Find any associated payment records
  const Payment = require("../models/Payment");
  const payment = await Payment.findOne({ booking: booking._id });
  
  if (payment) {
    // Update payment status to reflect cancellation
    payment.status = "cancellation_pending";
    await payment.save();
  }

  // Send cancellation email notification
  try {
    const sendEmail = require('../utils/sendEmail');
    const { bookingStatusUpdateTemplate } = require('../utils/emailTemplates');
    
    await sendEmail({
      email: booking.customerEmail,
      subject: `Booking Cancellation - ${booking.packageName}`,
      html: bookingStatusUpdateTemplate(booking)
    });
  } catch (emailError) {
    console.error('Error sending booking cancellation email:', emailError);
    // Continue even if email fails
  }

  res.json({
    success: true,
    data: booking,
    message: booking.paymentStatus === "refund_pending" 
      ? "Your booking has been cancelled. If you made a payment, our team will review your refund request."
      : "Your booking has been cancelled successfully."
  });
});
