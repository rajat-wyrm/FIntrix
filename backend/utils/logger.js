"use strict";

const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const resolveLevel = (value) => {
  if (!value) return LEVELS.info;
  const key = String(value).toLowerCase();
  return LEVELS[key] || LEVELS.info;
};

const activeLevel = () => resolveLevel(process.env.LOG_LEVEL);

const format = (level, args) => {
  const parts = args.map((arg) => {
    if (arg instanceof Error) {
      return arg.stack || `${arg.name}: ${arg.message}`;
    }
    if (typeof arg === "string") {
      return arg;
    }
    try {
      return JSON.stringify(arg);
    } catch (_) {
      return String(arg);
    }
  });
  return {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message: parts.join(" "),
  };
};

const emit = (level, args) => {
  if (LEVELS[level] < activeLevel()) {
    return;
  }
  const line = JSON.stringify(format(level, args));
  if (level === "error" || level === "warn") {
    process.stderr.write(line + "\n");
    return;
  }
  process.stdout.write(line + "\n");
};

const logger = {
  debug: (...args) => emit("debug", args),
  info: (...args) => emit("info", args),
  warn: (...args) => emit("warn", args),
  error: (...args) => emit("error", args),
  child: (bindings = {}) => {
    const prefix = Object.keys(bindings).length
      ? `[${Object.entries(bindings)
          .map(([k, v]) => `${k}=${v}`)
          .join(" ")}] `
      : "";
    return {
      debug: (...args) => emit("debug", [prefix, ...args]),
      info: (...args) => emit("info", [prefix, ...args]),
      warn: (...args) => emit("warn", [prefix, ...args]),
      error: (...args) => emit("error", [prefix, ...args]),
    };
  },
};

module.exports = logger;
