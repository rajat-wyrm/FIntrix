// Thin Upstash Redis REST wrapper using fetch (no SDK). Caching must never break the app.

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const ENABLED = !!(URL && TOKEN);

function warn(msg, err) {
  if (process.env.NODE_ENV === "production") return;
  console.warn(`[cacheService] ${msg}`, err?.message || "");
}

async function exec(command) {
  if (!ENABLED) return null;
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`:${TOKEN}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    if (!res.ok) {
      warn(`upstash ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data?.result ?? null;
  } catch (err) {
    warn("upstash request failed", err);
    return null;
  }
}

async function get(key) {
  if (!ENABLED) return null;
  const r = await exec(["GET", key]);
  if (r == null) return null;
  try {
    return JSON.parse(r);
  } catch {
    return r;
  }
}

async function set(key, value, ttlSeconds) {
  if (!ENABLED) return null;
  const serialized = JSON.stringify(value);
  if (ttlSeconds && Number(ttlSeconds) > 0) {
    return exec(["SET", key, serialized, "EX", String(Math.floor(ttlSeconds))]);
  }
  return exec(["SET", key, serialized]);
}

async function del(key) {
  if (!ENABLED) return null;
  return exec(["DEL", key]);
}

module.exports = { get, set, del, enabled: ENABLED };
