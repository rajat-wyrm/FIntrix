const { prisma } = require('../config/postgres');

// Create Deal
const createDeal = async (req, res) => {
  try {
    const { amount, stage = 'NEW', status = 'ACTIVE', startupIds = [], investorIds = [] } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'amount is required' });
    }

    // Validate startup organizations
    if (startupIds.length > 0) {
      const startups = await prisma.organization.findMany({
        where: {
          id: { in: startupIds.map(id => parseInt(id)) }
        }
      });

      if (startups.length !== startupIds.length) {
        return res.status(400).json({ error: 'Invalid startupIds' });
      }
    }

    // Validate investor organizations
    if (investorIds.length > 0) {
      const investors = await prisma.organization.findMany({
        where: {
          id: { in: investorIds.map(id => parseInt(id)) }
        }
      });

      if (investors.length !== investorIds.length) {
        return res.status(400).json({ error: 'Invalid investorIds' });
      }
    }

    const deal = await prisma.deal.create({
      data: {
        amount,
        stage,
        status,
        startups: {
          create: startupIds.map(id => ({
            org: { connect: { id: parseInt(id) } }
          }))
        },
        investors: {
          create: investorIds.map(id => ({
            org: { connect: { id: parseInt(id) } }
          }))
        }
      },
      include: {
        startups: { include: { org: true } },
        investors: { include: { org: true } }
      }
    });

    res.status(201).json({ success: true, deal });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get Deals (filter + pagination)
const getDeals = async (req, res) => {
  try {
    const { page = 1, limit = 10, stage, status, startupId, investorId } = req.query;

    const filters = {};

    if (stage) filters.stage = stage;
    if (status) filters.status = status;

    if (startupId) {
      filters.startups = {
        some: { orgId: parseInt(startupId) }
      };
    }

    if (investorId) {
      filters.investors = {
        some: { orgId: parseInt(investorId) }
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const deals = await prisma.deal.findMany({
      where: filters,
      skip: skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        startups: { include: { org: true } },
        investors: { include: { org: true } }
      }
    });

    const total = await prisma.deal.count({
      where: filters
    });

    res.json({
      success: true,
      deals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get Deal by ID
const getDealById = async (req, res) => {
  try {

    const deal = await prisma.deal.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        startups: { include: { org: true } },
        investors: { include: { org: true } }
      }
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ success: true, deal });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update Deal
const updateDeal = async (req, res) => {
  try {

    const id = parseInt(req.params.id);
    const { startupIds, investorIds, ...rest } = req.body;

    if (startupIds) {
      const startups = await prisma.organization.findMany({
        where: {
          id: { in: startupIds.map(id => parseInt(id)) }
        }
      });

      if (startups.length !== startupIds.length) {
        return res.status(400).json({ error: 'Invalid startupIds' });
      }
    }

    if (investorIds) {
      const investors = await prisma.organization.findMany({
        where: {
          id: { in: investorIds.map(id => parseInt(id)) }
        }
      });

      if (investors.length !== investorIds.length) {
        return res.status(400).json({ error: 'Invalid investorIds' });
      }
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: rest
    });

    const updatedDeal = await prisma.deal.findUnique({
      where: { id },
      include: {
        startups: { include: { org: true } },
        investors: { include: { org: true } }
      }
    });

    res.json({ success: true, deal: updatedDeal });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Delete Deal
const deleteDeal = async (req, res) => {
  try {

    const deal = await prisma.deal.delete({
      where: { id: parseInt(req.params.id) }
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ success: true, message: 'Deal deleted' });

  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};


module.exports = {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  deleteDeal,
};