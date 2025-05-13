const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

const {
  getDashboardStats,
  getBookingChartData,
  getRevenueChartData,
  getRecentActivity,
  generateTestData
} = require("../controllers/dashboard");

// All routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

// Dashboard routes
router.get("/stats", getDashboardStats);
router.get("/booking-chart", getBookingChartData);
router.get("/revenue-chart", getRevenueChartData);
router.get("/recent-activity", getRecentActivity);
router.post("/generate-test-data", generateTestData);

module.exports = router;
