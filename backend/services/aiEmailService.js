// Outreach + summarization with multi-provider fallback + deterministic template fallback.
// Chain: groq -> gemini -> openai -> deepseek -> huggingface (see services/aiProvider.js)
const provider = require("./aiProvider");

const sanitize = (text) => (text || "").toString().replace(/\s+\n/g, "\n").trim();

function buildTemplateOutreach({ name, company, purpose }) {
  const safeName = (name || "there").toString().slice(0, 80);
  const safeCompany = (company || "your team").toString().slice(0, 80);
  const safePurpose = (purpose || "explore ways to collaborate").toString().slice(0, 200);
  return [
    `Hi ${safeName},`,
    "",
    `I came across ${safeCompany} and was impressed by what you are building. I'd love to connect regarding ${safePurpose}.`,
    "",
    "A quick intro: I work on Fintrix, an all-in-one deal-flow and lead intelligence platform for investors and operators. We help teams discover, verify, and engage high-intent prospects in a fraction of the time.",
    "",
    "Would you be open to a 15-minute call next week? Happy to share a tailored walkthrough.",
    "",
    "Best regards,",
    "The Fintrix Team",
  ].join("\n");
}

function buildTemplateSummary(text) {
  const cleaned = (text || "").toString().replace(/\s+/g, " ").trim();
  if (!cleaned) return "No content provided to summarize.";
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const first = sentences[0] || cleaned.slice(0, 160);
  const second = sentences[1] || "";
  const tail = cleaned.length > 600 ? " " + cleaned.slice(-180).trim() : "";
  const summary = [first, second].filter(Boolean).join(" ").trim();
  return (summary + tail).slice(0, 600);
}

exports.generateOutreachMessage = async ({ name, company, purpose }) => {
  const prompt = `Write a short professional outreach message (max 120 words).\nName: ${name}\nCompany: ${company}\nPurpose: ${purpose}`;
  try {
    const result = await provider.generate(prompt, { cache: true, cacheTtl: 60 });
    const text = sanitize(result.text);
    if (text) return { output: text, provider: result.provider, model: result.model, cached: !!result.cached };
  } catch (err) {
    // Provider chain failed (no keys, all expired, network, etc.) — degrade gracefully.
  }
  return { output: buildTemplateOutreach({ name, company, purpose }), provider: "template", model: "deterministic", cached: false };
};

exports.summarizeContent = async (text) => {
  const prompt = `Summarize the following text in 2-3 concise sentences:\n${text}`;
  try {
    const result = await provider.generate(prompt, { cache: true, cacheTtl: 60 });
    const out = sanitize(result.text);
    if (out) return { output: out, provider: result.provider, model: result.model, cached: !!result.cached };
  } catch (err) {
    // Fall through to deterministic summary.
  }
  return { output: buildTemplateSummary(text), provider: "template", model: "deterministic", cached: false };
};
