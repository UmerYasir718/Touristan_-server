const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

const {
  getBookingById,
  getUserBookings,
  getAllBookings,
  createBooking,
  updateBookingStatus,
  cancelBooking
} = require("../controllers/booking");

// All routes require authentication
router.use(protect);

// User routes
router.get("/", getUserBookings);
router.get("/:id", getBookingById);
router.post("/", createBooking);
router.put("/:id/cancel", cancelBooking);

// Admin routes
router.get("/admin/all", authorize("admin"), getAllBookings);
router.put("/:id", authorize("admin"), updateBookingStatus);

module.exports = router;
