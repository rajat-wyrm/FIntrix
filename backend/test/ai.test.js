const test = require("node:test");
const assert = require("node:assert/strict");

// Stub env so cacheService can be required without an actual Upstash URL.
process.env.UPSTASH_REDIS_REST_URL = "";
process.env.UPSTASH_REDIS_REST_TOKEN = "";

const cache = require("../services/cacheService");
const aiProvider = require("../services/aiProvider");

test("cacheService is disabled when no Upstash env is set", () => {
  assert.equal(cache.enabled, false);
  // get/set/del should be safe no-ops that resolve to null/false
  return cache
    .get("any")
    .then((v) => assert.equal(v, null))
    .then(() => cache.set("any", "x"))
    .then((ok) => assert.equal(ok, false))
    .then(() => cache.del("any"))
    .then((ok) => assert.equal(ok, false));
});

test("aiProvider reports no providers when no API keys are configured", () => {
  // Wipe relevant keys for this test only.
  for (const k of [
    "GROQ_API_KEY",
    "GEMINI_API_KEY",
    "OPENAI_API_KEY",
    "DEEPSEEK_API_KEY",
    "HUGGINGFACE_API_KEY",
  ]) {
    delete process.env[k];
  }
  const configured = aiProvider.getConfiguredProviders();
  assert.deepEqual(configured, []);
});

test("aiProvider throws AllProvidersFailedError when no providers are configured", async () => {
  for (const k of [
    "GROQ_API_KEY",
    "GEMINI_API_KEY",
    "OPENAI_API_KEY",
    "DEEPSEEK_API_KEY",
    "HUGGINGFACE_API_KEY",
  ]) {
    delete process.env[k];
  }
  await assert.rejects(
    aiProvider.generate("hello world"),
    (err) => err.name === "AllProvidersFailedError",
  );
});
