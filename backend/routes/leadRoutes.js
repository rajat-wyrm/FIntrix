const express = require("express");

const {
  createLead,
  deleteLead,
  getLeadById,
  getLeads,
  updateLead,
} = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createLeadSchema,
  leadQuerySchema,
  updateLeadSchema,
} = require("../validations/leadValidation");

const router = express.Router();

router.use(protect);

router.get("/", validate(leadQuerySchema, "query"), getLeads);
router.get("/:id", getLeadById);
router.post("/", validate(createLeadSchema), createLead);
router.patch("/:id", validate(updateLeadSchema), updateLead);
router.delete("/:id", deleteLead);

module.exports = router;
