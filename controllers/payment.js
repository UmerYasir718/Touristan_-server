// controllers/paymentController.js
const asyncHandler = require("../middleware/async");
const stripe = require("../config/stripe");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Package = require("../models/Package");

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = asyncHandler(async (req, res) => {
  try {
    const {
      packageId,
      travelDate,
      travelers,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    // Validate required fields
    if (!packageId || !travelDate || !travelers) {
      return res
        .status(400)
        .json({ message: "Missing required booking information" });
    }

    // Get package details
    const tourPackage = await Package.findById(packageId);
    if (!tourPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    // Calculate total amount
    const totalAmount = tourPackage.price * travelers;

    // Create a customer in Stripe
    const customer = await stripe.customers.create({
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    });

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Stripe uses cents
      currency: "pkr",
      customer: customer.id,
      metadata: {
        packageId: packageId,
        packageName: tourPackage.title,
        travelDate: travelDate,
        travelers: travelers,
        userId: req.user.id,
      },
    });

    // Create a pending booking
    const booking = new Booking({
      package: packageId,
      user: req.user.id,
      packageName: tourPackage.title,
      packageImage: tourPackage.img,
      travelDate: new Date(travelDate),
      travelers: travelers,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      totalAmount: totalAmount,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: customer.id,
    });

    await booking.save();

    // Create a payment record
    const payment = await Payment.create({
      booking: booking._id,
      amount: totalAmount,
      stripePaymentIntentId: paymentIntent.id,
      customerName: customerName || req.user.name,
      customerEmail: customerEmail || req.user.email,
      customerPhone: customerPhone,
      status: "pending",
    });

    // Return client secret
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      bookingId: booking._id,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      type: error.type || "server_error",
    });
  }
});

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
exports.confirmPayment = asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID and booking ID are required",
      });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log("Payment intent status:", paymentIntent.status);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment not successful",
        paymentStatus: paymentIntent.status,
      });
    }

    // Update booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Update booking status and payment status
    booking.paymentStatus =
      paymentIntent.status === "succeeded" ? "paid" : "unpaid";
    booking.status = "pending";
    booking.stripeChargeId = paymentIntent.latest_charge;
    booking.transactionId = `TRX-${Date.now()}`;
    booking.paymentMethod = "credit_card";

    // Save booking with updated payment information
    const updatedBooking = await booking.save();
    console.log(
      "Updated booking payment status:",
      updatedBooking.paymentStatus
    );

    // Find and update the payment record
    let payment = await Payment.findOne({
      booking: bookingId,
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      // Create a new payment record if one doesn't exist
      payment = await Payment.create({
        booking: bookingId,
        amount: booking.totalAmount,
        stripePaymentIntentId: paymentIntentId,
        stripeChargeId: paymentIntent.latest_charge,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        status: paymentIntent.status === "succeeded" ? "succeeded" : "pending",
        paymentMethod: "credit_card",
      });
    } else {
      // Update existing payment record
      payment.stripeChargeId = paymentIntent.latest_charge;
      payment.status =
        paymentIntent.status === "succeeded" ? "succeeded" : "pending";
      await payment.save();
    }

    // Double-check that booking was updated correctly
    const finalBooking = await Booking.findById(bookingId);

    res.json({
      success: true,
      booking: finalBooking,
      payment,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      type: error.type || "server_error",
    });
  }
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = asyncHandler(async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate({
      path: "booking",
      populate: {
        path: "package",
        select: "title img price",
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Check if user is authorized to view this payment
    if (
      payment.booking.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this payment",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error retrieving payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      type: error.type || "server_error",
    });
  }
});

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
exports.getUserPayments = asyncHandler(async (req, res) => {
  try {
    // Find all payments for bookings made by the user
    const bookings = await Booking.find({ user: req.user.id });
    const bookingIds = bookings.map((booking) => booking._id);

    const payments = await Payment.find({
      booking: { $in: bookingIds },
    }).populate({
      path: "booking",
      select: "packageName travelDate travelers totalAmount status",
    });

    res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.error("Error retrieving user payments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      type: error.type || "server_error",
    });
  }
});

