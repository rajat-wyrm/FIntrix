const express = require("express");
const crypto = require("crypto");

const router = express.Router();

/**
 * Verify webhook signature
 * Header: x-webhook-signature
 */
const verifySignature = (payload, signature, secret) => {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(JSON.stringify(payload));
  const digest = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
};

/**
 * Incoming webhook endpoint
 * Used when OTHER systems send events to you
 */
router.post("/incoming", (req, res) => {
  const signature = req.headers["x-webhook-signature"];
  const secret = process.env.WEBHOOK_SECRET;

  if (!signature || !secret) {
    return res.status(401).json({ message: "Missing signature" });
  }

  const isValid = verifySignature(req.body, signature, secret);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  const { event, data } = req.body;

  // Handle webhook event here
  // switch (event) { ... }

  res.status(200).json({ received: true });
});

/**
 * Outgoing webhook sender (helper)
 * Call this from controllers/services
 */
const sendWebhook = async (url, event, payload) => {
  const secret = process.env.WEBHOOK_SECRET;

  const body = {
    event,
    data: payload,
  };

  const signature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-signature": signature,
    },
    body: JSON.stringify(body),
  });
};

module.exports = router;
