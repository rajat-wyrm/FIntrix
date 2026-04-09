const authz = (allowedRoles = []) => {
  return (req, res, next) => {
    // 1. Safety check: auth middleware must run first
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: user not authenticated",
      });
    }

    const { role } = req.user;

    // 2. Validate role exists
    if (!role) {
      return res.status(403).json({
        message: "Forbidden: user role not defined",
      });
    }

    // 3. Check permission
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    // 4. Permission granted
    next();
  };
};

module.exports = authz;
