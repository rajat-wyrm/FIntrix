const express = require("express");
const { getAIRecommendations } = require("../controllers/ai.controller");
const {
  generateOutreachMessage,
  summarizeContent,
} = require("../services/aiEmailService");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/ai - Test endpoint
router.get("/", (req, res) => {
  res.json({ 
    message: "AI API is active", 
    endpoints: [
      "POST /api/ai/recommend",
      "POST /api/ai/outreach",
      "POST /api/ai/summarize"
    ]
  });
});

router.post("/recommend", getAIRecommendations);

/*
 POST /api/ai/outreach
 */
router.post("/outreach", protect, async (req, res) => {
  try {
    const { name, company, purpose } = req.body;

    if (!name || !company || !purpose) {
      return res.status(400).json({
        success: false,
        message: "name, company and purpose are required",
      });
    }

    const result = await generateOutreachMessage({ name, company, purpose });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/*
 POST /api/ai/summarize
 */
router.post("/summarize", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "text is required for summarization",
      });
    }

    const result = await summarizeContent(text);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
