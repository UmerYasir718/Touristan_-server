const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

const {
  createPaymentIntent,
  confirmPayment,
  getPayment,
  getUserPayments,
  getAllPayments,
  updatePaymentStatus,
  getStripeBalance,
  getStripeTransactions,
  getTransactionDetails
} = require("../controllers/payment");

// Protected routes
router.use(protect);

// User payment routes
router.post("/create-payment-intent", createPaymentIntent);
router.post("/confirm", confirmPayment);
router.get("/", getUserPayments);

// Admin-only routes
router.get("/admin/all", authorize("admin"), getAllPayments);
router.get("/stripe/balance", authorize("admin"), getStripeBalance);
router.get("/stripe/transactions", authorize("admin"), getStripeTransactions);
router.get("/stripe/transactions/:id", authorize("admin"), getTransactionDetails);

// These routes must be last to avoid conflicts with the routes above
router.get("/:id", getPayment);
router.put("/:id", authorize("admin"), updatePaymentStatus);

module.exports = router;
