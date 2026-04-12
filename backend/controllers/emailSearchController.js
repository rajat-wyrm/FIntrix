const dns = require("dns").promises;

const { prisma } = require("../config/postgres");
const { createNotification } = require("../services/notificationService");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailSearch = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
      return;
    }

    const domain = email.split("@")[1];
    let mxRecords = [];
    let deliverability = "dns_unavailable";

    try {
      mxRecords = await dns.resolveMx(domain);
      deliverability = mxRecords.length > 0 ? "mx_found" : "no_mx";
    } catch (error) {
      deliverability = "dns_unavailable";
    }

    const record = await prisma.emailSearch.create({
      data: {
        email,
        domain,
        valid: mxRecords.length > 0,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        userId: req.user.id,
        type: "EMAIL_SEARCH",
      },
    });

    await createNotification({
      userId: req.user.id,
      type: "EMAIL_SEARCH",
      message: `Email lookup completed for ${email}.`,
      link: "/app/search/email",
      metadata: {
        deliverability,
        recordId: record.id,
      },
    });

    res.json({
      success: true,
      data: {
        email,
        domain,
        valid: mxRecords.length > 0,
        deliverability,
        mxRecordCount: mxRecords.length,
        searchedAt: record.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const listEmailSearches = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, email, domain } = req.query;
    const where = {};
    if (email) where.email = { contains: email.toLowerCase(), mode: "insensitive" };
    if (domain) where.domain = { contains: domain.toLowerCase() };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      prisma.emailSearch.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: Number(limit) }),
      prisma.emailSearch.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  emailSearch,
  listEmailSearches,
};
