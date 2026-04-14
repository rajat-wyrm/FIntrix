"use strict";

const cron = require("node-cron");
const { prisma } = require("../config/postgres");
const logger = require("../utils/logger");

let aiProvider = null;
try {
  aiProvider = require("../services/aiProvider");
} catch (_) {
  aiProvider = null;
}

let notificationService = null;
try {
  notificationService = require("../services/notificationService");
} catch (_) {
  notificationService = null;
}

const isPrismaError = (err) =>
  err && typeof err === "object" && typeof err.code === "string" && err.code.startsWith("P");

const safePrisma = async (operation, label) => {
  try {
    return await operation();
  } catch (err) {
    if (isPrismaError(err)) {
      logger.error("followup:prisma-error", { label, code: err.code, message: err.message });
    } else {
      logger.error("followup:unexpected-error", { label, message: err.message });
    }
    return null;
  }
};

const runFollowupJob = async () => {
  const leads = await safePrisma(
    () =>
      prisma.lead.findMany({
        where: {
          status: "new",
          followupSent: false,
        },
        take: 100,
        orderBy: { createdAt: "asc" },
      }),
    "fetch-leads",
  );

  if (!leads) {
    return { processed: 0, sent: 0, skipped: 0 };
  }

  logger.info("followup:candidates", { count: leads.length });

  let sent = 0;
  let skipped = 0;

  for (const lead of leads) {
    // Idempotency: re-check followupSent in case another worker just handled this lead.
    const current = await safePrisma(
      () =>
        prisma.lead.findUnique({
          where: { id: lead.id },
          select: { followupSent: true, addedById: true },
        }),
      "recheck-lead",
    );

    if (!current || current.followupSent) {
      skipped += 1;
      continue;
    }

    let messageBody = `Hi ${lead.name || "there"}, just following up on your interest. Let us know a good time to connect.`;

    if (aiProvider && typeof aiProvider.generateOutreach === "function") {
      try {
        const personalized = await aiProvider.generateOutreach({
          name: lead.name,
          company: lead.companyName,
          purpose: "follow-up",
        });
        if (personalized && personalized.output) {
          messageBody = personalized.output;
        }
      } catch (err) {
        logger.warn("followup:ai-failed", { leadId: lead.id, message: err.message });
      }
    }

    const updated = await safePrisma(
      () =>
        prisma.lead.updateMany({
          where: { id: lead.id, followupSent: false },
          data: {
            followupSent: true,
            contactedAt: new Date(),
            status: "contacted",
          },
        }),
      "mark-followup-sent",
    );

    if (!updated || updated.count === 0) {
      skipped += 1;
      continue;
    }

    sent += 1;
    logger.info("followup:sent", { leadId: lead.id, email: lead.email });

    if (notificationService && current.addedById) {
      try {
        await notificationService.createNotification({
          userId: current.addedById,
          type: "LEAD_FOLLOWUP_SENT",
          message: `Follow-up sent to ${lead.name || lead.email}.`,
          link: "/app/leads",
          metadata: { leadId: lead.id, snippet: messageBody.slice(0, 140) },
        });
      } catch (err) {
        logger.warn("followup:notification-failed", { leadId: lead.id, message: err.message });
      }
    }
  }

  if (notificationService) {
    try {
      const adminUsers = await safePrisma(
        () =>
          prisma.user.findMany({
            where: { role: "ADMIN" },
            select: { id: true },
            take: 25,
          }),
        "fetch-admins",
      );
      if (adminUsers) {
        await Promise.all(
          adminUsers.map((user) =>
            notificationService
              .createNotification({
                userId: user.id,
                type: "FOLLOWUP_JOB_COMPLETE",
                message: `Follow-up job complete: ${sent} sent, ${skipped} skipped (${leads.length} considered).`,
                metadata: { sent, skipped, considered: leads.length },
              })
              .catch(() => null),
          ),
        );
      }
    } catch (err) {
      logger.warn("followup:admin-notification-failed", { message: err.message });
    }
  }

  return { processed: leads.length, sent, skipped };
};

let scheduledTask = null;

const startFollowupJob = () => {
  const schedule = process.env.FOLLOWUP_CRON || "0 9 * * *";
  if (!cron.validate(schedule)) {
    logger.error("followup:invalid-schedule", { schedule });
    return null;
  }
  scheduledTask = cron.schedule(schedule, async () => {
    try {
      await runFollowupJob();
    } catch (err) {
      logger.error("followup:job-failed", { message: err.message });
    }
  });
  logger.info("followup:scheduled", { schedule });
  return scheduledTask;
};

const stopFollowupJob = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }
};

module.exports = {
  startFollowupJob,
  stopFollowupJob,
  runFollowupJob,
};
