const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { prisma } = require("../config/postgres");
const { createNotification } = require("../services/notificationService");
const generateToken = require("../utils/generateToken");
const { sendResetEmail, sendVerificationEmail } = require("../utils/sendEmail");

// Strip sensitive fields before sending any user object back to the client.
const getSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  mobile: user.mobile,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

const buildResetUrl = (token) => {
  const origin = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${origin}/reset-password?token=${token}`;
};

const ensureOtpUser = async (email) => {
  // OTP-first login can start before full signup, so we keep one placeholder record per email for cooldowns and verification state.
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return existingUser;
  }

  const placeholderPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 12);

  return prisma.user.create({
    data: {
      name: "Pending User",
      email,
      password: placeholderPassword,
      role: "INVESTOR",
      isVerified: false,
    },
  });
};

const register = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const password = await bcrypt.hash(req.body.password, 12);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.isVerified) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    // If OTP created an unverified placeholder, finish registration on that same row instead of creating duplicates.
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: req.body.name.trim(),
            email,
            password,
            role: req.body.role || existingUser.role || "INVESTOR",
            mobile: req.body.mobile || null,
            isVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
          },
        })
      : await prisma.user.create({
          data: {
            name: req.body.name.trim(),
            email,
            password,
            role: req.body.role || "INVESTOR",
            mobile: req.body.mobile || null,
            isVerified: true,
          },
        });

    await createNotification({
      userId: user.id,
      type: "WELCOME",
      message: "Your account is ready to use.",
      link: "/app/dashboard",
    });

    res.status(existingUser ? 200 : 201).json({
      success: true,
      message: "Registration successful.",
      token: generateToken(user),
      user: getSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(req.body.password, user.password);

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    await createNotification({
      userId: user.id,
      type: "LOGIN",
      message: "You signed in successfully.",
      link: "/app/dashboard",
    });

    res.json({
      success: true,
      token: generateToken(user),
      user: getSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Return the same success message for unknown emails so the endpoint does not leak which accounts exist.
    if (!user) {
      res.json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendResetEmail(user.email, buildResetUrl(rawToken));

    res.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash("sha256").update(req.body.token).digest("hex");
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "The reset token is invalid or has expired.",
      });
      return;
    }

    const password = await bcrypt.hash(req.body.password, 12);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password,
        // Clear reset fields immediately so the email link becomes single-use after a successful password change.
        passwordResetToken: null,
        passwordResetExpires: null,
        isVerified: true,
      },
    });

    await createNotification({
      userId: updatedUser.id,
      type: "PASSWORD_RESET",
      message: "Your password was changed successfully.",
      link: "/app/settings",
    });

    res.json({
      success: true,
      message: "Password reset successful.",
      token: generateToken(updatedUser),
      user: getSafeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    res.json({
      success: true,
      user: getSafeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await ensureOtpUser(email);

    // Cooldown avoids spamming the mail provider and prevents users from invalidating fresh OTPs too quickly.
    if (
      user.emailOtpLastSentAt &&
      Date.now() - new Date(user.emailOtpLastSentAt).getTime() < 60 * 1000
    ) {
      res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP.",
      });
      return;
    }

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    const tokenHash = crypto.createHash("sha256").update(otp).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: tokenHash,
        emailVerificationExpires: new Date(Date.now() + 5 * 60 * 1000),
        emailOtpLastSentAt: new Date(),
      },
    });

    const emailResult = await sendVerificationEmail(email, otp);

    res.json({
      success: true,
      message: "OTP sent successfully.",
      preview: emailResult.skipped,
      // Echo the OTP only outside production so local/dev flows still work when email delivery is stubbed.
      devOtp: process.env.NODE_ENV === "production" ? undefined : otp,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const tokenHash = crypto.createHash("sha256").update(req.body.otp).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        email,
        emailVerificationToken: tokenHash,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "The OTP is invalid or has expired.",
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    res.json({
      success: true,
      message: "OTP verified successfully.",
      // Only create a full session once the placeholder record has been completed with real profile details.
      token:
        updatedUser.name !== "Pending User" ? generateToken(updatedUser) : undefined,
      user:
        updatedUser.name !== "Pending User" ? getSafeUser(updatedUser) : undefined,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  forgotPassword,
  login,
  me,
  register,
  resetPassword,
  sendEmailOtp: sendOtp,
  sendOtp,
  verifyEmailOtp: verifyOtp,
  verifyOtp,
};
