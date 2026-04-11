const { prisma } = require("../config/postgres");
const {
  markAllNotificationsRead,
  markNotificationRead,
} = require("../services/notificationService");

const listNotifications = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const unreadOnly = req.query.unreadOnly === "true";
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      ...(unreadOnly ? { is_read: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: req.user.id,
          is_read: false,
        },
      }),
    ]);

    res.json({
      success: true,
      data: notifications,
      summary: {
        unreadCount,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const readNotification = async (req, res, next) => {
  try {
    const notification = await markNotificationRead(req.params.id, req.user.id);

    if (!notification) {
      res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
      return;
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const readAllNotifications = async (req, res, next) => {
  try {
    const result = await markAllNotificationsRead(req.user.id);

    res.json({
      success: true,
      message: "All notifications marked as read.",
      updatedCount: result.count,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listNotifications,
  readAllNotifications,
  readNotification,
};
