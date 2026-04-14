"use strict";

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const buildAllowedOrigins = () => {
  const set = new Set();
  const fromEnv = (process.env.SOCKET_CORS || process.env.FRONTEND_URL || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  for (const origin of fromEnv) {
    set.add(origin);
  }
  set.add("http://localhost:5173");
  set.add("http://127.0.0.1:5173");
  set.add("http://localhost:4173");
  set.add("http://127.0.0.1:4173");
  return set;
};

const extractToken = (socket) => {
  if (socket.handshake?.auth?.token) {
    return socket.handshake.auth.token;
  }
  const header = socket.handshake?.headers?.authorization;
  if (header && typeof header === "string" && header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  const queryToken = socket.handshake?.query?.token;
  if (typeof queryToken === "string" && queryToken.length > 0) {
    return queryToken;
  }
  return null;
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    return null;
  }
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

const createSocketServer = (httpServer) => {
  const path = process.env.SOCKET_PATH || "/socket.io";
  const allowedOrigins = buildAllowedOrigins();

  const io = new Server(httpServer, {
    path,
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} is not allowed by Socket.IO CORS.`));
      },
      credentials: true,
    },
  });

  // Per-IP connection rate limit (in-memory, single-process)
  const connectionBuckets = new Map();
  const connectionWindowMs = 60 * 1000;
  const connectionMax = 20;

  io.use((socket, next) => {
    const ip =
      socket.handshake?.address ||
      socket.conn?.remoteAddress ||
      "unknown";
    const now = Date.now();
    const bucket = connectionBuckets.get(ip);
    if (!bucket || bucket.resetAt <= now) {
      connectionBuckets.set(ip, { count: 1, resetAt: now + connectionWindowMs });
      return next();
    }
    if (bucket.count >= connectionMax) {
      return next(new Error("Too many socket connections from this IP."));
    }
    bucket.count += 1;
    return next();
  });

  io.on("connection", (socket) => {
    const token = extractToken(socket);
    const decoded = token ? verifyToken(token) : null;
    if (decoded) {
      const userId = decoded.userId || decoded.id || decoded.sub;
      if (userId) {
        socket.data.userId = String(userId);
        socket.join(`user:${userId}`);
        logger.info("socket:connected", { socketId: socket.id, userId: socket.data.userId });
      } else {
        logger.info("socket:connected-anonymous", { socketId: socket.id });
      }
    } else {
      logger.info("socket:connected-anonymous", { socketId: socket.id });
    }

    socket.on("disconnect", (reason) => {
      logger.debug("socket:disconnected", { socketId: socket.id, reason });
    });
  });

  const emitToUser = (userId, event, payload) => {
    if (!userId) return false;
    io.to(`user:${userId}`).emit(event, payload);
    return true;
  };

  const broadcast = (event, payload) => {
    io.emit(event, payload);
    return true;
  };

  return {
    io,
    emitToUser,
    broadcast,
  };
};

module.exports = {
  createSocketServer,
  buildAllowedOrigins,
};
