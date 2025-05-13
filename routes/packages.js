const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { check } = require('express-validator');
const { uploadPackageImage: uploadSingleImage, uploadPackageImages: uploadMultipleImages } = require('../middleware/upload');
const router = express.Router();

// Import controllers
const {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  disablePackage,
  enablePackage,
  getAllPackagesAdmin,
  uploadPackageImage,
  uploadPackageImages
} = require('../controllers/package');

// Apply optional auth to all routes
router.use(optionalAuth);

// Public routes - accessible to all users (but will have req.user if authenticated)
router.get('/', getPackages);
router.get('/:id', getPackage);

// Protected routes - require authentication
router.use(protect); // - No longer needed as we check in the authorize middleware

// Admin only routes
router.get('/admin/all', authorize('admin'), getAllPackagesAdmin);

// Image upload routes - for file uploads
router.put('/:id/image', authorize('admin'), uploadSingleImage, uploadPackageImage);
router.put('/:id/images', authorize('admin'), uploadMultipleImages, uploadPackageImages);

// Direct URL routes - for when you already have image URLs
router.put('/:id/image-url', authorize('admin'), uploadPackageImage);
router.put('/:id/images-url', authorize('admin'), uploadPackageImages);

router.post(
  '/',
  authorize('admin'),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('desc', 'Description is required').not().isEmpty(),
    check('img', 'Main image URL is required').not().isEmpty(),
    check('startPoint', 'Starting point is required').not().isEmpty(),
    check('destinations', 'At least one destination is required').isArray({ min: 1 }),
    check('duration', 'Duration is required').not().isEmpty(),
    check('price', 'Price is required and must be a number').isNumeric(),
    check('coordinates', 'Coordinates are required').isArray({ min: 1 }),
    check('images', 'At least one image is required').isArray({ min: 1 }),
    check('itinerary', 'Itinerary is required').isArray({ min: 1 })
  ],
  createPackage
);

router.put(
  '/:id',
  authorize('admin'),
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('desc', 'Description is required').optional().not().isEmpty(),
    check('img', 'Main image URL is required').optional().not().isEmpty(),
    check('startPoint', 'Starting point is required').optional().not().isEmpty(),
    check('destinations', 'At least one destination is required').optional().isArray({ min: 1 }),
    check('duration', 'Duration is required').optional().not().isEmpty(),
    check('price', 'Price is required and must be a number').optional().isNumeric(),
    check('coordinates', 'Coordinates are required').optional().isArray({ min: 1 }),
    check('images', 'At least one image is required').optional().isArray({ min: 1 }),
    check('itinerary', 'Itinerary is required').optional().isArray({ min: 1 })
  ],
  updatePackage
);

router.put('/:id/disable', authorize('admin'), disablePackage);
router.put('/:id/enable', authorize('admin'), enablePackage);

module.exports = router;