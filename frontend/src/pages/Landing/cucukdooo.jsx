import React, { useState, createContext, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTags,
  FaLinkedin,
  FaRocket,
  FaUserTie,
  FaUserGraduate,
  FaTwitter,
  FaFacebook,
  FaComments,
  FaSearch,
  FaDatabase,
  FaGlobe,
  FaLink,
  FaTimes,
  FaUsers,
  FaBuilding,
  FaChartLine,
  FaLock,
  FaBolt,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

// Public assets should be referenced by URL strings in Vite.
import { dashboardImg, logoMainImg } from "./landingAssets";

const LOGO_TEXT = "UptoSkills";

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const scaleInUp = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const ThemeContext = createContext();

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedModal, setSelectedModal] = useState(null);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, selectedModal, setSelectedModal }}>
      <div
        className={`w-full min-h-screen antialiased transition-colors duration-500 ${
          darkMode
            ? "bg-slate-950 text-gray-100"
            : "bg-white text-gray-900"
        }`}
      >
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <ChatBotButton />

        <main className="pt-16">
          <Hero />
          <Features />
          <HowItWorks />
          <UseCases />
          <Pricing />
          <CTA />
        </main>

        <Footer />

        {/* Global Modal */}
        <ModalManager />
      </div>
    </ThemeContext.Provider>
  );
}

