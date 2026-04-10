require("dotenv").config();

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const { prisma } = require("./config/postgres");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { createRateLimiter } = require("./middleware/rateLimit");

const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/ai.routes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const authRoutes = require("./routes/authRoutes");
const blockchainRoutes = require("./routes/blockchain.routes");
const dealRoutes = require("./routes/dealRoutes");
const domainSearchRoutes = require("./routes/domainSearchRoutes");
const emailSearchRoutes = require("./routes/emailSearchRoutes");
const integrationRoutes = require("./routes/integrationRoutes");
const leadRoutes = require("./routes/leadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const socialSearchRoutes = require("./routes/socialSearchRoutes");
const userRoutes = require("./routes/userRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:5173";
// Keep the common Vite dev + preview hosts allowed so frontend work can switch environments without backend edits.
const allowedOrigins = new Set([
  frontendUrl,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

app.disable("x-powered-by");
// Trust the first proxy so req.ip and rate limiting still behave correctly behind a load balancer or tunnel.
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// General traffic gets a broader ceiling, while auth routes stay tighter because credential endpoints are higher risk.
const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP. Please try again later.",
});

const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: "Too many authentication attempts. Please wait and try again.",
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fintrix API is running.",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Health checks probe both Express and Prisma so deployments can fail fast if the API is up but the database is not.
app.get("/api/health", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api", generalRateLimit);
app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/admin", authRateLimit, adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/email-search", emailSearchRoutes);
app.use("/api/domain-search", domainSearchRoutes);
app.use("/api/social-search", socialSearchRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/integrations", integrationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
