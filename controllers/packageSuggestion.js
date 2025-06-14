const PackageSuggestion = require('../models/PackageSuggestion');
const Package = require('../models/Package');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Create new package suggestion
// @route   POST /api/package-suggestions
// @access  Private
exports.createPackageSuggestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add user ID to request body
    req.body.user = req.user.id;

    // Create package suggestion
    const packageSuggestion = await PackageSuggestion.create(req.body);

    res.status(201).json({
      success: true,
      data: packageSuggestion
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all package suggestions for logged in user
// @route   GET /api/package-suggestions/my-suggestions
// @access  Private
exports.getUserPackageSuggestions = async (req, res, next) => {
  try {
    const suggestions = await PackageSuggestion.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single package suggestion
// @route   GET /api/package-suggestions/:id
// @access  Private
exports.getPackageSuggestion = async (req, res, next) => {
  try {
    const suggestion = await PackageSuggestion.findById(req.params.id);

    if (!suggestion) {
      return next(
        new ErrorResponse(`Package suggestion not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the suggestion or is admin
    if (suggestion.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to access this suggestion`, 401)
      );
    }

    res.status(200).json({
      success: true,
      data: suggestion
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update package suggestion
// @route   PUT /api/package-suggestions/:id
// @access  Private
exports.updatePackageSuggestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let suggestion = await PackageSuggestion.findById(req.params.id);

    if (!suggestion) {
      return next(
        new ErrorResponse(`Package suggestion not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the suggestion
    if (suggestion.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this suggestion`, 401)
      );
    }

    // Check if suggestion is already approved or rejected
    if (suggestion.status !== 'pending') {
      return next(
        new ErrorResponse(`Cannot update suggestion that is already ${suggestion.status}`, 400)
      );
    }

    // Update suggestion
    suggestion = await PackageSuggestion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: suggestion
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete package suggestion
// @route   DELETE /api/package-suggestions/:id
// @access  Private
exports.deletePackageSuggestion = async (req, res, next) => {
  try {
    const suggestion = await PackageSuggestion.findById(req.params.id);

    if (!suggestion) {
      return next(
        new ErrorResponse(`Package suggestion not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the suggestion or is admin
    if (suggestion.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to delete this suggestion`, 401)
      );
    }

    // Check if suggestion is already approved
    if (suggestion.status === 'approved' && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`Cannot delete suggestion that is already approved`, 400)
      );
    }

    await suggestion.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload main package suggestion image
// @route   PUT /api/package-suggestions/:id/image
// @access  Private
exports.uploadPackageSuggestionImage = async (req, res, next) => {
  try {
    const suggestion = await PackageSuggestion.findById(req.params.id);

    if (!suggestion) {
      return next(
        new ErrorResponse(`Package suggestion not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the suggestion
    if (suggestion.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this suggestion`, 401)
      );
    }

    // Check if suggestion is already approved or rejected
    if (suggestion.status !== 'pending') {
      return next(
        new ErrorResponse(`Cannot update suggestion that is already ${suggestion.status}`, 400)
      );
    }

    // Check if image was uploaded
    if (!req.body.img) {
      return next(new ErrorResponse('Please upload an image', 400));
    }

    // Update suggestion with new image
    const updatedSuggestion = await PackageSuggestion.findByIdAndUpdate(
      req.params.id,
      { img: req.body.img },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedSuggestion
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload multiple package suggestion images
// @route   PUT /api/package-suggestions/:id/images
// @access  Private
exports.uploadPackageSuggestionImages = async (req, res, next) => {
  try {
    const suggestion = await PackageSuggestion.findById(req.params.id);

    if (!suggestion) {
      return next(
        new ErrorResponse(`Package suggestion not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns the suggestion
    if (suggestion.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to update this suggestion`, 401)
      );
    }

    // Check if suggestion is already approved or rejected
    if (suggestion.status !== 'pending') {
      return next(
        new ErrorResponse(`Cannot update suggestion that is already ${suggestion.status}`, 400)
      );
    }

    // Check if images were uploaded
    if (!req.body.images || req.body.images.length === 0) {
      return next(new ErrorResponse('Please upload at least one image', 400));
    }

    // Update suggestion with new images
    const updatedSuggestion = await PackageSuggestion.findByIdAndUpdate(
      req.params.id,
      { images: req.body.images },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedSuggestion
    });
  } catch (err) {
    next(err);
  }
};

// ADMIN CONTROLLERS

// @desc    Get all package suggestions (Admin)
// @route   GET /api/package-suggestions/admin
// @access  Private/Admin
exports.getAllPackageSuggestions = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Filter by status if provided
    const filter = {};
    if (req.query.status && ['pending', 'approved', 'rejected'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    
    const total = await PackageSuggestion.countDocuments(filter);
    
    // Get suggestions with user details
    const suggestions = await PackageSuggestion.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: suggestions.length,
      pagination,
      data: suggestions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve package suggestion (Admin)
// @route   PUT /api/package-suggestions/:id/approve
// @access  Private/Admin
exports.approvePackageSuggestion = async (req, res, next) => {
  try {
    const suggestion = await PackageSuggestion.findById(req.params.id);

    if (!suggestion) {
      return next(
        new ErrorResponse(`Package suggestion not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if suggestion is already processed
    if (suggestion.status !== 'pending') {
      return next(
        new ErrorResponse(`Suggestion is already ${suggestion.status}`, 400)
      );
    }

    // Update suggestion status to approved
    suggestion.status = 'approved';
    if (req.body.adminFeedback) {
      suggestion.adminFeedback = req.body.adminFeedback;
    }
    await suggestion.save();

    // Create a new package from the suggestion
    const packageData = {
      title: suggestion.title,
      desc: suggestion.desc,
      img: suggestion.img,
      startPoint: suggestion.startPoint,
      destinations: suggestion.destinations,
      duration: suggestion.duration,
      price: suggestion.price,
      coordinates: suggestion.coordinates,
      images: suggestion.images,
      itinerary: suggestion.itinerary,
      // Add the new fields from the suggestion
      hostelType: suggestion.hostelType,
      hostelTypeDetails: suggestion.hostelTypeDetails,
      transportType: suggestion.transportType,
      transportTypeDetails: suggestion.transportTypeDetails,
      mealPlan: suggestion.mealPlan,
      mealPlanDetails: suggestion.mealPlanDetails,
      activities: suggestion.activities,
      // Set as active but not featured by default
      active: true,
      featured: false
    };

    // Create the new package
    const newPackage = await Package.create(packageData);

    res.status(200).json({
      success: true,
      data: {
        suggestion,
        package: newPackage
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject package suggestion (Admin)
// @route   PUT /api/package-suggestions/:id/reject
// @access  Private/Admin
exports.rejectPackageSuggestion = async (req, res, next) => {
  try {
    const suggestion = await PackageSuggestion.findById(req.params.id);

    if (!suggestion) {
      return next(
        new ErrorResponse(`Package suggestion not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if suggestion is already processed
    if (suggestion.status !== 'pending') {
      return next(
        new ErrorResponse(`Suggestion is already ${suggestion.status}`, 400)
      );
    }

    // Admin feedback is required for rejection
    if (!req.body.adminFeedback) {
      return next(
        new ErrorResponse('Please provide feedback for rejection', 400)
      );
    }

    // Update suggestion status to rejected with feedback
    suggestion.status = 'rejected';
    suggestion.adminFeedback = req.body.adminFeedback;
    await suggestion.save();

    res.status(200).json({
      success: true,
      data: suggestion
    });
  } catch (err) {
    next(err);
  }
};
