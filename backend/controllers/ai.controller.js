// Uses unified AI provider with fallback chain: groq -> gemini -> openai -> deepseek -> huggingface
const provider = require("../services/aiProvider");

function heuristicRecommendations(body = {}) {
  const { role, skills = [], interests = [] } = body;
  const top = (skills || []).slice(0, 3);
  const safeRole = role || "Software Engineer";
  return {
    source: "heuristic",
    role: safeRole,
    topSkills: top,
    suggestedCompanies: ["Razorpay", "Zerodha", "Postman", "Freshworks", "CRED"],
    learningPath: [
      `Master ${top[0] || "core fundamentals"} with 1 project per week`,
      `Build 2 portfolio projects around ${top[1] || "your domain"}`,
      `Contribute to 1 open-source repo in ${interests[0] || "your area of interest"}`,
      `Prepare 5 STAR stories targeting ${safeRole} interviews`,
    ],
  };
}

exports.getAIRecommendations = async (req, res) => {
  try {
    const configured = provider.getConfiguredProviders();
    if (configured.length === 0) {
      return res.status(200).json({ success: true, data: heuristicRecommendations(req.body) });
    }

    const prompt = `You are a career coach. Based on the candidate profile below, produce JSON with keys: topSkills (array of 3), suggestedCompanies (array of 5), learningPath (array of 4 short steps), and a one-line summary. Return only valid JSON.\n\nProfile: ${JSON.stringify(req.body || {})}`;

    try {
      const result = await provider.generate(prompt, { cache: true, cacheTtl: 60 });
      const text = (result.text || "").trim();
      let parsed;
      try {
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}");
        parsed = JSON.parse(jsonEnd > jsonStart ? text.slice(jsonStart, jsonEnd + 1) : text);
      } catch {
        parsed = { summary: text };
      }
      return res.status(200).json({
        success: true,
        data: { ...parsed, provider: result.provider, model: result.model, latencyMs: result.latencyMs },
      });
    } catch (aiErr) {
      console.warn("AI providers failed, falling back to heuristic:", aiErr.message);
      return res.status(200).json({ success: true, data: heuristicRecommendations(req.body) });
    }
  } catch (err) {
    console.error("AI Controller Error:", err.message);
    return res.status(500).json({ success: false, message: "AI service unavailable" });
  }
};