// @desc    Get Stripe balance
// @route   GET /api/payments/balance
// @access  Private/Admin
exports.getStripeBalance = asyncHandler(async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();

    res.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.error("Error retrieving balance:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      type: error.type || "server_error",
    });
  }
});

// @desc    Get Stripe transactions
// @route   GET /api/payments/stripe/transactions
// @access  Private/Admin
exports.getStripeTransactions = asyncHandler(async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Get the charges with pagination
    const charges = await stripe.charges.list({
      limit: limit,
    });

    res.json({
      success: true,
      count: charges.data.length,
      pagination: {
        page,
        limit,
      },
      data: charges.data,
    });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      type: error.type || "server_error",
    });
  }
});

// @desc    Get transaction details
// @route   GET /api/payments/stripe/transactions/:id
// @access  Private/Admin
exports.getTransactionDetails = asyncHandler(async (req, res) => {
  try {
    // Get the charge from Stripe
    const charge = await stripe.charges.retrieve(req.params.id);

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Find the corresponding payment in our database
    const payment = await Payment.findOne({
      stripeChargeId: req.params.id,
    }).populate({
      path: "booking",
      select:
        "packageName travelDate travelers totalAmount status paymentStatus customerName customerEmail customerPhone",
    });

    // Combine Stripe data with our customer data
    let responseData = { ...charge };

    // If we have the payment in our database, add our customer info
    if (payment) {
      // Add our customer info to the billing_details
      responseData.enhanced_billing_details = {
        name: payment.customerName || payment.booking?.customerName,
        email: payment.customerEmail || payment.booking?.customerEmail,
        phone: payment.customerPhone || payment.booking?.customerPhone,
        payment_id: payment._id,
        booking_id: payment.booking?._id,
        package_name: payment.booking?.packageName,
        travel_date: payment.booking?.travelDate,
        status: payment.status,
        booking_status: payment.booking?.status,
      };
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error retrieving transaction details:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      type: error.type || "server_error",
    });
  }
});

// @desc    Get all payments (admin only)
// @route   GET /api/payments/admin/all
// @access  Private/Admin
exports.getAllPayments = asyncHandler(async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Get total count for pagination
    const total = await Payment.countDocuments();

    // Query with pagination and populate booking details
    const payments = await Payment.find()
      .populate({
        path: "booking",
        select: "packageName travelDate travelers totalAmount status user",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      count: payments.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: payments,
    });
  } catch (error) {
    console.error("Error retrieving payments:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      type: error.type || "server_error",
    });
  }
});

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private/Admin
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (
      !status ||
      !["pending", "succeeded", "failed", "refunded"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status. Must be one of: pending, succeeded, failed, refunded",
      });
    }

    // Find payment
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Update payment status
    payment.status = status;
    await payment.save();

    // Always update the booking status to match payment status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      // Synchronize booking status with payment status
      if (status === "succeeded") {
        booking.paymentStatus = "paid";
        booking.status = "confirmed";
      } else if (status === "refunded") {
        booking.paymentStatus = "refunded";
        booking.status = "cancelled";
      } else if (status === "failed") {
        booking.paymentStatus = "unpaid";
        booking.status = "pending";
      } else if (status === "pending") {
        booking.paymentStatus = "pending";
        booking.status = "pending";
      }

      await booking.save();

      // Send email notification about payment status update
      try {
        const sendEmail = require("../utils/sendEmail");
        const {
          paymentStatusUpdateTemplate,
          bookingStatusUpdateTemplate,
        } = require("../utils/emailTemplates");

        // Send payment status update email
        await sendEmail({
          email: booking.customerEmail,
          subject: `Payment Status Update - ${booking.packageName}`,
          html: paymentStatusUpdateTemplate(booking),
        });

        // Also send booking status update email if status changed
        await sendEmail({
          email: booking.customerEmail,
          subject: `Booking Status Update - ${booking.packageName}`,
          html: bookingStatusUpdateTemplate(booking),
        });
      } catch (emailError) {
        console.error("Error sending status update emails:", emailError);
        // Continue even if email fails
      }
    }

    // Return updated payment with booking details
    const updatedPayment = await Payment.findById(req.params.id).populate({
      path: "booking",
      select:
        "packageName travelDate travelers totalAmount status paymentStatus",
    });

    res.json({
      success: true,
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      type: error.type || "server_error",
    });
  }
});