// ---------- Navbar ----------
function Navbar({ darkMode, setDarkMode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        darkMode
          ? "bg-slate-950/80 border-slate-800"
          : "bg-white/80 border-gray-200"
      } border-b backdrop-blur-xl`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        
        {/* LEFT - Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logoMainImg}
              alt="UptoSkills Logo"
              className="h-14 w-auto"
            />
          </Link>
        </div>

        {/* CENTER - Nav Links */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-10">
          {navLinks.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className={`relative text-sm font-semibold tracking-wide transition-all duration-300 group ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                {link.label}
              </span>

              <span
                className={`absolute left-0 -bottom-1 h-[2px] w-0 transition-all duration-300 group-hover:w-full ${
                  darkMode ? "bg-white" : "bg-gray-900"
                }`}
              ></span>
            </a>
          ))}
        </nav>

        {/* RIGHT - Actions */}
        <div className="flex-1 flex justify-end items-center gap-4">
          
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-lg transition-colors duration-200 ${
              darkMode
                ? "bg-slate-800 hover:bg-slate-700 text-yellow-400"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Login */}
          <Link
            to="/login-gateway"
            className={`hidden md:block text-sm font-medium ${
              darkMode
                ? "text-gray-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Log in
          </Link>

          {/* Sign Up */}
          <Link
            to="/signup"
            className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-medium text-sm hover:scale-105 transition"
          >
            Sign Up
          </Link>

          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-xl"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden px-6 py-4 space-y-3 border-t ${
              darkMode ? "border-slate-800 bg-slate-900/50" : "border-gray-200 bg-gray-50/50"
            }`}
          >
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="block text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ---------- Hero Section ----------
function Hero() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <section
      className={`relative min-h-screen flex items-center overflow-hidden pt-20 ${
        darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-white via-gray-50 to-white"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 ${
            darkMode ? "bg-violet-500" : "bg-violet-200"
          }`}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ top: "10%", right: "10%" }}
        />
        <motion.div
          className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 ${
            darkMode ? "bg-purple-500" : "bg-purple-200"
          }`}
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          style={{ bottom: "10%", left: "5%" }}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-auto  lg:gap-20 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              {/* Decorative elements */}
              <div
                className={`absolute inset-0 rounded-2xl blur-2xl opacity-30 ${
                  darkMode
                    ? "bg-gradient-to-r from-violet-500 to-purple-600"
                    : "bg-gradient-to-r from-violet-300 to-purple-300"
                }`}
              />
              <img
                src={dashboardImg}
                alt="Dashboard"
                className="relative rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                darkMode
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-violet-50 border border-violet-200"
              }`}
            >
              <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
              <span className="text-sm font-medium">Powered by Real-time Data</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className={`text-5xl md:text-6xl lg:text-6xl font-bold leading-tight mb-6 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600">
                Unlock Your Best
              </span>
              <br />
              <span>Leads in Seconds</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className={`text-lg leading-relaxed mb-8 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Discover verified email addresses, social profiles, and enriched company data. 
              Apply smart filters and build your perfect customer list in moments.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 flex items-center justify-center gap-2"
              >
                Get Started Free
                <FaArrowRight size={16} />
              </Link>
              
              <button
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 border ${
                  darkMode
                    ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                    : "border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-900"
                }`}
              >
                <Link to="/login">
                Watch Demo
                </Link>
                
              </button>
              
            </motion.div>

            {/* Features List */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-gray-200 dark:border-slate-800"
            >
              {[
                { label: "Verified Data", icon: "✓" },
                { label: "Instant Export", icon: "⚡" },
                { label: "No Credit Card", icon: "🎁" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---------- Features Section ----------
function Features() {
  const { darkMode, setSelectedModal } = useContext(ThemeContext);

  const features = [
    {
      id: "lead-management",
      title: "Lead Management",
      desc: "Create, edit, tag, and track leads with clear status stages.",
      icon: <FaUsers size={24} />,
      color: "from-violet-500 to-purple-600",
      details:
        "Organize your entire lead pipeline with our intuitive management system. Set custom stages, automate workflows, and track every interaction to ensure no opportunity is missed.",
    },
    {
      id: "org-management",
      title: "Organization Management",
      desc: "Manage companies and accounts by linking multiple leads together.",
      icon: <FaBuilding size={24} />,
      color: "from-purple-500 to-indigo-600",
      details:
        "Group leads by organization and unlock company-level insights. Track organizational details, relationships, and aggregate metrics across all linked leads and contacts.",
    },
    {
      id: "data-enrichment",
      title: "Data Enrichment Tools",
      desc: "Enrich leads using email search, domain lookup, and social data.",
      icon: <FaSearch size={24} />,
      color: "from-indigo-500 to-blue-600",
      details:
        "Instantly enrich incomplete data with verified emails, social profiles, and company information. Our AI-powered enrichment ensures your database stays fresh and accurate.",
    },
    {
      id: "analytics",
      title: "Analytics & Insights",
      desc: "Track lead funnels, activities, and conversion metrics.",
      icon: <FaChartLine size={24} />,
      color: "from-blue-500 to-cyan-600",
      details:
        "Visualize your sales pipeline and conversion metrics in real-time. Build custom dashboards to monitor what matters most to your team's success.",
    },
  ];

  return (
    <section
      id="features"
      className={`py-24 relative ${
        darkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Powerful Features
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            } max-w-2xl mx-auto`}
          >
            Everything you need to manage leads, organizations, and outreach in one
            simple platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              variants={scaleInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={i}
              onClick={() => setSelectedModal(feature)}
              className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                darkMode
                  ? "bg-slate-800 border-slate-700 hover:border-violet-500/30 hover:bg-slate-800/80"
                  : "bg-white border-gray-200 hover:border-violet-300 hover:bg-white"
              } hover:shadow-xl hover:-translate-y-1`}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl mb-4 text-white bg-gradient-to-r ${feature.color}`}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3
                className={`text-lg font-semibold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {feature.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {feature.desc}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-2 text-violet-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <FaArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- How It Works ----------
function HowItWorks() {
  const { darkMode } = useContext(ThemeContext);

  const steps = [
    {
      step: "01",
      title: "Set Requirements",
      desc: "Choose your criteria: Job title, Location, Industry, and more.",
      color: "from-violet-500 to-purple-600",
    },
    {
      step: "02",
      title: "Run Search",
      desc: "Our engine scans millions of records to find verified matches.",
      color: "from-purple-500 to-indigo-600",
    },
    {
      step: "03",
      title: "Export Data",
      desc: "Download your leads in CSV format and start your outreach.",
      color: "from-indigo-500 to-blue-600",
    },
  ];

  return (
    <section
      id="how-it-works"
      className={`py-24 ${
        darkMode ? "bg-slate-950" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Generate Targeted Leads <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600">
              in Bulk
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={scaleInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={i}
              className={`relative p-8 rounded-2xl border transition-all duration-300 group ${
                darkMode
                  ? "bg-slate-900 border-slate-800 hover:border-violet-500/30"
                  : "bg-gray-50 border-gray-200 hover:border-violet-300"
              } hover:shadow-lg hover:-translate-y-1`}
            >
              {/* Step Number */}
              <div
                className={`text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r ${step.color}`}
              >
                {step.step}
              </div>

              {/* Content */}
              <h3
                className={`text-xl font-semibold mb-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {step.desc}
              </p>

              {/* Accent line */}
              <div
                className={`h-1 w-12 mt-6 rounded-full bg-gradient-to-r ${step.color} group-hover:w-16 transition-all duration-300`}
              />
            </motion.div>
          ))}
        </div>

        {/* Connector Lines */}
        <div className="hidden md:flex justify-between items-center mt-8 px-12">
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent"></div>
        </div>
      </div>
    </section>
  );
}

