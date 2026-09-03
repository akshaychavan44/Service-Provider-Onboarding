const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. Required role: [${roles.join(', ')}]. Current role: ${req.user.role}.`,
      });
    }

    next();
  };
};

const adminMiddleware = requireRole('admin');
const providerMiddleware = requireRole('provider');

module.exports = {
  requireRole,
  adminMiddleware,
  providerMiddleware,
};
