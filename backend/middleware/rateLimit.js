"use strict";

const cacheService = require("../services/cacheService");

// In-memory fallback used by createRateLimiter() so it keeps working when Redis is absent.
const buckets = new Map();

const createRateLimiter = ({ windowMs, max, message }) => {
  return async (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "anonymous";
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      next();
      return;
    }

    if (existing.count >= max) {
      res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      });
      return;
    }

    existing.count += 1;
    next();
  };
};

const createRedisRateLimiter = ({ windowMs, max, keyPrefix = "rl", message }) => {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  return async (req, res, next) => {
    const key = `${keyPrefix}:${req.ip || req.headers["x-forwarded-for"] || "anonymous"}`;

    let count;
    try {
      count = await cacheService.incr(key, windowSeconds);
    } catch (err) {
      // The cache service already falls back to in-memory, so this is purely defensive.
      count = 1;
    }

    const remaining = Math.max(0, max - count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));

    if (count > max) {
      res.setHeader("Retry-After", String(windowSeconds));
      res.status(429).json({
        success: false,
        message: message || "Too many requests. Please slow down.",
        retryAfterSeconds: windowSeconds,
      });
      return;
    }

    next();
  };
};

const createSlowDown = ({ windowMs = 60 * 1000, threshold = 100, minDelay = 50, maxDelay = 200 } = {}) => {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const slidingWindows = new Map();

  return async (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "anonymous";
    const now = Date.now();
    const windowStart = now - windowMs;

    let bucket = slidingWindows.get(key) || [];
    bucket = bucket.filter((timestamp) => timestamp > windowStart);
    bucket.push(now);
    slidingWindows.set(key, bucket);

    if (bucket.length <= threshold) {
      return next();
    }

    const overshoot = bucket.length - threshold;
    const ratio = Math.min(1, overshoot / threshold);
    const delay = Math.round(minDelay + ratio * (maxDelay - minDelay));

    setTimeout(next, delay);
  };
};

module.exports = {
  createRateLimiter,
  createRedisRateLimiter,
  createSlowDown,
};
