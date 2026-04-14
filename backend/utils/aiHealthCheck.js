// Pings all configured providers' models endpoint. Fallback chain: groq -> gemini -> openai -> deepseek -> huggingface

const ENV_KEYS = {
  groq: "GROQ_API_KEY",
  gemini: "GEMINI_API_KEY",
  openai: "OPENAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  huggingface: "HUGGINGFACE_API_KEY",
};

const ENDPOINTS = {
  groq: "https://api.groq.com/openai/v1/models",
  openai: "https://api.openai.com/v1/models",
  deepseek: "https://api.deepseek.com/models",
  huggingface: "https://router.huggingface.co/v1/models",
  // Gemini uses a different path; handled below
};

const GEMINI_MODELS = "https://generativelanguage.googleapis.com/v1beta/models";

async function ping(url, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { method: "GET", headers, signal: controller.signal });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 0, error: err.message };
  }
}

async function checkProvider(name) {
  const key = process.env[ENV_KEYS[name]];
  if (!key) return { provider: name, configured: false, healthy: false };

  const headers = { Authorization: `Bearer ${key}` };
  let url = ENDPOINTS[name];
  if (name === "gemini") url = `${GEMINI_MODELS}?key=${key}`;
  const result = await ping(url, name === "gemini" ? {} : headers);
  return {
    provider: name,
    configured: true,
    healthy: result.ok,
    status: result.status,
    error: result.error,
  };
}

async function checkAIService() {
  const providers = Object.keys(ENV_KEYS);
  const results = await Promise.all(providers.map(checkProvider));
  const healthy = results.filter((r) => r.healthy);
  const missing = results.filter((r) => !r.configured);

  const summary = {
    total: providers.length,
    healthy: healthy.length,
    unhealthy: results.filter((r) => r.configured && !r.healthy).length,
    missing: missing.length,
    results,
    checkedAt: new Date().toISOString(),
  };

  if (healthy.length > 0) {
    console.log(`🟢 AI providers healthy: ${healthy.map((r) => r.provider).join(", ")}`);
  } else {
    console.warn("🔴 No AI providers healthy. Will use heuristic fallback.");
  }

  return summary;
}

module.exports = checkAIService;
