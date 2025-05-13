const Review = require("../models/Review");
const Package = require("../models/Package");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Get approved reviews for a package
// @route   GET /api/reviews/package/:packageId
// @access  Public
exports.getPackageReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    packageId: req.params.packageId,
    approved: true,
  })
    .populate("userId", "name")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/admin
// @access  Private/Admin
exports.getAllReviews = asyncHandler(async (req, res) => {
  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Get total count for pagination
  const total = await Review.countDocuments();

  // Query with pagination
  const reviews = await Review.find()
    .populate("userId", "name email")
    .populate("packageId", "title")
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: reviews,
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Private/Admin
exports.getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("userId", "name email")
    .populate("packageId", "title img");

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res) => {
  // Add user ID to request body
  req.body.userId = req.user.id;

  // Check if package exists
  const package = await Package.findById(req.body.packageId);

  if (!package) {
    return res.status(404).json({
      success: false,
      message: "Package not found",
    });
  }

  // Check if user has already reviewed this package
  const existingReview = await Review.findOne({
    userId: req.user.id,
    packageId: req.body.packageId,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: "You have already reviewed this package",
    });
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc    Update review approval status
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = asyncHandler(async (req, res) => {
  const { approved } = req.body;

  if (typeof approved !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Approved status must be a boolean value",
    });
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { approved },
    { new: true }
  )
    .populate("userId", "name email")
    .populate("packageId", "title");

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin or review owner
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found",
    });
  }

  // Check if user is review owner or admin
  if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(401).json({
      success: false,
      message: "Not authorized to delete this review",
    });
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
exports.getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ userId: req.user.id })
    .populate("packageId", "title img")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    Get packages eligible for user review
// @route   GET /api/reviews/eligible
// @access  Private
exports.getEligibleReviewPackages = asyncHandler(async (req, res) => {
  // 1. Get user's completed bookings (status: confirmed)
  const bookings = await require("../models/Booking").find({
    user: req.user.id,
    status: "confirmed",
  });

  // 2. Extract unique package IDs
  const bookedPackageIds = [...new Set(bookings.map(b => b.package.toString()))];
  if (bookedPackageIds.length === 0) {
    return res.status(200).json({ success: true, data: [] });
  }

  // 3. Find reviewed package IDs by this user
  const userReviews = await Review.find({
    userId: req.user.id,
    packageId: { $in: bookedPackageIds },
  });
  const reviewedPackageIds = userReviews.map(r => r.packageId.toString());

  // 4. Get eligible package IDs (not reviewed yet)
  const eligiblePackageIds = bookedPackageIds.filter(
    id => !reviewedPackageIds.includes(id)
  );
  if (eligiblePackageIds.length === 0) {
    return res.status(200).json({ success: true, data: [] });
  }

  // 5. Get package details
  const eligiblePackages = await Package.find({
    _id: { $in: eligiblePackageIds },
  }).select("title img price duration");

  res.status(200).json({
    success: true,
    count: eligiblePackages.length,
    data: eligiblePackages,
  });
});
