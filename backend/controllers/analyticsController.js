const { prisma } = require("../config/postgres");

const buildInsights = (metrics) => {
  const insights = [];

  if (metrics.leads.total > 0 && metrics.leads.qualified / metrics.leads.total >= 0.35) {
    insights.push("Qualified lead volume is healthy. Consider prioritizing follow-up automation.");
  }

  if (metrics.searches.total === 0) {
    insights.push("Search tools have not been used yet. Encourage adoption from the dashboard.");
  }

  if (metrics.notifications.unread > 5) {
    insights.push("There are several unread notifications. Highlight operational follow-ups.");
  }

  if (insights.length === 0) {
    insights.push("Core metrics are stable. Continue monitoring search usage and lead conversion.");
  }

  return insights;
};

const getGlobalAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrganizations,
      totalLeads,
      totalDeals,
      totalNotifications,
      unreadNotifications,
      emailSearches,
      domainSearches,
      leadsByStatus,
      leadsBySource,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.lead.count(),
      prisma.deal.count(),
      prisma.notification.count(),
      prisma.notification.count({ where: { is_read: false } }),
      prisma.analyticsEvent.count({ where: { type: "EMAIL_SEARCH" } }),
      prisma.analyticsEvent.count({ where: { type: "DOMAIN_SEARCH" } }),
      prisma.lead.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.lead.groupBy({
        by: ["source"],
        _count: { source: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
        },
        organizations: {
          total: totalOrganizations,
        },
        leads: {
          total: totalLeads,
          byStatus: leadsByStatus.map((item) => ({
            status: item.status,
            count: item._count.status,
          })),
          bySource: leadsBySource.map((item) => ({
            source: item.source,
            count: item._count.source,
          })),
        },
        deals: {
          total: totalDeals,
        },
        searches: {
          email: emailSearches,
          domain: domainSearches,
          total: emailSearches + domainSearches,
        },
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyAnalytics = async (req, res, next) => {
  try {
    const [myLeads, myQualifiedLeads, myNotifications, myUnreadNotifications, mySearches] =
      await Promise.all([
        prisma.lead.count({ where: { addedById: req.user.id } }),
        prisma.lead.count({
          where: { addedById: req.user.id, status: "qualified" },
        }),
        prisma.notification.count({
          where: { userId: req.user.id },
        }),
        prisma.notification.count({
          where: { userId: req.user.id, is_read: false },
        }),
        prisma.analyticsEvent.count({
          where: { userId: req.user.id },
        }),
      ]);

    res.json({
      success: true,
      data: {
        leads: {
          total: myLeads,
          qualified: myQualifiedLeads,
        },
        notifications: {
          total: myNotifications,
          unread: myUnreadNotifications,
        },
        searches: {
          total: mySearches,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAIAnalytics = async (req, res, next) => {
  try {
    const metrics = {
      leads: {
        total: await prisma.lead.count(),
        qualified: await prisma.lead.count({
          where: { status: "qualified" },
        }),
      },
      searches: {
        total: await prisma.analyticsEvent.count(),
      },
      notifications: {
        unread: await prisma.notification.count({
          where: {
            userId: req.user.id,
            is_read: false,
          },
        }),
      },
      ownership: {
        myLeads: await prisma.lead.count({
          where: {
            addedById: req.user.id,
          },
        }),
      },
    };

    res.json({
      success: true,
      data: {
        metrics,
        insights: buildInsights(metrics),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAIAnalytics,
  getGlobalAnalytics,
  getMyAnalytics,
};
