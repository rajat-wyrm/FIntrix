import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { ThemeToggle } from "../../context/ThemeToggle";
import {
  AlertCircle,
  Building,
  ChevronDown,
  Chrome,
  Eye,
  EyeOff,
  Globe,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Login = ({ setUserEmail }) => {
  // ========== THEME STATE (UI-only - NO BACKEND IMPACT) ==========
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  // ========== NAVIGATION ==========
  const navigate = useNavigate();

  // ========== AUTHENTICATION STATES ==========
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ========== PASSWORD RESET STATES ==========
  const [isForgot, setIsForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // ========== OTP LOGIN STATES ==========
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // ========== LANGUAGE STATES ==========
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English (UK)");
  const languages = ["English (UK)", "English (US)", "Español", "Français"];

  // ========== UTILITY FUNCTIONS ==========
  const validatePassword = (password) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength)
      return "Password must be at least 6 characters long.";
    if (!hasUpperCase)
      return "Password must contain at least one uppercase letter.";
    if (!hasLowerCase)
      return "Password must contain at least one lowercase letter.";
    if (!hasNumbers) return "Password must contain at least one number.";
    if (!hasSpecialChar)
      return "Password must contain at least one special character.";

    return null;
  };

  const getFirstName = (fullName) => {
    if (!fullName) return "User";
    return fullName.split(" ")[0];
  };

  const storeSession = (data, fallbackEmail) => {
    const fullName = data.user?.name;
    const firstName = getFirstName(fullName || fallbackEmail?.split("@")[0]);

    // Store the minimal keys that route guards and dashboard greetings rely on after login
    localStorage.setItem("token", data.token);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", firstName);
    localStorage.setItem("userRole", data.user?.role || "INVESTOR");
  };

  // ========== BACKEND API HANDLERS ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login Successful:", data);
        storeSession(data, email);
        setUserEmail(email);
        navigate("/Maindashboard");
      } else {
        console.error(
          "Login Failed:",
          data.message || data.error || "Unknown error"
        );
        setError(data.message || data.error || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Network/Server Error:", err);
      setError(
        "Could not connect to the backend server (http://localhost:3000). Is server.js running?"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail) {
      setError("Please enter your email");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setError("");
        alert(data.message || "Reset link sent if email exists.");
        setIsForgot(false);
        setForgotEmail("");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Network error – is backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpEmail) {
      setError("Please enter your email to receive an OTP.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        if (data.devOtp) {
          console.log("DEV NOTE: OTP is " + data.devOtp);
        }
        alert(
          `An OTP has been sent to ${otpEmail}. ${
            data.preview ? "(Check console/Ethereal)" : ""
          }`
        );
      } else {
        setError(data.message || data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async () => {
    if (!otp) {
      setError("Please enter the OTP you received.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp }),
      });
      const data = await response.json();

      if (response.ok && data.token && data.user) {
        storeSession(data, otpEmail);
        setUserEmail(otpEmail);
        alert("Login successful!");
        navigate("/user-dashboard");
      } else if (response.ok) {
        setError(
          "This email is verified, but the account is not fully registered yet. Please sign up with a password first."
        );
      } else {
        setError(data.message || data.error || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed due to network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLangSelect = (lang) => {
    setSelectedLang(lang);
    setIsLangOpen(false);
  };

  // ========== RENDER ==========
  return (
    <div
      className={`flex min-h-screen font-inter transition-colors duration-300 ${
        darkMode ? "bg-slate-950" : "bg-white"
      }`}
    >
      {/* ===== LEFT SIDEBAR - HERO IMAGE ===== */}
      <div
        className={`hidden md:block w-[40%] lg:w-[35%] relative overflow-hidden rounded-tr-4xl rounded-br-4xl shadow-xl z-10 ${
          darkMode ? "ring-1 ring-slate-800" : ""
        }`}
      >
        <img
          src="/image 1.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 ${
            darkMode
              ? "bg-slate-900/40 mix-blend-overlay"
              : "bg-teal-900/20 mix-blend-overlay"
          }`}
        ></div>
      </div>

      {/* ===== RIGHT SIDEBAR - LOGIN FORM ===== */}
      <div className="flex-1 flex flex-col relative">
        {/* ===== TOP RIGHT CONTROLS ===== */}
        <div className="absolute top-6 right-6 z-20 flex items-center space-x-4">
          {/* Theme Toggle Button - Using Global ThemeToggle */}
          <ThemeToggle />

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`flex items-center space-x-2 text-sm font-medium px-3 py-2 rounded-md transition-colors duration-200 ${
                darkMode
                  ? "text-slate-400 hover:text-teal-400 hover:bg-slate-800"
                  : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>{selectedLang}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isLangOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isLangOpen && (
              <div
                className={`absolute right-0 mt-2 w-40 rounded-lg shadow-xl border py-1 transition-all duration-200 z-50 ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-100"
                }`}
              >
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLangSelect(lang)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                      darkMode
                        ? "text-slate-300 hover:bg-slate-700 hover:text-teal-400"
                        : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== MAIN LOGIN CONTENT ===== */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center flex flex-col items-center justify-center">
              <Link to="/">
                <img
                  src="/UptoSkillsLogo.webp"
                  alt="Uptoskills Logo"
                  className="h-25 mb-2 object-contain"
                />
              </Link>
              <span className="sr-only">UPTOSKILLS</span>
            </div>

            {/* Welcome Header */}
            <div className="text-center mb-6">
              <div
                className={`text-2xl font-bold ${
                  darkMode ? "text-teal-400" : "text-teal-600"
                }`}
              >
                WELCOME <span className="text-orange-400">BACK</span>
              </div>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-slate-400" : "text-gray-500"
                }`}
              >
                Please enter your details and continue your journey with us.
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <button
                className={`flex items-center justify-center w-full py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200 ${
                  darkMode
                    ? "border border-slate-600 text-slate-300 hover:bg-slate-800/50"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Building className="w-5 h-5 text-gray-600 mr-3" />
                <span className="font-medium">Login with Microsoft</span>
              </button>

              <button
                className={`flex items-center justify-center w-full py-2.5 px-4 rounded-lg shadow-sm transition-all duration-200 ${
                  darkMode
                    ? "border border-slate-600 text-slate-300 hover:bg-slate-800/50"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Chrome className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium">Login with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <hr
                className={`grow ${
                  darkMode ? "border-slate-700" : "border-gray-300"
                }`}
              />
              <span
                className={`mx-4 font-medium text-sm ${
                  darkMode ? "text-slate-500" : "text-gray-400"
                }`}
              >
                OR
              </span>
              <hr
                className={`grow ${
                  darkMode ? "border-slate-700" : "border-gray-300"
                }`}
              />
            </div>

            {/* Error Alert */}
            {error && (
              <div
                className={`mb-4 flex items-center p-3.5 rounded-lg border transition-all duration-200 ${
                  darkMode
                    ? "bg-red-900/20 border-red-800 text-red-400"
                    : "bg-red-50 border-red-300 text-red-500"
                }`}
              >
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ===== LOGIN FORM ===== */}
            {!isForgot && !isOtpLogin && (
              <>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Email Input */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      E-mail
                    </label>
                    <input
                      type="email"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                        darkMode
                          ? "bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          : "bg-white border-gray-300 text-black placeholder-gray-400 focus:ring-teal-400"
                      }`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                          darkMode
                            ? "bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                            : "bg-white border-gray-300 text-black placeholder-gray-400 focus:ring-teal-400"
                        }`}
                        type={showPassword ? "text" : "password"}
                        placeholder=".........."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-200 ${
                          darkMode
                            ? "text-slate-500 hover:text-slate-400"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpLogin(true);
                        setError("");
                      }}
                      className="text-amber-500 hover:text-amber-600 transition-colors duration-200"
                    >
                      Login with OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgot(true);
                        setError("");
                      }}
                      className="text-amber-500 hover:text-amber-600 transition-colors duration-200"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 font-semibold rounded-lg flex items-center justify-center transition-all duration-200 ${
                      darkMode
                        ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white disabled:opacity-70"
                        : "bg-teal-800 text-white hover:bg-teal-700 disabled:opacity-70"
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-6 animate-spin" />
                    ) : (
                      "Log In"
                    )}
                  </button>
                </form>

                {/* Sign Up Link */}
                <p
                  className={`text-center text-sm mt-8 ${
                    darkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-amber-500 hover:text-amber-600 transition-colors duration-200"
                  >
                    Sign Up!
                  </Link>
                </p>
              </>
            )}

            {/* ===== FORGOT PASSWORD FORM ===== */}
            {isForgot && (
              <div className="space-y-5">
                <p
                  className={`text-center text-sm ${
                    darkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  Enter your email to receive a password reset link.
                </p>
                <input
                  type="email"
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                    darkMode
                      ? "bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      : "bg-white border-gray-300 text-black placeholder-gray-400 focus:ring-teal-400"
                  }`}
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleForgotSubmit}
                  disabled={isLoading}
                  className={`w-full py-3 px-4 font-semibold rounded-lg flex items-center justify-center transition-all duration-200 ${
                    darkMode
                      ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white disabled:opacity-70"
                      : "bg-teal-800 text-white hover:bg-teal-700 disabled:opacity-70"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-6 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgot(false);
                    setForgotEmail("");
                    setError("");
                  }}
                  className={`w-full text-center text-sm transition-colors duration-200 ${
                    darkMode
                      ? "text-amber-400 hover:text-amber-300"
                      : "text-amber-500 hover:text-amber-600"
                  }`}
                >
                  Back to Login
                </button>
              </div>
            )}

            {/* ===== OTP LOGIN FORM ===== */}
            {isOtpLogin && (
              <div className="space-y-5">
                {!otpSent ? (
                  <>
                    <p
                      className={`text-center text-sm ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Enter your email to receive a login OTP.
                    </p>
                    <input
                      type="email"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                        darkMode
                          ? "bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          : "bg-white border-gray-300 text-black placeholder-gray-400 focus:ring-teal-400"
                      }`}
                      placeholder="you@example.com"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className={`w-full py-3 px-4 font-semibold rounded-lg flex items-center justify-center transition-all duration-200 ${
                        darkMode
                          ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white disabled:opacity-70"
                          : "bg-teal-800 text-white hover:bg-teal-700 disabled:opacity-70"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-6 animate-spin" />
                      ) : (
                        "Send OTP"
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <p
                      className={`text-center text-sm ${
                        darkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      An OTP has been sent to {otpEmail}.
                    </p>
                    <input
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                        darkMode
                          ? "bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          : "bg-white border-gray-300 text-black placeholder-gray-400 focus:ring-teal-400"
                      }`}
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={handleOtpLogin}
                      disabled={isLoading}
                      className={`w-full py-3 px-4 font-semibold rounded-lg flex items-center justify-center transition-all duration-200 ${
                        darkMode
                          ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white disabled:opacity-70"
                          : "bg-teal-800 text-white hover:bg-teal-700 disabled:opacity-70"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-6 animate-spin" />
                      ) : (
                        "Login with OTP"
                      )}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpLogin(false);
                    setOtpEmail("");
                    setOtp("");
                    setOtpSent(false);
                    setError("");
                  }}
                  className={`w-full text-center text-sm transition-colors duration-200 ${
                    darkMode
                      ? "text-amber-400 hover:text-amber-300"
                      : "text-amber-500 hover:text-amber-600"
                  }`}
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;