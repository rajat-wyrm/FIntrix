const { AppError } = require("../middleware/errorHandler");
const { createNotification } = require("../services/notificationService");

const platformMatchers = [
  { platform: "LinkedIn", hosts: ["linkedin.com"], type: "profile" },
  { platform: "GitHub", hosts: ["github.com"], type: "profile" },
  { platform: "X", hosts: ["x.com", "twitter.com"], type: "profile" },
  { platform: "Instagram", hosts: ["instagram.com"], type: "profile" },
  { platform: "Facebook", hosts: ["facebook.com"], type: "profile" },
  { platform: "YouTube", hosts: ["youtube.com", "youtu.be"], type: "channel" },
  { platform: "TikTok", hosts: ["tiktok.com"], type: "profile" },
];

const parseSocialUrl = (input) => {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    const matcher = platformMatchers.find((item) => item.hosts.includes(host));

    if (!matcher) {
      throw new AppError("Unsupported social platform URL.", 400);
    }

    const pathSegments = url.pathname
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);

    return {
      platform: matcher.platform,
      type: matcher.type,
      normalizedUrl: `${url.origin}${url.pathname}`.replace(/\/$/, ""),
      handle:
        pathSegments[0] && !["in", "company", "channel", "c", "user"].includes(pathSegments[0])
          ? pathSegments[0]
          : pathSegments[1] || null,
      pathSegments,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("A valid social profile URL is required.", 400);
  }
};

const socialSearch = async (req, res, next) => {
  try {
    const parsed = parseSocialUrl(req.body.url);

    await createNotification({
      userId: req.user.id,
      type: "SOCIAL_SEARCH",
      message: `Parsed ${parsed.platform} URL successfully.`,
      metadata: parsed,
      link: "/app/search/social",
    });

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  socialSearch,
};
