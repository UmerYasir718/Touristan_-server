const express = require("express");
const {
  register,
  login,
  getMe,
  adminLogin,
  updateProfile,
  updateProfilePhoto,
  changePassword,
  getUserBookings,
  getUserBookingDetails,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");
const { getRoleConfig } = require("../middleware/roleCheck");
const { check } = require("express-validator");
const { uploadProfileImage } = require("../middleware/upload");

const router = express.Router();

router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  register
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);

router.post(
  "/admin/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  adminLogin
);

// Forgot Password
router.post("/forgotpassword", forgotPassword);

// Reset Password
router.put("/resetpassword/:token", resetPassword);

// Protected routes
router.use(protect);

router.get("/me", getMe);

// Profile update routes
router.put(
  "/updateprofile",
  [
    check("name", "Name is required if provided").optional().not().isEmpty(),
    check("email", "Please include a valid email if provided")
      .optional()
      .isEmail(),
  ],
  updateProfile
);

router.put("/updatephoto", uploadProfileImage, updateProfilePhoto);

router.put(
  "/changepassword",
  [
    check("currentPassword", "Current password is required").exists(),
    check("newPassword", "New password must be at least 6 characters").isLength(
      { min: 6 }
    ),
  ],
  changePassword
);

// User booking routes
router.get("/bookings", getUserBookings);
router.get("/bookings/:id", getUserBookingDetails);

// Get role configuration for frontend
router.get("/role-config", getRoleConfig);

module.exports = router;
