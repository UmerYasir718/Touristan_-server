const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes - blocks access if no valid token
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded in protect:', decoded);

    // Get user from the token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 401));
    }

    // Add user and role to request
    req.user = user;
    console.log('User found in protect:', req.user.email, 'Role:', req.user.role);

    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'jwt expired',
        message: 'JWT token has expired. Please log in again.'
      });
    }
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Optional auth - sets req.user if token exists but doesn't block if no token
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in optionalAuth:', token.substring(0, 10) + '...');
  }

  // If no token, just continue (but req.user will be undefined)
  if (!token) {
    console.log('No token provided in optionalAuth');
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded in optionalAuth:', decoded);

    // Find user by ID
    const user = await User.findById(decoded.id);
    
    if (user) {
      // Add user and role to request
      req.user = user;
      console.log('User found in optionalAuth:', user.email, 'Role:', user.role);
    } else {
      console.log('User ID from token not found in database:', decoded.id);
    }
  } catch (err) {
    console.error('JWT verification error in optionalAuth:', err.message);
  }

  next();
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('In authorize middleware, req.user:', req.user ? `Found (role: ${req.user.role})` : 'Not found');
    console.log('Allowed roles:', roles);
    
    // If req.user doesn't exist, user is not authenticated
    if (!req.user) {
      return next(
        new ErrorResponse('Not authorized to access this route', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};