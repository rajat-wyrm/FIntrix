const test = require("node:test");
const assert = require("node:assert/strict");

const {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validations/authValidation");
const { createDealSchema } = require("../validations/dealValidation");
const { createLeadSchema } = require("../validations/leadValidation");
const { createOrganizationSchema } = require("../validations/organizationValidation");

test("registerSchema requires email and password", () => {
  const { error } = registerSchema.validate({});
  assert.ok(error, "should reject empty body");
  assert.equal(error.details.length > 0, true);
});

test("registerSchema accepts a valid payload", () => {
  const { value, error } = registerSchema.validate({
    name: "Jane",
    email: "jane@example.com",
    password: "Password123!",
  });
  assert.equal(error, undefined);
  assert.equal(value.email, "jane@example.com");
});

test("loginSchema rejects bad email format", () => {
  const { error } = loginSchema.validate({ email: "not-an-email", password: "x" });
  assert.ok(error);
});

test("forgotPasswordSchema requires email", () => {
  const { error } = forgotPasswordSchema.validate({});
  assert.ok(error);
});

test("resetPasswordSchema requires token and password", () => {
  const { error } = resetPasswordSchema.validate({ token: "abc" });
  assert.ok(error);
});

test("createOrganizationSchema requires a name", () => {
  const { error } = createOrganizationSchema.validate({});
  assert.ok(error);
});

test("createOrganizationSchema trims name and lowercases website host", () => {
  const { value, error } = createOrganizationSchema.validate({
    name: "  Acme  ",
    website: "https://Acme.test/path",
    region: "Global",
  });
  assert.equal(error, undefined);
  assert.equal(value.name, "Acme");
});

test("createLeadSchema requires email and name", () => {
  const { error } = createLeadSchema.validate({});
  assert.ok(error);
});

test("createDealSchema requires amount", () => {
  const { error } = createDealSchema.validate({});
  assert.ok(error);
});

test("createDealSchema accepts a minimal amount", () => {
  const { value, error } = createDealSchema.validate({ amount: 1000 });
  assert.equal(error, undefined);
  assert.equal(value.amount, 1000);
});
