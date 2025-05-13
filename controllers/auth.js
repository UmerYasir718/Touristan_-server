const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const { validationResult } = require("express-validator");
const sendEmail = require("../utils/sendEmail");
const { welcomeTemplate } = require("../utils/emailTemplates");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new ErrorResponse("Email already registered", 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: "user", // Default role is user
    });

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        subject: "Welcome to TouriStan!",
        html: welcomeTemplate(user),
      });
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Continue even if email fails
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log(email, password);
    // Check for user with admin role
    const user = await User.findOne({ email }).select("+password");
    console.log(user);
    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return next(new ErrorResponse("Not authorized as admin", 403));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log(isMatch);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Build update object with only allowed fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return next(new ErrorResponse("Email already in use", 400));
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile photo
// @route   PUT /api/auth/updatephoto
// @access  Private
exports.updateProfilePhoto = async (req, res, next) => {
  try {
    // The profileImage URL is already set in req.body by the uploadProfileImage middleware
    if (!req.body.profileImage) {
      return next(new ErrorResponse("Profile image upload failed", 400));
    }

    // Get the current user to check if we need to delete an old image
    const currentUser = await User.findById(req.user.id);

    // Update the user with the new profile image URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: req.body.profileImage },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Delete the old profile image from Cloudinary if it exists and isn't the default
    if (
      currentUser &&
      currentUser.profileImage &&
      currentUser.profileImage !== "default-profile.jpg" &&
      currentUser.profileImage !== req.body.profileImage
    ) {
      try {
        const cloudinary = require("cloudinary").v2;

        // Extract the public_id from the Cloudinary URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/profiles/image_id
        const urlParts = currentUser.profileImage.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `profiles/${publicIdWithExtension.split(".")[0]}`;

        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted old profile image: ${publicId}`);
      } catch (deleteErr) {
        console.error("Error deleting old profile image:", deleteErr);
        // Continue even if deletion fails
      }
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/changepassword
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(
        new ErrorResponse("Please provide both current and new password", 400)
      );
    }

    // Check current password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return next(new ErrorResponse("Current password is incorrect", 401));
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password - Send Reset Email
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide your email." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found with this email." });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL for frontend
    const url = process.env.FRONTEND_URL;
    console.log(url);
    const resetUrl = `${url}/reset-password/${resetToken}`;
    const { passwordResetTemplate } = require("../utils/emailTemplates");
    const html = passwordResetTemplate(user, resetUrl);

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        html,
      });
      res.status(200).json({ success: true, message: "Reset email sent." });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res
        .status(500)
        .json({ success: false, message: "Email could not be sent." });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const crypto = require("crypto");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token." });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password has been reset." });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user bookings
// @route   GET /api/auth/bookings
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await require("../models/Booking")
      .find({ user: req.user.id })
      .sort({ bookingDate: -1 })
      .populate("package", "name duration price location img");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user booking details
// @route   GET /api/auth/bookings/:id
// @access  Private
exports.getUserBookingDetails = async (req, res, next) => {
  try {
    const booking = await require("../models/Booking")
      .findById(req.params.id)
      .populate(
        "package",
        "name duration price location description img images"
      );

    if (!booking) {
      return next(
        new ErrorResponse(`Booking not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user owns booking
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse("Not authorized to access this booking", 403)
      );
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
