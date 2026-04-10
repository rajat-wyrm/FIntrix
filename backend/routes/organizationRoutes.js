const express = require("express");

const {
  createOrganization,
  deleteOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
} = require("../controllers/organizationController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createOrganizationSchema,
  organizationQuerySchema,
  updateOrganizationSchema,
} = require("../validations/organizationValidation");

const router = express.Router();

// All organization routes require auth because mutations also create user-scoped activity notifications.
router.use(protect);

router.get("/", validate(organizationQuerySchema, "query"), getAllOrganizations);
router.get("/:id", getOrganizationById);
router.post("/", validate(createOrganizationSchema), createOrganization);
router.patch("/:id", validate(updateOrganizationSchema), updateOrganization);
router.delete("/:id", deleteOrganization);

module.exports = router;
