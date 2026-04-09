const jwt = require("jsonwebtoken");

const { prisma } = require("../config/postgres");

const protect = async (req, res, next) => {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Re-read the user from the database so deleted accounts or role changes take effect immediately.
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id || decoded.userId) },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "The authenticated user could not be found.",
      });
      return;
    }

    // Attach only the fields downstream handlers commonly need to avoid repeating auth lookups in every controller.
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Your session is invalid or has expired.",
    });
  }
};

// Keep role checks centralized so routes can declare access rules without duplicating permission logic.
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
      return;
    }

    next();
  };

const isAdmin = authorize("ADMIN");

module.exports = {
  protect,
  authorize,
  isAdmin,
};
