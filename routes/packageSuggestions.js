const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { check } = require('express-validator');
const { uploadSuggestionImage, uploadSuggestionImages } = require('../middleware/packageSuggestionUpload');
const router = express.Router();

// Import controllers
const {
  createPackageSuggestion,
  getUserPackageSuggestions,
  getPackageSuggestion,
  updatePackageSuggestion,
  deletePackageSuggestion,
  uploadPackageSuggestionImage,
  uploadPackageSuggestionImages,
  getAllPackageSuggestions,
  approvePackageSuggestion,
  rejectPackageSuggestion
} = require('../controllers/packageSuggestion');

// Protected routes - all routes require authentication
router.use(protect);

// User routes
router.get('/my-suggestions', getUserPackageSuggestions);

// Admin only routes - IMPORTANT: These must come BEFORE the /:id routes
router.get('/admin', authorize('admin'), getAllPackageSuggestions);

router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('desc', 'Description is required').not().isEmpty(),
    check('img', 'Main image URL is required').not().isEmpty(),
    check('startPoint', 'Starting point is required').not().isEmpty(),
    check('destinations', 'At least one destination is required').isArray({ min: 1 }),
    check('duration', 'Duration is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('hostelType', 'Hostel type is required').not().isEmpty(),
    check('transportType', 'Transport type is required').not().isEmpty(),
    check('mealPlan', 'Meal plan is required').not().isEmpty(),
    check('activities', 'At least one activity is required').isArray({ min: 1 }),
    check('coordinates', 'Coordinates are required').isArray({ min: 1 }),
    check('images', 'At least one image is required').isArray({ min: 1 }),
    check('itinerary', 'Itinerary is required').isArray({ min: 1 })
  ],
  createPackageSuggestion
);

// Image upload routes - for file uploads (these must come before the general /:id routes)
router.put('/:id/image', uploadSuggestionImage, uploadPackageSuggestionImage);
router.put('/:id/images', uploadSuggestionImages, uploadPackageSuggestionImages);
router.put('/:id/approve', authorize('admin'), approvePackageSuggestion);
router.put('/:id/reject', authorize('admin'), [
  check('adminFeedback', 'Feedback is required for rejection').not().isEmpty()
], rejectPackageSuggestion);

// Generic ID routes - these should come LAST
router.route('/:id')
  .get(getPackageSuggestion)
  .put([
    check('title', 'Title is required').optional().not().isEmpty(),
    check('desc', 'Description is required').optional().not().isEmpty(),
    check('startPoint', 'Starting point is required').optional().not().isEmpty(),
    check('destinations', 'At least one destination is required').optional().isArray({ min: 1 }),
    check('duration', 'Duration is required').optional().not().isEmpty(),
    check('price', 'Price is required and must be a number').optional().isNumeric(),
    check('hostelType', 'Hostel type is required').optional().not().isEmpty(),
    check('transportType', 'Transport type is required').optional().not().isEmpty(),
    check('mealPlan', 'Meal plan is required').optional().not().isEmpty(),
    check('activities', 'At least one activity is required').optional().isArray({ min: 1 }),
    check('coordinates', 'Coordinates are required').optional().isArray({ min: 1 }),
    check('itinerary', 'Itinerary is required').optional().isArray({ min: 1 })
  ], updatePackageSuggestion)
  .delete(deletePackageSuggestion);

module.exports = router;
