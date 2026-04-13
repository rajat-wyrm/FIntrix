const express = require("express");
const router = express.Router();
const {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  deleteDeal
} = require("../controllers/dealController");

const validate = require("../middleware/validate");
const { createDealSchema, updateDealSchema } = require("../validations/dealValidation");

router.get("/", getDeals);
router.get("/:id", getDealById);
router.post("/", validate(createDealSchema), createDeal);
router.put("/:id", validate(updateDealSchema), updateDeal);
router.delete("/:id", deleteDeal);

module.exports = router;
