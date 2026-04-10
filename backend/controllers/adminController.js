const bcrypt = require("bcryptjs");

const { prisma } = require("../config/postgres");
const { createNotification } = require("../services/notificationService");
const generateToken = require("../utils/generateToken");

const getSafeAdmin = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const adminLogin = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    const hasAdmin = (await prisma.user.count({ where: { role: "ADMIN" } })) > 0;

    if (!user) {
      if (hasAdmin) {
        res.status(401).json({
          success: false,
          message: "Invalid admin credentials.",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user = await prisma.user.create({
        data: {
          name: "Platform Admin",
          email,
          password: hashedPassword,
          role: "ADMIN",
          isVerified: true,
        },
      });
    } else {
      if (user.role !== "ADMIN") {
        res.status(403).json({
          success: false,
          message: "This account is not an administrator.",
        });
        return;
      }

      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        res.status(401).json({
          success: false,
          message: "Invalid admin credentials.",
        });
        return;
      }
    }

    await createNotification({
      userId: user.id,
      type: "ADMIN_LOGIN",
      message: "Administrator login successful.",
      link: "/admin/dashboard",
    });

    res.json({
      success: true,
      token: generateToken(user),
      user: getSafeAdmin(user),
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrganizations,
      totalLeads,
      totalDeals,
      unreadNotifications,
      newLeads,
      qualifiedLeads,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.lead.count(),
      prisma.deal.count(),
      prisma.notification.count({
        where: {
          userId: req.user.id,
          is_read: false,
        },
      }),
      prisma.lead.count({ where: { status: "new" } }),
      prisma.lead.count({ where: { status: "qualified" } }),
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          totalUsers,
          totalOrganizations,
          totalLeads,
          totalDeals,
          unreadNotifications,
        },
        pipeline: {
          newLeads,
          qualifiedLeads,
        },
        admin: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addTagsToUser = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "User tagging is not available in the current Prisma schema.",
  });
};

module.exports = {
  addTagsToUser,
  adminLogin,
  getDashboardSummary,
};
