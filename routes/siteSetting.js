const express = require('express');
const { check } = require('express-validator');
const { 
  updateSiteSettings, 
  getSiteSettings, 
  updateLogo, 
  updateFavicon, 
  updateBusinessHours,
  updateLocation
} = require('../controllers/siteSetting');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route to get site settings
router.get('/', getSiteSettings);

// Admin only routes - protected
router.use(protect);
router.use(authorize('admin'));

// Update site settings
router.post(
  '/',
  [
    check('businessName', 'Business name is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ],
  updateSiteSettings
);

// Update logo
router.put('/logo', updateLogo);

// Update favicon
router.put('/favicon', updateFavicon);

// Update business hours
router.put('/business-hours', updateBusinessHours);

// Update location
router.put('/location', updateLocation);

module.exports = router;
