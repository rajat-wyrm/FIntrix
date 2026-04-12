const express = require("express");

const { domainSearch, listDomainSearches } = require("../controllers/domainSearchController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", listDomainSearches);
router.post("/", domainSearch);

module.exports = router;
