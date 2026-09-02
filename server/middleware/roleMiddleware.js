const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.employee) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!roles.includes(req.employee.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource"
      });
    }

    next();
  };
};

module.exports = authorize;