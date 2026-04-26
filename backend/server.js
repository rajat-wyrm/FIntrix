"use strict";

require("dotenv").config();

const http = require("http");
const app = require("./app");
const { connectPostgres, prisma } = require("./config/postgres");
const { createSocketServer } = require("./config/socket");
const logger = require("./utils/logger");

let ioRef = null;
let serverRef = null;
let shuttingDown = false;

const envInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const startServer = async (overrides = {}) => {
  const normalized =
    typeof overrides === "number" || typeof overrides === "string"
      ? { port: overrides }
      : overrides || {};
  const port = normalized.port ?? envInt(process.env.PORT, 5000);
  const host = normalized.host ?? process.env.HOST ?? "0.0.0.0";

  await connectPostgres();

  const httpServer = http.createServer(app);
  serverRef = httpServer;

  const socket = createSocketServer(httpServer);
  ioRef = socket.io;
  app.set("io", socket.io);
  app.set("emitToUser", socket.emitToUser);
  app.set("broadcast", socket.broadcast);

  const followupEnabled =
    String(process.env.FOLLOWUP_CRON_ENABLED ?? "true").toLowerCase() !== "false";
  if (followupEnabled) {
    try {
      const followupJob = require("./jobs/followupJob");
      followupJob.startFollowupJob();
    } catch (err) {
      logger.error("followup:startup-failed", { message: err.message });
    }
  } else {
    logger.info("followup:disabled-by-env");
  }

  await new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, host, () => {
      httpServer.removeListener("error", reject);
      if (process.env.NODE_ENV !== "test") {
        const address = httpServer.address();
        const displayedHost = address && address.address ? address.address : host;
        logger.info("server:listening", {
          host: displayedHost,
          port: address ? address.port : port,
        });
      }
      resolve();
    });
  });

  return httpServer;
};

const gracefulShutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("server:shutdown-start", { signal });

  try {
    const followupJob = require("./jobs/followupJob");
    followupJob.stopFollowupJob();
  } catch (_) {
    // job not loaded or already torn down
  }

  if (ioRef) {
    try {
      ioRef.close();
    } catch (err) {
      logger.warn("socket:close-failed", { message: err.message });
    }
  }

  if (serverRef) {
    await new Promise((resolve) => {
      serverRef.close((err) => {
        if (err) {
          logger.warn("http:close-failed", { message: err.message });
        }
        resolve();
      });
    });
  }

  try {
    await prisma.$disconnect();
  } catch (err) {
    logger.warn("prisma:disconnect-failed", { message: err.message });
  }

  logger.info("server:shutdown-complete");
};

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT").finally(() => process.exit(0));
});
process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM").finally(() => process.exit(0));
});

if (require.main === module) {
  startServer().catch((error) => {
    logger.error("server:startup-failed", { message: error.message });
    process.exit(1);
  });
}

module.exports = {
  app,
  startServer,
  stopServer: gracefulShutdown,
  get io() {
    return ioRef;
  },
  getIo: () => ioRef,
};
