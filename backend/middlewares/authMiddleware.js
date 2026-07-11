const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes: validates the Bearer token in request headers.
 * Populates req.user with the user object if verified successfully.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Token in Authorization Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'doctor_queue_secret_key_2026_dev');

      // Find the associated user in the database (omit password)
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user account no longer exists'));
      }

      next();
    } catch (error) {
      console.error('[AuthMiddleware] JWT Token verification failure:', error.message);
      res.status(401);
      return next(new Error('Not authorized, token verification failed'));
    }
  } else {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

/**
 * Middleware to restrict access to specific roles.
 * Must be executed AFTER the protect middleware.
 * 
 * @param {...string} roles - List of roles permitted to access the route
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, please log in'));
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`Access Denied: Role '${req.user.role}' is not authorized to access this resource`));
    }

    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