// ---------- Use Cases ----------
function UseCases() {
  const { darkMode, setSelectedModal } = useContext(ThemeContext);

  const useCases = [
    {
      id: "sales-teams",
      title: "Sales Teams",
      desc: "Track leads, manage follow-ups, and monitor pipeline status.",
      icon: <FaChartLine size={24} />,
      color: "from-violet-500 to-purple-600",
      details:
        "Close more deals with a complete view of your sales pipeline. Automate follow-ups, track engagement metrics, and prioritize high-value opportunities.",
    },
    {
      id: "founders",
      title: "Startup Founders",
      desc: "Organize early-stage outreach and manage contacts efficiently.",
      icon: <FaRocket size={24} />,
      color: "from-purple-500 to-indigo-600",
      details:
        "Build your customer base from scratch with organized lead management. Perfect for B2B founders doing hands-on outreach during growth stages.",
    },
    {
      id: "recruiters",
      title: "Recruiters & Agencies",
      desc: "Store candidate and client data with enriched profiles.",
      icon: <FaUserTie size={24} />,
      color: "from-indigo-500 to-blue-600",
      details:
        "Manage your entire talent pipeline with enriched candidate profiles. Link candidates to companies and track all interactions in one place.",
    },
    {
      id: "sales-ops",
      title: "Sales Operations",
      desc: "Centralize outreach data and support your sales team.",
      icon: <FaUserGraduate size={24} />,
      color: "from-blue-500 to-cyan-600",
      details:
        "Build CRM workflows that scale. Standardize processes, maintain data quality, and provide actionable insights to your entire organization.",
    },
  ];

  return (
    <section
      id="usecases"
      className={`py-24 ${
        darkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Built for Different Teams
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            } max-w-2xl mx-auto`}
          >
            Whether you're a sales team, recruiter, or founder, UptoSkills adapts to your needs.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, i) => (
            <motion.div
              key={useCase.id}
              variants={scaleInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={i}
              onClick={() => setSelectedModal(useCase)}
              className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                darkMode
                  ? "bg-slate-800 border-slate-700 hover:border-violet-500/30 hover:bg-slate-800/80"
                  : "bg-white border-gray-200 hover:border-violet-300 hover:bg-white"
              } hover:shadow-xl hover:-translate-y-1`}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl mb-4 text-white bg-gradient-to-r ${useCase.color}`}
              >
                {useCase.icon}
              </div>

              {/* Content */}
              <h3
                className={`text-lg font-semibold mb-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {useCase.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {useCase.desc}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-2 text-violet-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <FaArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Pricing Section ----------
function Pricing() {
  const { darkMode, setSelectedModal } = useContext(ThemeContext);

  const plans = [
    {
      id: "free-plan",
      name: "Free",
      price: "₹0",
      desc: "Perfect for getting started with lead management.",
      features: ["Up to 100 leads", "Basic enrichment", "Single user"],
      cta: "Get Started",
      highlighted: false,
      details:
        "Start building your lead database for free. Ideal for individuals, interns, and small teams testing out lead management.",
    },
    {
      id: "pro-plan",
      name: "Professional",
      price: "₹999",
      desc: "Advanced features for growing teams.",
      features: [
        "Unlimited leads",
        "Advanced enrichment",
        "Team access (3 users)",
        "Analytics dashboard",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
      details:
        "Scale your sales with unlimited leads and team collaboration. Includes all data enrichment tools and advanced analytics.",
    },
    {
      id: "enterprise-plan",
      name: "Enterprise",
      price: "Custom",
      desc: "For organizations with advanced requirements.",
      features: [
        "Custom lead limits",
        "Team & role-based access",
        "API access",
        "Dedicated support",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      highlighted: false,
      details:
        "Enterprise-grade solutions with dedicated support, custom integrations, and advanced security features.",
    },
  ];

  return (
    <section
      id="pricing"
      className={`py-24 ${
        darkMode ? "bg-slate-950" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Simple, Transparent Pricing
          </h2>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-400" : "text-gray-600"
            } max-w-2xl mx-auto`}
          >
            Choose the plan that fits your team's needs. No credit card required to start.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              variants={scaleInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              custom={i}
              onClick={() => setSelectedModal(plan)}
              className={`relative cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden group ${
                plan.highlighted
                  ? darkMode
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 border-violet-500/30 hover:border-violet-500/50 shadow-xl"
                    : "bg-gradient-to-br from-white to-gray-50 border-violet-300 hover:border-violet-400 shadow-xl hover:shadow-violet-500/20"
                  : darkMode
                  ? "bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600"></div>
              )}

              {/* Content */}
              <div className="p-8">
                {plan.highlighted && (
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold rounded-full mb-4">
                    MOST POPULAR
                  </div>
                )}

                <h3
                  className={`text-2xl font-bold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.name}
                </h3>

                <p
                  className={`text-sm mb-6 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {plan.desc}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span
                    className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600`}
                  >
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {" "}/month
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold mb-6 transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/30 hover:scale-105"
                      : darkMode
                      ? "border border-slate-600 text-white hover:border-violet-500/50"
                      : "border border-gray-300 text-gray-900 hover:border-violet-300"
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-3 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span className="text-violet-500 font-bold mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-violet-500/5 to-purple-500/5 pointer-events-none"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- CTA Section ----------
function CTA() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <section
      className={`py-20 ${
        darkMode
          ? "bg-gradient-to-r from-slate-900 to-slate-950"
          : "bg-gradient-to-r from-violet-50 to-purple-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`text-4xl md:text-5xl font-bold mb-6 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Ready to Transform Your Lead Generation?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`text-lg mb-8 ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Join hundreds of sales teams and founders already using UptoSkills to
          build their ideal customer lists.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/signup"
            className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105"
          >
            Start for Free
          </Link>
          <button
            className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 border ${
              darkMode
                ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                : "border-violet-300 bg-white hover:bg-violet-50 text-gray-900"
            }`}
          ><Link to="/login">
            Schedule Demo
          </Link>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- Modal Manager ----------
function ModalManager() {
  const { darkMode, selectedModal, setSelectedModal } = useContext(ThemeContext);

  return (
    <AnimatePresence>
      {selectedModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedModal(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl rounded-2xl p-8 relative ${
              darkMode ? "bg-slate-900 border border-slate-800" : "bg-white border border-gray-200"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedModal(null)}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                darkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              <FaTimes size={20} />
            </button>

            {/* Content */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Icon/Badge */}
              {selectedModal.icon && (
                <div
                  className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-xl text-white text-2xl bg-gradient-to-r ${
                    selectedModal.color
                  }`}
                >
                  {selectedModal.icon}
                </div>
              )}

              {/* Text */}
              <div className="flex-1">
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {selectedModal.title}
                </h3>

                <p
                  className={`leading-relaxed mb-6 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {selectedModal.details}
                </p>

                {/* CTA */}
                <Link
                  to="/signup"
                  onClick={() => setSelectedModal(null)}
                  className="inline-block px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30 hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- ChatBot Button ----------
function ChatBotButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-700 transition-all duration-200"
      aria-label="Open Chatbot"
    >
      <FaComments size={24} />
      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white animate-pulse"></span>
    </motion.button>
  );
}

// ---------- Footer ----------
function Footer() {
  const { darkMode } = useContext(ThemeContext);

  const footerLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  const socialLinks = [
    { icon: <FaTwitter size={18} />, label: "Twitter" },
    { icon: <FaLinkedin size={18} />, label: "LinkedIn" },
    { icon: <FaFacebook size={18} />, label: "Facebook" },
  ];

  return (
    <footer
      className={`border-t ${
        darkMode
          ? "bg-slate-950 border-slate-800"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <img src={logoMainImg} alt="UptoSkills" className="h-8 w-auto mb-4" />
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Generate leads and grow your business with verified data.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4
              className={`font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Product
            </h4>
            <ul className="space-y-3">
              {["Features", "Pricing", "Security", "Roadmap"].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4
              className={`font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Company
            </h4>
            <ul className="space-y-3">
              {["About", "Blog", "Careers", "Contact"].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4
              className={`font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Legal
            </h4>
            <ul className="space-y-3">
              {["Privacy", "Terms", "Data Policy", "Compliance"].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className={`text-sm transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          className={`h-px mb-8 ${
            darkMode ? "bg-slate-800" : "bg-gray-200"
          }`}
        ></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            © {new Date().getFullYear()} UptoSkills. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            {socialLinks.map((social, i) => (
              <a
                key={i}
                href="#"
                aria-label={social.label}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? "bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700"
                    : "bg-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-300"
                }`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
