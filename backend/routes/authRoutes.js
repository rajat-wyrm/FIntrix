const express = require("express");

const {
  forgotPassword,
  login,
  me,
  register,
  resetPassword,
  sendEmailOtp,
  sendOtp,
  verifyEmailOtp,
  verifyOtp,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  forgotPasswordSchema,
  loginSchema,
  otpEmailSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} = require("../validations/authValidation");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/me", protect, me);
// Keep both legacy and simplified OTP paths live so older frontend builds do not break during auth-flow changes.
router.post("/send-email-otp", validate(otpEmailSchema), sendEmailOtp);
router.post("/verify-email-otp", validate(verifyOtpSchema), verifyEmailOtp);
router.post("/send-otp", validate(otpEmailSchema), sendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);

module.exports = router;
