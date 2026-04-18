import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Eye, EyeOff, ChevronDown, AlertCircle, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { ThemeToggle } from "../../context/ThemeToggle";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function Signup() {
  // ========== THEME STATE (UI-only - NO BACKEND IMPACT) ==========
  const { theme } = useTheme();
  const darkMode = theme === "dark";

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ========== OTP SIGNUP STATES ==========
  const [isOtpSignup, setIsOtpSignup] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccessMessage("");
    if (error) setError("");
  };

  // ========== BACKEND API HANDLERS ==========
  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccessMessage("Google sign-up is not configured yet.");
      console.log("Mock Google Sign-up Successful");
    } catch (err) {
      console.error(err);
      setError("Failed to sign up with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const { email, firstName, lastName, password } = formData;
    if (!email || !firstName || !lastName || !password) {
      setError("Please fill in your name, email, and password to receive an OTP.");
      setSuccessMessage("");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setSuccessMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        if (data.devOtp) {
          console.log("DEV NOTE: OTP is " + data.devOtp);
        }
        setSuccessMessage(
          `An OTP has been sent to ${email}. ${
            data.preview ? "(Check console/Ethereal)" : ""
          }`
        );
      } else {
        setError(data.message || data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSignup = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP you received.");
      setSuccessMessage("");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setSuccessMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // 1. Verify OTP
      const verifyRes = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || verifyData.message || "Invalid OTP");
      }

      // 2. Register User
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const registerRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const registerData = await registerRes.json();

      if (registerRes.ok) {
        const fullName =
          registerData.user?.name ||
          `${formData.firstName} ${formData.lastName}`;
        const firstName =
          fullName.trim().split(" ")[0] || formData.firstName || "User";
        localStorage.setItem("token", registerData.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", firstName);
        localStorage.setItem(
          "userRole",
          registerData.user?.role || "INVESTOR"
        );
        setSuccessMessage(
          "Account created successfully. Redirecting to dashboard..."
        );
        setFormData({ firstName: "", lastName: "", email: "", password: "" });
        setOtp("");
        setOtpSent(false);
        setIsOtpSignup(false);
        window.setTimeout(() => navigate("/user-dashboard"), 1000);
      } else {
        setError(
          registerData.message || "Registration failed after OTP verification."
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccessMessage("");

    const { email, password, firstName, lastName } = formData;

    if (!email || !password || !firstName || !lastName) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        const fullName = data.user?.name || `${firstName} ${lastName}`;
        const firstNameFromUser =
          fullName.trim().split(" ")[0] || firstName || "User";
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", firstNameFromUser);
        localStorage.setItem("userRole", data.user?.role || "INVESTOR");
        setSuccessMessage(
          "Account created successfully. Redirecting to dashboard..."
        );
        setFormData({ firstName: "", lastName: "", email: "", password: "" });
        window.setTimeout(() => navigate("/user-dashboard"), 1000);
      } else {
        setError(data.message || data.error || "Failed to create account.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleLangSelect = (lang) => {
    setSelectedLang(lang);
    setIsLangOpen(false);
  };

  // ========== RENDER ==========
  return (
    <div
      className={`h-screen w-full font-sans  transition-colors duration-300 ${
        darkMode ? "bg-slate-950" : "bg-white"
      }`}
    >
      <div className="w-full h-full flex flex-col md:flex-row">
        {/* ===== LEFT SIDEBAR - HERO IMAGE ===== */}
        <div
          className={`relative hidden md:block md:w-1/3  h-full ${
            darkMode
              ? "bg-slate-900 ring-1 ring-slate-800"
              : "bg-sky-100"
          }`}
        >
          <div className="absolute inset-0">
            <img
              src="image 1.png"
              alt="Signup Visual"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.classList.add(
                  "flex",
                  "items-center",
                  "justify-center",
                  "text-gray-400",
                  darkMode ? "bg-slate-900" : "bg-sky-50"
                );
                e.target.parentElement.innerHTML =
                  '<div class="text-center p-8"><div>Image not found</div><div class="text-sm opacity-75">image 1.png</div></div>';
              }}
            />
            <div
              className={`absolute inset-0 ${
                darkMode
                  ? "bg-slate-900/40 mix-blend-overlay"
                  : "bg-teal-900/20 mix-blend-overlay"
              }`}
            ></div>
          </div>
        </div>

        {/* ===== RIGHT SIDEBAR - SIGNUP FORM ===== */}
        <div
          className={`w-full md:w-2/3 p-6 md:p-10 lg:p-16 relative flex flex-col justify-center h-full overflow-y-auto ${
            darkMode ? "bg-slate-950" : "bg-white"
          }`}
        >
          {/* ===== TOP RIGHT CONTROLS ===== */}
          <div className="absolute top-6 right-6 md:top-8 md:right-8 flex items-center space-x-4 z-10">
            {/* Theme Toggle Button - Using Global ThemeToggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center text-sm cursor-pointer transition-colors duration-200 ${
                  darkMode
                    ? "text-slate-400 hover:text-teal-400"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span>{selectedLang}</span>
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform duration-200 ${
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

          {/* ===== MAIN SIGNUP CONTENT ===== */}
          <div className="max-w-md mx-auto w-full flex flex-col justify-center">
            {/* Logo & Header */}
            <div className="text-center mb-6 md:mb-8">
              <div className="h-7 md:h-16 mb-4 flex items-center justify-center">
                <Link to="/">
                  <img
                    src="/UptoSkillsLogo.webp"
                    alt="Uptoskills Logo"
                    className="h-20 mb-4 mt-4 object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<span class="text-2xl font-bold text-teal-500">Uptoskills</span>';
                    }}
                  />
                </Link>
              </div>
              <h1
                className={`text-2xl md:text-3xl font-bold tracking-wide mb-2 ${
                  darkMode ? "text-teal-400" : "text-teal-400"
                }`}
              >
                WELCOME
              </h1>
              <p
                className={`text-xs md:text-sm ${
                  darkMode ? "text-slate-400" : "text-gray-400"
                }`}
              >
                Please enter your details and start your
                <br />
                journey with us
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                className={`flex-1 flex items-center justify-center gap-2 border py-2.5 px-4 rounded-lg transition-all duration-200 text-xs font-medium ${
                  darkMode
                    ? "border-slate-600 text-slate-300 hover:bg-slate-800/50"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <i className="fab fa-microsoft text-blue-500 text-lg"></i>
                <span>Sign up with Microsoft</span>
              </button>
              <button
                onClick={handleGoogleSignup}
                className={`flex-1 flex items-center justify-center gap-2 border py-2.5 px-4 rounded-lg transition-all duration-200 text-xs font-medium ${
                  darkMode
                    ? "border-slate-600 text-slate-300 hover:bg-slate-800/50"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <i className="fab fa-google text-red-500 text-lg"></i>
                <span>Sign up with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-6">
              <div
                className={`border-t w-full absolute ${
                  darkMode ? "border-slate-700" : "border-gray-200"
                }`}
              ></div>
              <span
                className={`px-3 relative z-10 text-xs ${
                  darkMode
                    ? "bg-slate-950 text-slate-500"
                    : "bg-white text-gray-400"
                }`}
              >
                -- OR --
              </span>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                className={`mb-4 p-3 text-xs rounded-lg flex items-center border transition-all duration-200 ${
                  darkMode
                    ? "bg-red-900/20 text-red-400 border-red-800"
                    : "bg-red-50 text-red-500 border-red-200"
                }`}
              >
                <AlertCircle size={16} className="mr-2 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div
                className={`mb-4 p-3 text-xs rounded-lg flex items-center justify-center text-center border transition-all duration-200 ${
                  darkMode
                    ? "bg-green-900/20 text-green-400 border-green-800"
                    : "bg-green-50 text-green-600 border-green-200"
                }`}
              >
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={isOtpSignup ? handleOtpSignup : handleSubmit}
              className="space-y-4 md:space-y-5"
            >
              {/* Name Fields */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder=" "
                      required
                      disabled={loading || (isOtpSignup && otpSent)}
                      className={`peer w-full border-b py-2 focus:outline-none placeholder-transparent bg-transparent transition-colors duration-200 ${
                        darkMode
                          ? "border-slate-600 text-white focus:border-teal-500"
                          : "border-gray-300 text-gray-900 focus:border-teal-400"
                      }`}
                    />
                    <label
                      className={`absolute left-0 -top-3.5 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs ${
                        darkMode
                          ? "text-slate-500 peer-placeholder-shown:text-slate-400 peer-focus:text-slate-400"
                          : "text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-gray-600"
                      }`}
                    >
                      First Name
                    </label>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder=" "
                      required
                      disabled={loading || (isOtpSignup && otpSent)}
                      className={`peer w-full border-b py-2 focus:outline-none placeholder-transparent bg-transparent transition-colors duration-200 ${
                        darkMode
                          ? "border-slate-600 text-white focus:border-teal-500"
                          : "border-gray-300 text-gray-900 focus:border-teal-400"
                      }`}
                    />
                    <label
                      className={`absolute left-0 -top-3.5 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs ${
                        darkMode
                          ? "text-slate-500 peer-placeholder-shown:text-slate-400 peer-focus:text-slate-400"
                          : "text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-gray-600"
                      }`}
                    >
                      Last Name
                    </label>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="relative pt-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder=" "
                  required
                  disabled={loading || (isOtpSignup && otpSent)}
                  className={`peer w-full border-b py-2 focus:outline-none placeholder-transparent bg-transparent transition-colors duration-200 ${
                    darkMode
                      ? "border-slate-600 text-white focus:border-teal-500"
                      : "border-gray-300 text-gray-900 focus:border-teal-400"
                  }`}
                />
                <label
                  className={`absolute left-0 -top-1.5 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1.5 peer-focus:text-xs ${
                    darkMode
                      ? "text-slate-500 peer-placeholder-shown:text-slate-400 peer-focus:text-slate-400"
                      : "text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-gray-600"
                  }`}
                >
                  E-mail
                </label>
                <span
                  className={`absolute right-0 top-4 text-xs pointer-events-none opacity-0 peer-focus:opacity-100 transition-opacity hidden sm:block ${
                    darkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  @gmail.com
                </span>
              </div>

              {/* Password Input */}
              <div className="relative pt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder=" "
                  required
                  minLength={6}
                  disabled={loading || (isOtpSignup && otpSent)}
                  className={`peer w-full border-b py-2 focus:outline-none placeholder-transparent pr-8 bg-transparent transition-colors duration-200 ${
                    darkMode
                      ? "border-slate-600 text-white focus:border-teal-500"
                      : "border-gray-300 text-gray-900 focus:border-teal-400"
                  }`}
                />
                <label
                  className={`absolute left-0 -top-1.5 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1.5 peer-focus:text-xs ${
                    darkMode
                      ? "text-slate-500 peer-placeholder-shown:text-slate-400 peer-focus:text-slate-400"
                      : "text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-gray-600"
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-0 top-4 focus:outline-none transition-colors duration-200 ${
                    darkMode
                      ? "text-slate-500 hover:text-slate-400"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Password Signup Form */}
              {!isOtpSignup ? (
                <>
                  <div className="pt-6 md:pt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full font-bold py-3 px-4 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base ${
                        darkMode
                          ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white"
                          : "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 hover:from-teal-200 hover:to-teal-300"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Creating Account...
                        </>
                      ) : (
                        "CREATE ACCOUNT"
                      )}
                    </button>
                  </div>
                  <div
                    className={`text-center text-xs ${
                      darkMode ? "text-slate-400" : "text-gray-500"
                    }`}
                  >
                    Or{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpSignup(true);
                        setError("");
                        setSuccessMessage("");
                        setOtp("");
                        setOtpSent(false);
                      }}
                      className="text-red-400 hover:text-red-500 font-semibold"
                    >
                      sign up with a one-time code
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {!otpSent ? (
                    <div className="pt-6 md:pt-8">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className={`w-full font-bold py-3 px-4 rounded-lg shadow-sm flex items-center justify-center transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed ${
                          darkMode
                            ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white"
                            : "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 hover:from-teal-200 hover:to-teal-300"
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Sending...
                          </>
                        ) : (
                          "Send Verification Code"
                        )}
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* OTP Input */}
                      <div className="relative pt-2">
                        <input
                          type="text"
                          name="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder=" "
                          required
                          className={`peer w-full border-b py-2 focus:outline-none placeholder-transparent bg-transparent transition-colors duration-200 ${
                            darkMode
                              ? "border-slate-600 text-white focus:border-teal-500"
                              : "border-gray-300 text-gray-900 focus:border-teal-400"
                          }`}
                        />
                        <label
                          className={`absolute left-0 -top-1.5 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1.5 peer-focus:text-xs ${
                            darkMode
                              ? "text-slate-500 peer-placeholder-shown:text-slate-400 peer-focus:text-slate-400"
                              : "text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-gray-600"
                          }`}
                        >
                          One-Time Code
                        </label>
                      </div>
                      <div className="pt-6 md:pt-8">
                        <button
                          type="submit"
                          disabled={loading}
                          className={`w-full font-bold py-3 px-4 rounded-lg shadow-sm flex items-center justify-center transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed ${
                            darkMode
                              ? "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white"
                              : "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 hover:from-teal-200 hover:to-teal-300"
                          }`}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin mr-2 h-4 w-4" />
                              Creating...
                            </>
                          ) : (
                            "Create Account with Code"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpSignup(false);
                        setError("");
                        setSuccessMessage("");
                        setOtp("");
                        setOtpSent(false);
                      }}
                      className="text-xs text-red-400 hover:text-red-500 font-semibold"
                    >
                      Back to password sign up
                    </button>
                  </div>
                </>
              )}

              {/* Login Link */}
              <div className="text-center pt-4 pb-4 md:pb-0">
                <p
                  className={`text-xs ${
                    darkMode ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-red-400 hover:text-red-500 font-semibold"
                  >
                    Login
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}