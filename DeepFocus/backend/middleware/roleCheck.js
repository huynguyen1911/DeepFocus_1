/**
 * Role Check Middleware
 * Verifies that authenticated user has required role(s)
 */

/**
 * Middleware to require specific role(s)
 * @param {string[]} allowedRoles - Array of allowed role types
 * @returns {Function} Express middleware
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get user's active roles
    const userRoles = req.user.roles
      .filter((r) => r.isActive)
      .map((r) => r.type);

    // Check if user has any of the required roles
    const hasRequiredRole = allowedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}`,
        requiredRoles: allowedRoles,
        userRoles: userRoles,
      });
    }

    // Store allowed roles in request for later use
    req.allowedRoles = allowedRoles;

    next();
  };
};

/**
 * Middleware to check if user has ALL specified roles
 * @param {string[]} requiredRoles - Array of required role types
 * @returns {Function} Express middleware
 */
const requireAllRoles = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRoles = req.user.roles
      .filter((r) => r.isActive)
      .map((r) => r.type);

    // Check if user has ALL required roles
    const hasAllRoles = requiredRoles.every((role) => userRoles.includes(role));

    if (!hasAllRoles) {
      return res.status(403).json({
        success: false,
        message: `Access denied. All of these roles are required: ${requiredRoles.join(
          ", "
        )}`,
        requiredRoles: requiredRoles,
        userRoles: userRoles,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user's primary role matches
 * @param {string[]} allowedPrimaryRoles - Array of allowed primary role types
 * @returns {Function} Express middleware
 */
const requirePrimaryRole = (allowedPrimaryRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const primaryRole = req.user.roles.find((r) => r.isPrimary);

    if (!primaryRole || !allowedPrimaryRoles.includes(primaryRole.type)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Primary role must be one of: ${allowedPrimaryRoles.join(
          ", "
        )}`,
        requiredPrimaryRoles: allowedPrimaryRoles,
        currentPrimaryRole: primaryRole ? primaryRole.type : null,
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
  requireAllRoles,
  requirePrimaryRole,
};
