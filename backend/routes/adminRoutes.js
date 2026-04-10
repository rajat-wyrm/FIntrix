const express = require("express");

const {
  addTagsToUser,
  adminLogin,
  getDashboardSummary,
} = require("../controllers/adminController");
const { isAdmin, protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { loginSchema } = require("../validations/authValidation");

const router = express.Router();

router.post("/login", validate(loginSchema), adminLogin);
router.get("/dashboard", protect, isAdmin, getDashboardSummary);
router.post("/tags", protect, isAdmin, addTagsToUser);

module.exports = router;
