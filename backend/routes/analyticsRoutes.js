const express = require("express");

const {
  getAIAnalytics,
  getGlobalAnalytics,
  getMyAnalytics,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/global", getGlobalAnalytics);
router.get("/me", getMyAnalytics);
router.get("/insights", getAIAnalytics);
router.get("/ai", getAIAnalytics);

module.exports = router;
