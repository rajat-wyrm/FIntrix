const test = require("node:test");
const assert = require("node:assert/strict");

const logger = require("../utils/logger");

test("logger has the expected levels", () => {
  for (const level of ["debug", "info", "warn", "error"]) {
    assert.equal(typeof logger[level], "function", `logger.${level} should be a function`);
  }
});

test("logger.child produces a new logger with bindings", () => {
  const child = logger.child({ component: "test" });
  assert.equal(typeof child.info, "function");
  assert.equal(typeof child.warn, "function");
  assert.equal(typeof child.error, "function");
  assert.equal(typeof child.debug, "function");
});
