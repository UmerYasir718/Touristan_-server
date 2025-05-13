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

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) return null;
  
  // Extract the public ID from the URL
  const parts = url.split('/');
  const filenamePart = parts[parts.length - 1];
  const publicId = `packages/${filenamePart.split('.')[0]}`;
  return publicId;
};

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
exports.getPackages = async (req, res, next) => {
  try {
    // Add query parameters for filtering
    const query = { active: true };
    
    // Check if featured filter is applied
    if (req.query.featured === 'true') {
      query.featured = true;
    }

    // Find packages based on query
    const packages = await Package.find(query);

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
exports.getPackage = async (req, res, next) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return next(
        new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if package is active or user is admin
    // req.user will be set by optionalAuth middleware if token is provided
    const isAdmin = req.user && req.user.role === 'admin';
    console.log('User checking package:', req.user ? `${req.user.email} (${req.user.role})` : 'Unauthenticated');
    console.log('Package active status:', package.active);
    
    if (!package.active && !isAdmin) {
      return next(
        new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: package
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new package
// @route   POST /api/packages
// @access  Private/Admin
exports.createPackage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create package
    const package = await Package.create(req.body);

    res.status(201).json({
      success: true,
      data: package
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Admin
exports.updatePackage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let package = await Package.findById(req.params.id);

    if (!package) {
      return next(
        new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
      );
    }

    // Update package
    package = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: package
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload main package image
// @route   PUT /api/packages/:id/image
// @access  Private/Admin
exports.uploadPackageImage = async (req, res, next) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return next(
        new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if image was uploaded or URL was provided
    if (!req.body.img) {
      return next(new ErrorResponse('Please upload an image or provide an image URL', 400));
    }

    // If package already has an image, delete the old one from Cloudinary
    if (package.img) {
      const publicId = getPublicIdFromUrl(package.img);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Update package with new image
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { img: req.body.img },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedPackage
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload multiple package images
// @route   PUT /api/packages/:id/images
// @access  Private/Admin
exports.uploadPackageImages = async (req, res, next) => {
  try {
    const package = await Package.findById(req.params.id);

    if (!package) {
      return next(
        new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
      );
    }

    // Check if images were uploaded or URLs were provided
    if (!req.body.images || req.body.images.length === 0) {
      return next(new ErrorResponse('Please upload at least one image or provide image URLs', 400));
    }

    // If package already has images, delete the old ones from Cloudinary
    if (package.images && package.images.length > 0) {
      for (const img of package.images) {
        const publicId = getPublicIdFromUrl(img);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // Update package with new images
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { images: req.body.images },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedPackage
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Disable package (soft delete)
// @route   PUT /api/packages/:id/disable
// @access  Private/Admin
exports.disablePackage = async (req, res, next) => {
  try {
    let package = await Package.findById(req.params.id);

    if (!package) {
      return next(
        new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
      );
    }

    // Set active to false (soft delete)
    package = await Package.findByIdAndUpdate(
      req.params.id,
      { active: false },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: package
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Enable package
// @route   PUT /api/packages/:id/enable
// @access  Private/Admin
exports.enablePackage = async (req, res, next) => {
  try {
    let package = await Package.findById(req.params.id);

    if (!package) {
      return next(
        new ErrorResponse(`Package not found with id of ${req.params.id}`, 404)
      );
    }

    // Set active to true
    package = await Package.findByIdAndUpdate(
      req.params.id,
      { active: true },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: package
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all packages (including inactive) - Admin only
// @route   GET /api/packages/admin/all
// @access  Private/Admin
exports.getAllPackagesAdmin = async (req, res, next) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Get total count for pagination
    const total = await Package.countDocuments();
    
    // Query with pagination
    const packages = await Package.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: packages.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: packages
    });
  } catch (err) {
    next(err);
  }
};
