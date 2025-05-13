const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  packageName: String,
  packageImage: String,
  travelDate: {
    type: Date,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  travelers: {
    type: Number,
    required: true,
    min: 1,
  },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "partial", "refunded"],
    default: "unpaid",
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "bank_transfer", "cash"],
    default: "credit_card",
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  stripePaymentIntentId: String,
  stripeCustomerId: String,
  stripeChargeId: String,
  transactionId: String,
});

module.exports = mongoose.model("Booking", BookingSchema);
