const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "PKR",
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  stripePaymentIntentId: String,
  stripeChargeId: String,
  transactionId: String,
  status: {
    type: String,
    enum: ["pending", "succeeded", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    default: "credit_card",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
