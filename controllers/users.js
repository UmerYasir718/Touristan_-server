const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  // Add pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Get total count for pagination
  const total = await User.countDocuments();
  
  // Query with pagination
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Get booking counts for each user
  const userIds = users.map(user => user._id);
  const bookingCounts = await Booking.aggregate([
    { $match: { user: { $in: userIds } } },
    { $group: { _id: '$user', count: { $sum: 1 } } }
  ]);
  
  // Create a map of user ID to booking count
  const bookingCountMap = {};
  bookingCounts.forEach(item => {
    bookingCountMap[item._id] = item.count;
  });
  
  // Add booking count to each user
  const usersWithBookingCount = users.map(user => {
    const userObj = user.toObject();
    userObj.bookingCount = bookingCountMap[user._id] || 0;
    return userObj;
  });
  
  res.json({
    success: true,
    count: users.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: usersWithBookingCount
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Get booking count and basic booking info
  const bookingCount = await Booking.countDocuments({ user: req.params.id });
  
  // Only fetch basic booking info if there are bookings
  let recentBookings = [];
  if (bookingCount > 0) {
    recentBookings = await Booking.find({ user: req.params.id })
      .select('packageName travelDate status')
      .sort({ createdAt: -1 })
      .limit(3);
  }
  
  res.json({
    success: true,
    data: {
      user,
      bookings: {
        count: bookingCount,
        recent: recentBookings
      }
    }
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  
  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  // Remove password field if included in request
  if (req.body.password) {
    delete req.body.password;
  }
  
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  // Validate status
  if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be one of: active, inactive, suspended"
    });
  }
  
  const user = await User.findByIdAndUpdate(
    req.params.id, 
    { status }, 
    { new: true }
  );
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Check if user has bookings
  const bookings = await Booking.countDocuments({ user: req.params.id });
  
  if (bookings > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with existing bookings'
    });
  }
  
  await user.deleteOne();
  
  res.json({
    success: true,
    data: {}
  });
});
