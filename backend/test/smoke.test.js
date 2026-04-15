const test = require("node:test");
const assert = require("node:assert/strict");

test("smoke: truth", () => {
  assert.equal(true, true);
});

test("smoke: string basics", () => {
  assert.equal("Fintrix".toLowerCase(), "fintrix");
  assert.equal([1, 2, 3].length, 3);
});
