const { prisma } = require("../config/postgres");
const { createNotification } = require("../services/notificationService");
const { updateLeadScore } = require("../services/leadScoringService");

const getLeadInclude = () => ({
  addedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
});

const buildLeadWhere = ({ search, status, source }) => {
  return {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { domain: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
  };
};

const mapCreateInput = (body) => ({
  name: body.name.trim(),
  email: body.email.toLowerCase(),
  phone: body.phone || null,
  domain: body.domain?.trim().toLowerCase() || null,
  status: body.status || "new",
  source: body.source || "other",
  engagement: body.engagement,
  jobTitle: body.jobTitle || null,
  managementLevel: body.managementLevel || null,
  department: body.department || null,
  location: body.location || null,
  industry: body.industry || null,
  skills: body.skills || null,
  companyLocation: body.companyLocation || null,
  companySize: body.companySize || null,
  revenue: body.revenue || null,
  companyName: body.companyName || null,
});

const mapUpdateInput = (body) => ({
  ...(body.name !== undefined ? { name: body.name.trim() } : {}),
  ...(body.email !== undefined ? { email: body.email.toLowerCase() } : {}),
  ...(body.phone !== undefined ? { phone: body.phone || null } : {}),
  ...(body.domain !== undefined
    ? { domain: body.domain?.trim().toLowerCase() || null }
    : {}),
  ...(body.status !== undefined ? { status: body.status } : {}),
  ...(body.source !== undefined ? { source: body.source } : {}),
  ...(body.engagement !== undefined ? { engagement: body.engagement } : {}),
   ...(body.jobTitle !== undefined ? { jobTitle: body.jobTitle } : {}),
  ...(body.managementLevel !== undefined ? { managementLevel: body.managementLevel } : {}),
  ...(body.department !== undefined ? { department: body.department } : {}),
  ...(body.location !== undefined ? { location: body.location } : {}),
  ...(body.industry !== undefined ? { industry: body.industry } : {}),
  ...(body.skills !== undefined ? { skills: body.skills } : {}),
  ...(body.companyLocation !== undefined ? { companyLocation: body.companyLocation } : {}),
  ...(body.companySize !== undefined ? { companySize: body.companySize } : {}),
  ...(body.revenue !== undefined ? { revenue: body.revenue } : {}),
  ...(body.companyName !== undefined ? { companyName: body.companyName } : {}),
});

const createLead = async (req, res, next) => {
  try {
    const lead = await prisma.lead.create({
      data: {
        ...mapCreateInput(req.body),
        addedById: req.user.id,
      },
      include: getLeadInclude(),
    });

    await updateLeadScore(lead.id);
    const updatedLead = await prisma.lead.findUnique({
      where: { id: lead.id },
      include: getLeadInclude(),
    });

    await createNotification({
      userId: req.user.id,
      type: "LEAD_CREATED",
      message: `Lead ${lead.name} added to your pipeline.`,
      link: "/app/leads",
      metadata: {
        leadId: lead.id,
      },
    });

    res.status(201).json({
      success: true,
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

const getLeads = async (req, res, next) => {
  try {
    const { page, limit, search, status, source, sortBy, order } = req.query;
    const skip = (page - 1) * limit;
    const where = buildLeadWhere({ search, status, source });

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: getLeadInclude(),
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({
      success: true,
      data: leads,
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

const getLeadById = async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: Number(req.params.id) },
      include: getLeadInclude(),
    });

    if (!lead) {
      res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
      return;
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await prisma.lead.update({
      where: { id: Number(req.params.id) },
      data: mapUpdateInput(req.body),
      include: getLeadInclude(),
    });

    await updateLeadScore(lead.id);
    const updatedLead = await prisma.lead.findUnique({
      where: { id: lead.id },
      include: getLeadInclude(),
    });

    res.json({
      success: true,
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    await prisma.lead.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({
      success: true,
      message: "Lead deleted.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  deleteLead,
  getLeadById,
  getLeads,
  updateLead,
};
