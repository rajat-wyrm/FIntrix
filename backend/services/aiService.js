// Uses unified AI provider with fallback chain: groq -> gemini -> openai -> deepseek -> huggingface
const provider = require("./aiProvider");

const sendMetricsToAI = async (metrics) => {
  const prompt = `You are a SaaS product analytics expert.

Analyze the following platform data and provide:
1. Key problems
2. Funnel bottlenecks
3. Product improvement suggestions
4. Revenue optimization ideas

DATA:
${JSON.stringify(metrics, null, 2)}`;

  try {
    const result = await provider.generate(prompt, { cache: false });
    return { output: result.text, provider: result.provider, model: result.model };
  } catch (err) {
    console.error("AI SERVICE ERROR:", err.message);
    throw new Error("External AI API failed");
  }
};

module.exports = { sendMetricsToAI };
