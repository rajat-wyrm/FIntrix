// Fallback chain order: groq -> gemini -> openai -> deepseek -> huggingface
// AI_PROVIDER env var, if set to a known provider, hoists it to the front.

const cache = require("./cacheService");

const CHAIN = ["groq", "gemini", "openai", "deepseek", "huggingface"];

const ENV_KEYS = {
  groq: "GROQ_API_KEY",
  gemini: "GEMINI_API_KEY",
  openai: "OPENAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  huggingface: "HUGGINGFACE_API_KEY",
};

const ENDPOINTS = {
  groq: "https://api.groq.com/openai/v1/chat/completions",
  gemini: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
  openai: "https://api.openai.com/v1/chat/completions",
  deepseek: "https://api.deepseek.com/chat/completions",
  huggingface: "https://router.huggingface.co/v1/chat/completions",
};

const MODELS = {
  groq: "llama-3.3-70b-versatile",
  gemini: "gemini-1.5-flash",
  openai: "gpt-4o-mini",
  deepseek: "deepseek-chat",
  huggingface: "meta-llama/Llama-3.1-8B-Instruct",
};

const TIMEOUT = Number(process.env.AI_TIMEOUT) || 15000;

function resolveOrder() {
  const preferred = (process.env.AI_PROVIDER || "").toLowerCase().trim();
  if (preferred && CHAIN.includes(preferred)) {
    return [preferred, ...CHAIN.filter((p) => p !== preferred)];
  }
  return [...CHAIN];
}

function buildChain() {
  return resolveOrder().filter((p) => !!process.env[ENV_KEYS[p]]);
}

class AllProvidersFailedError extends Error {
  constructor(lastErrors) {
    super("All AI providers failed");
    this.name = "AllProvidersFailedError";
    this.lastErrors = lastErrors;
  }
}

function messagesToPrompt(messages) {
  if (typeof messages === "string") return messages;
  if (Array.isArray(messages)) {
    return messages
      .map((m) => {
        const role = (m.role || "user").toUpperCase();
        const content = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
        return `${role}: ${content}`;
      })
      .join("\n");
  }
  return String(messages);
}

async function callProvider(provider, { messages, prompt, signal }) {
  const start = Date.now();
  const apiKey = process.env[ENV_KEYS[provider]];
  const url = ENDPOINTS[provider];
  const model = MODELS[provider];

  const headers = { "Content-Type": "application/json" };

  if (provider === "gemini") {
    const text = messagesToPrompt(messages || prompt);
    const body = { contents: [{ role: "user", parts: [{ text }] }] };
    const sep = url.includes("?") ? "&" : "?";
    const finalUrl = `${url}${sep}key=${apiKey}`;
    const res = await fetch(finalUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`gemini ${res.status}: ${errText.slice(0, 200)}`);
    }
    const data = await res.json();
    const text2 =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";
    return { text: text2, provider, model, latencyMs: Date.now() - start };
  }

  // OpenAI-compatible: groq, openai, deepseek, huggingface
  const chatMessages = Array.isArray(messages)
    ? messages
    : [{ role: "user", content: messagesToPrompt(messages || prompt) }];

  const body = { model, messages: chatMessages, temperature: 0.7 };
  headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${provider} ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text2 = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
  return { text: text2, provider, model, latencyMs: Date.now() - start };
}

function cacheKey(input) {
  const norm = typeof input === "string" ? input : JSON.stringify(input);
  return "ai:" + Buffer.from(norm).toString("base64").slice(0, 200);
}

async function runWithFallback(input, options) {
  const chain = buildChain();
  if (chain.length === 0) {
    throw new AllProvidersFailedError([
      { provider: "none", error: "No AI providers configured (set at least one API key)" },
    ]);
  }

  const cacheable = options?.cache !== false;
  const ttl = Number(options?.cacheTtl) || 60;

  if (cacheable) {
    try {
      const cached = await cache.get(cacheKey(input));
      if (cached) {
        return { ...cached, cached: true };
      }
    } catch (_) {
      // cache failures are non-fatal
    }
  }

  const errors = [];
  for (const provider of chain) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const result = await callProvider(provider, {
        messages: input.messages,
        prompt: input.prompt,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (cacheable) {
        cache.set(cacheKey(input), { text: result.text, provider: result.provider, model: result.model, latencyMs: result.latencyMs }, ttl).catch(() => {});
      }
      return result;
    } catch (err) {
      clearTimeout(timer);
      errors.push({ provider, error: err.message });
    }
  }

  throw new AllProvidersFailedError(errors);
}

async function chat(messages, options = {}) {
  return runWithFallback({ messages }, options);
}

async function generate(prompt, options = {}) {
  return runWithFallback({ prompt }, options);
}

async function embed(text, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AllProvidersFailedError([{ provider: "openai", error: "No embedding provider configured" }]);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  const start = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`openai embeddings ${res.status}: ${t.slice(0, 200)}`);
    }
    const data = await res.json();
    return {
      text: data?.data?.[0]?.embedding || [],
      provider: "openai",
      model: "text-embedding-3-small",
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    clearTimeout(timer);
    throw new AllProvidersFailedError([{ provider: "openai", error: err.message }]);
  }
}

function getConfiguredProviders() {
  return buildChain();
}

module.exports = {
  chat,
  generate,
  embed,
  getConfiguredProviders,
  AllProvidersFailedError,
  CHAIN,
};
