const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Import controllers
const {
  getPackageReviews,
  getAllReviews,
  getReview,
  createReview,
  approveReview,
  deleteReview,
  getUserReviews,
  getEligibleReviewPackages
} = require('../controllers/review');

// Public routes - Get approved reviews for a package
router.get('/package/:packageId', getPackageReviews);

// Protected routes
router.use(protect);

// Get packages eligible for user review
router.get('/eligible', getEligibleReviewPackages);

// User routes
router.route('/')
  .post(createReview)
  .get(getUserReviews);

// Admin routes
router.get('/admin', authorize('admin'), getAllReviews);
router.put('/:id/approve', authorize('admin'), approveReview);

// Routes that can be accessed by review owner or admin
router.route('/:id')
  .get(getReview)
  .delete(deleteReview);

module.exports = router;