const SiteSetting = require('../models/SiteSetting');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

// @desc    Create or update site settings
// @route   POST /api/settings
// @access  Private/Admin
exports.updateSiteSettings = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if settings already exist
    let siteSettings = await SiteSetting.findOne();

    if (siteSettings) {
      // Update existing settings
      siteSettings = await SiteSetting.findByIdAndUpdate(
        siteSettings._id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
    } else {
      // Create new settings
      siteSettings = await SiteSetting.create(req.body);
    }

    res.status(200).json({
      success: true,
      data: siteSettings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
exports.getSiteSettings = async (req, res, next) => {
  try {
    const siteSettings = await SiteSetting.findOne();

    if (!siteSettings) {
      return next(new ErrorResponse('Site settings not found', 404));
    }

    res.status(200).json({
      success: true,
      data: siteSettings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update site logo
// @route   PUT /api/settings/logo
// @access  Private/Admin
exports.updateLogo = async (req, res, next) => {
  try {
    if (!req.body.logo) {
      return next(new ErrorResponse('Please provide a logo URL', 400));
    }

    const siteSettings = await SiteSetting.findOne();

    if (!siteSettings) {
      return next(new ErrorResponse('Site settings not found', 404));
    }

    siteSettings.logo = req.body.logo;
    siteSettings.updatedAt = Date.now();
    await siteSettings.save();

    res.status(200).json({
      success: true,
      data: siteSettings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update site favicon
// @route   PUT /api/settings/favicon
// @access  Private/Admin
exports.updateFavicon = async (req, res, next) => {
  try {
    if (!req.body.favicon) {
      return next(new ErrorResponse('Please provide a favicon URL', 400));
    }

    const siteSettings = await SiteSetting.findOne();

    if (!siteSettings) {
      return next(new ErrorResponse('Site settings not found', 404));
    }

    siteSettings.favicon = req.body.favicon;
    siteSettings.updatedAt = Date.now();
    await siteSettings.save();

    res.status(200).json({
      success: true,
      data: siteSettings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update business hours
// @route   PUT /api/settings/business-hours
// @access  Private/Admin
exports.updateBusinessHours = async (req, res, next) => {
  try {
    if (!req.body.businessHours || !Array.isArray(req.body.businessHours)) {
      return next(new ErrorResponse('Please provide valid business hours', 400));
    }

    const siteSettings = await SiteSetting.findOne();

    if (!siteSettings) {
      return next(new ErrorResponse('Site settings not found', 404));
    }

    siteSettings.businessHours = req.body.businessHours;
    siteSettings.updatedAt = Date.now();
    await siteSettings.save();

    res.status(200).json({
      success: true,
      data: siteSettings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update location
// @route   PUT /api/settings/location
// @access  Private/Admin
exports.updateLocation = async (req, res, next) => {
  try {
    if (!req.body.location || !req.body.location.coordinates || !Array.isArray(req.body.location.coordinates)) {
      return next(new ErrorResponse('Please provide valid location coordinates', 400));
    }

    const siteSettings = await SiteSetting.findOne();

    if (!siteSettings) {
      return next(new ErrorResponse('Site settings not found', 404));
    }

    siteSettings.location = req.body.location;
    siteSettings.updatedAt = Date.now();
    await siteSettings.save();

    res.status(200).json({
      success: true,
      data: siteSettings
    });
  } catch (err) {
    next(err);
  }
};
