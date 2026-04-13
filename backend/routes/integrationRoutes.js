const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  fetchHubSpotLeads,
  pushHubSpotLead,
} = require("../integrations/hubspotClient");

const {
  fetchSalesforceLeads,
  pushSalesforceLead,
} = require("../integrations/salesforceClient");


router.use(protect);
const validateLead = (body) => {
  const { firstName, email } = body;

  if (!firstName || !email) {
    return "First name and email are required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  return null;
};

// HubSpot
router.get("/hubspot/leads", async (req, res) => {
  try {
    const leads = await fetchHubSpotLeads();
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch HubSpot leads" });
  }
});


router.post("/hubspot/leads", async (req, res) => {
  try {
    const errorMsg = validateLead(req.body);
    if (errorMsg) return res.status(400).json({ message: errorMsg });

    const lead = await pushHubSpotLead(req.body);

    res.json({ message: "Lead pushed to HubSpot", lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to push lead to HubSpot" });
  }
});

// Salesforce
router.get("/salesforce/leads", async (req, res) => {
  try {
    const leads = await fetchSalesforceLeads();
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch Salesforce leads" });
  }
});


router.post("/salesforce/leads", async (req, res) => {
  try {
    const errorMsg = validateLead(req.body);
    if (errorMsg) return res.status(400).json({ message: errorMsg });

    const lead = await pushSalesforceLead(req.body);

    res.json({ message: "Lead pushed to Salesforce", lead });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to push lead to Salesforce" });
  }
});

router.post("/sync/hubspot-to-salesforce", async (req, res) => {
  try {
    const hubspotLeads = await fetchHubSpotLeads();

    let synced = 0;

    for (const lead of hubspotLeads) {
      await pushSalesforceLead(lead);
      synced++;
    }

    res.json({
      message: "Sync completed successfully",
      totalSynced: synced,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to sync leads" });
  }
});

module.exports = router;
