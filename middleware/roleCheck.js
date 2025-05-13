const ErrorResponse = require('../utils/errorResponse');

// Role-based access configuration
const roleConfig = {
  admin: {
    allowedRoutes: [
      '/dashboard',
      '/packages/manage',
      '/users/manage',
      '/bookings/manage',
      '/reviews/manage'
    ]
  },
  user: {
    allowedRoutes: [
      '/profile',
      '/bookings',
      '/reviews/add',
      '/packages',
      '/packages/:id'
    ]
  }
};

// Check if user has access to the requested route based on their role
exports.checkRouteAccess = (req, res, next) => {
  const { user } = req;
  const path = req.originalUrl.split('?')[0]; // Remove query parameters
  
  if (!user || !user.role) {
    return next(new ErrorResponse('User role not defined', 403));
  }
  
  const userRole = user.role;
  
  if (!roleConfig[userRole]) {
    return next(new ErrorResponse(`Role ${userRole} is not configured`, 403));
  }
  
  const allowedRoutes = roleConfig[userRole].allowedRoutes;
  const isRouteAllowed = allowedRoutes.some(route => {
    // Handle route parameters
    if (route.includes(':')) {
      const routeRegex = new RegExp('^' + route.replace(/:[^\s/]+/g, '([\\w-]+)') + '$');
      return routeRegex.test(path);
    }
    return route === path;
  });
  
  if (!isRouteAllowed) {
    return next(
      new ErrorResponse(
        `User with role ${userRole} is not authorized to access this route`,
        403
      )
    );
  }
  
  next();
};

// Export the role configuration for frontend use
exports.getRoleConfig = (req, res) => {
  res.status(200).json({
    success: true,
    data: roleConfig
  });
};
