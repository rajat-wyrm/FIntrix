const dns = require("dns").promises;
const whois = require("whois-json");

const { prisma } = require("../config/postgres");
const { AppError } = require("../middleware/errorHandler");
const { createNotification } = require("../services/notificationService");

const normalizeDomain = (value) => {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new AppError("A domain is required.", 400);
  }

  const sanitized = trimmed.replace(/^https?:\/\//i, "").split("/")[0];

  if (!sanitized.includes(".")) {
    throw new AppError("Please enter a valid domain name.", 400);
  }

  return sanitized.toLowerCase();
};

const domainSearch = async (req, res, next) => {
  try {
    const domain = normalizeDomain(req.body.domain);
    let expirationDate = null;
    let status = "resolved";
    const dnsRecords = {
      A: [],
      MX: [],
      NS: [],
    };

    try {
      const whoisData = await whois(domain);
      expirationDate =
        whoisData?.expires ||
        whoisData?.["Expiration Date"] ||
        whoisData?.["Registry Expiry Date"] ||
        null;
    } catch (error) {
      status = "partial";
    }

    const resolvers = await Promise.allSettled([
      dns.resolve(domain, "A"),
      dns.resolveMx(domain),
      dns.resolveNs(domain),
    ]);

    if (resolvers[0].status === "fulfilled") {
      dnsRecords.A = resolvers[0].value;
    }

    if (resolvers[1].status === "fulfilled") {
      dnsRecords.MX = resolvers[1].value;
    } else if (status === "resolved") {
      status = "partial";
    }

    if (resolvers[2].status === "fulfilled") {
      dnsRecords.NS = resolvers[2].value;
    } else if (status === "resolved") {
      status = "partial";
    }

    const hasAnyDnsData =
      dnsRecords.A.length > 0 || dnsRecords.MX.length > 0 || dnsRecords.NS.length > 0;

    if (!hasAnyDnsData && !expirationDate) {
      status = "lookup_failed";
    }

    const record = await prisma.domainSearch.create({
      data: {
        domain,
        status,
        expirationDate,
        dnsRecords,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        userId: req.user.id,
        type: "DOMAIN_SEARCH",
      },
    });

    await createNotification({
      userId: req.user.id,
      type: "DOMAIN_SEARCH",
      message: `Domain lookup completed for ${domain}.`,
      link: "/app/search/domain",
      metadata: {
        status,
        recordId: record.id,
      },
    });

    res.json({
      success: true,
      data: {
        domain,
        status,
        expirationDate,
        dnsRecords,
        searchedAt: record.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const listDomainSearches = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, domain } = req.query;
    const where = {};
    if (domain) where.domain = { contains: domain.toLowerCase() };

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      prisma.domainSearch.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: Number(limit) }),
      prisma.domainSearch.count({ where }),
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
  domainSearch,
  listDomainSearches,
};
