const express = require("express");

const { socialSearch } = require("../controllers/socialSearchController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.post("/", socialSearch);

module.exports = router;
