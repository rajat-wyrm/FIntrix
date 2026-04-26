const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";

const { prisma } = require("../config/postgres");
const { startServer, stopServer } = require("../server");

const unique = `codex-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const userEmail = `${unique}@example.com`;
const searchEmail = `lookup-${unique}@example.com`;
const organizationName = `Org ${unique}`;
const leadName = `Lead ${unique}`;
const socialUrl = "https://github.com/octocat";

let server;
let baseUrl;
let token;
let userId;
let organizationId;
let leadId;

const jsonRequest = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { response, body };
};

test.before(async () => {
  server = await startServer(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (leadId) {
    await prisma.lead.deleteMany({ where: { id: leadId } });
  }

  if (organizationId) {
    await prisma.organization.deleteMany({ where: { id: organizationId } });
  }

  if (userId) {
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.analyticsEvent.deleteMany({ where: { userId } });
  }

  await prisma.emailSearch.deleteMany({ where: { email: searchEmail } });
  await prisma.user.deleteMany({ where: { email: userEmail } });

  await new Promise((resolve) => {
    server.close((error) => {
      if (error) {
        // ignore: server may already be closing
      }
      resolve();
    });
  });

  await stopServer().catch(() => {});
  await prisma.$disconnect();
});

test("core api flow works end to end", async () => {
  const registerResult = await jsonRequest("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Codex Tester",
      email: userEmail,
      password: "Password123!",
      role: "INVESTOR",
    }),
  });

  assert.equal(registerResult.response.status, 201);
  assert.equal(registerResult.body.success, true);
  assert.ok(registerResult.body.token);
  userId = registerResult.body.user.id;
  token = registerResult.body.token;

  const loginResult = await jsonRequest("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmail,
      password: "Password123!",
    }),
  });

  assert.equal(loginResult.response.status, 200);
  assert.equal(loginResult.body.success, true);
  assert.ok(loginResult.body.token);

  const meResult = await jsonRequest("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(meResult.response.status, 200);
  assert.equal(meResult.body.user.email, userEmail);

  const organizationResult = await jsonRequest("/api/organizations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: organizationName,
      website: "https://example.com",
      region: "India",
      type: "Startup",
      contactName: "Ops Team",
    }),
  });

  assert.equal(organizationResult.response.status, 201);
  organizationId = organizationResult.body.data.id;

  const leadResult = await jsonRequest("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: leadName,
      email: `${unique}@lead.test`,
      phone: "9999999999",
      domain: "lead.test",
      status: "new",
      source: "website",
    }),
  });

  assert.equal(leadResult.response.status, 201);
  leadId = leadResult.body.data.id;

  const emailSearchResult = await jsonRequest("/api/email-search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: searchEmail,
    }),
  });

  assert.equal(emailSearchResult.response.status, 200);
  assert.equal(emailSearchResult.body.data.email, searchEmail);

  const socialResult = await jsonRequest("/api/social-search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: socialUrl,
    }),
  });

  assert.equal(socialResult.response.status, 200);
  assert.equal(socialResult.body.data.platform, "GitHub");

  const notificationResult = await jsonRequest("/api/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(notificationResult.response.status, 200);
  assert.ok(notificationResult.body.data.length >= 3);
});
