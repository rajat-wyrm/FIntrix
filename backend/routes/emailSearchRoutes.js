const express = require("express");

const { emailSearch, listEmailSearches } = require("../controllers/emailSearchController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", listEmailSearches);
router.post("/", emailSearch);

module.exports = router;
