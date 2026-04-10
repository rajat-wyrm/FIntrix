const { prisma } = require("../config/postgres");
const { createNotification } = require("../services/notificationService");

const buildOrganizationWhere = (search) => {
  // One shared search box keeps the list UI simple by matching the fields users are most likely to remember.
  if (!search) {
    return {};
  }

  return {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { website: { contains: search, mode: "insensitive" } },
      { region: { contains: search, mode: "insensitive" } },
      { contactName: { contains: search, mode: "insensitive" } },
    ],
  };
};

const getAllOrganizations = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const where = buildOrganizationWhere(search);
    const skip = (page - 1) * limit;

    // Fetch page data and total together so pagination reflects the exact same filtered snapshot.
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.organization.count({ where }),
    ]);

    res.json({
      success: true,
      data: organizations,
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

const getOrganizationById = async (req, res, next) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!organization) {
      res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
      return;
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

const createOrganization = async (req, res, next) => {
  try {
    const organization = await prisma.organization.create({
      data: {
        name: req.body.name.trim(),
        website: req.body.website || "",
        region: req.body.region || "Global",
        type: req.body.type || "Startup",
        contactName: req.body.contactName || "",
      },
    });

    // Emit the notification here so every creation path feeds the activity center without route-level duplication.
    await createNotification({
      userId: req.user.id,
      type: "ORGANIZATION_CREATED",
      message: `Organization ${organization.name} created.`,
      link: "/app/organizations",
      metadata: {
        organizationId: organization.id,
      },
    });

    res.status(201).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const organization = await prisma.organization.update({
      where: { id: Number(req.params.id) },
      // Validation already constrains the payload, so passing req.body through keeps PATCH support flexible.
      data: req.body,
    });

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrganization = async (req, res, next) => {
  try {
    await prisma.organization.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({
      success: true,
      message: "Organization deleted.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrganization,
  deleteOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
};
