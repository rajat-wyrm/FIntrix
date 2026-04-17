import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight,
  Search,
  BarChart3,
  Zap,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useTheme } from "../../context/ThemeContext";
// ─── Analytics Card ───────────────────────────────────────────────────────────

const AnalyticsCard = ({ title, value, icon: Icon, trend, color, darkMode }) => {
  
    
      const { theme } = useTheme();
      const dark = theme =="dark";
      console.log("DarkMode : ", darkMode);

    const colorMap = {
    primary: {
      light: { bg: "bg-blue-50", text: "text-blue-600", icon: "bg-blue-100 text-blue-600", trend: "text-blue-500" },
      dark:  { bg: "bg-blue-950/40", text: "text-blue-400", icon: "bg-blue-900/60 text-blue-400", trend: "text-blue-400" },
    },
    success: {
      light: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "bg-emerald-100 text-emerald-600", trend: "text-emerald-500" },
      dark:  { bg: "bg-emerald-950/40", text: "text-emerald-400", icon: "bg-emerald-900/60 text-emerald-400", trend: "text-emerald-400" },
    },
    warning: {
      light: { bg: "bg-amber-50", text: "text-amber-600", icon: "bg-amber-100 text-amber-600", trend: "text-amber-500" },
      dark:  { bg: "bg-amber-950/40", text: "text-amber-400", icon: "bg-amber-900/60 text-amber-400", trend: "text-amber-400" },
    },
    info: {
      light: { bg: "bg-purple-50", text: "text-purple-600", icon: "bg-purple-100 text-purple-600", trend: "text-purple-500" },
      dark:  { bg: "bg-purple-950/40", text: "text-purple-400", icon: "bg-purple-900/60 text-purple-400", trend: "text-purple-400" },
    },
  };

  const palette = darkMode ? colorMap[color].dark : colorMap[color].light;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl p-6 border transition-colors duration-300 ${
        darkMode
          ? `${palette.bg} border-slate-700/50`
          : `${palette.bg} border-transparent`
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          {title}
        </span>
        <div className={`p-2 rounded-xl ${palette.icon}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className={`text-3xl font-semibold mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>
        {value}
      </p>
      <p className={`text-xs font-medium ${palette.trend}`}>{trend}</p>
    </motion.div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────

const MainDashboard = () => {
  const navigate = useNavigate();
      const { theme } = useTheme();
      const darkMode = theme =="dark";
      console.log("DarkMode : ", darkMode);
    

  const [userName] = useState(() => {
    try {
      return typeof window !== "undefined"
        ? window.localStorage.getItem("userName") || "there"
        : "there";
    } catch {
      return "there";
    }
  });

  // ── Tool cards ──
  const tools = [
    {
      title: "Email Search",
      description: "Find verified email addresses for leads by entering their name and company.",
      path: "/tools/email",
      buttonText: "Start Searching",
      icon: Search,
      light: { gradient: "from-blue-50 to-blue-100/40", border: "border-blue-200", accent: "bg-blue-500 hover:bg-blue-600" },
      dark:  { gradient: "from-blue-950/50 to-blue-900/30", border: "border-blue-800/50", accent: "bg-blue-600 hover:bg-blue-500" },
    },
    {
      title: "Domain Search",
      description: "Find employee contacts and email addresses by searching a company's domain.",
      path: "/tools/domain",
      buttonText: "Search Domain",
      icon: BarChart3,
      light: { gradient: "from-amber-50 to-amber-100/40", border: "border-amber-200", accent: "bg-amber-500 hover:bg-amber-600" },
      dark:  { gradient: "from-amber-950/50 to-amber-900/30", border: "border-amber-800/50", accent: "bg-amber-600 hover:bg-amber-500" },
    },
    {
      title: "Database Search",
      description: "Identify professionals by name, role, location, skills, and career background.",
      path: "/tools/database",
      buttonText: "Search Database",
      icon: Zap,
      light: { gradient: "from-emerald-50 to-emerald-100/40", border: "border-emerald-200", accent: "bg-emerald-500 hover:bg-emerald-600" },
      dark:  { gradient: "from-emerald-950/50 to-emerald-900/30", border: "border-emerald-800/50", accent: "bg-emerald-600 hover:bg-emerald-500" },
    },
    {
      title: "Social URL Search",
      description: "Find social profiles and contact details using public URLs from platforms like LinkedIn.",
      path: "/tools/url",
      buttonText: "Find Profiles",
      icon: BarChart3,
      light: { gradient: "from-purple-50 to-purple-100/40", border: "border-purple-200", accent: "bg-purple-500 hover:bg-purple-600" },
      dark:  { gradient: "from-purple-950/50 to-purple-900/30", border: "border-purple-800/50", accent: "bg-purple-600 hover:bg-purple-500" },
    },
  ];

  // ── Chart data ──
  const searchData = [
    { name: "Mon", searches: 142 }, { name: "Tue", searches: 158 },
    { name: "Wed", searches: 173 }, { name: "Thu", searches: 165 },
    { name: "Fri", searches: 189 }, { name: "Sat", searches: 125 },
    { name: "Sun", searches: 98  },
  ];

  const conversionData = [
    { name: "Jan", rate: 28 }, { name: "Feb", rate: 32 },
    { name: "Mar", rate: 35 }, { name: "Apr", rate: 38 },
    { name: "May", rate: 42 }, { name: "Jun", rate: 45 },
  ];

  const sourceData = [
    { name: "Email", value: 400 }, { name: "Domain", value: 300 },
    { name: "Database", value: 200 }, { name: "Social", value: 100 },
  ];

  const CHART_COLORS = darkMode
    ? ["#2dd4bf", "#5eead4", "#99f6e4", "#ccfbf1"]
    : ["#00b5ad", "#2dd4bf", "#5eead4", "#99f6e4"];

  const chartGridColor  = darkMode ? "#1e293b" : "#f1f5f9";
  const chartAxisColor  = darkMode ? "#475569" : "#94a3b8";
  const chartBarColor   = darkMode ? "#2dd4bf" : "#00b5ad";
  const chartLineColor  = darkMode ? "#2dd4bf" : "#00b5ad";
  const tooltipBg       = darkMode ? "#1e293b" : "#ffffff";
  const tooltipBorder   = darkMode ? "#334155" : "#e2e8f0";
  const tooltipText     = darkMode ? "#e2e8f0" : "#0f172a";

  const tooltipStyle = {
    borderRadius: "12px",
    border: `1px solid ${tooltipBorder}`,
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    padding: "10px 14px",
    background: tooltipBg,
    color: tooltipText,
    fontSize: "13px",
  };

  // ── Shared style tokens ──
  const bg   = darkMode ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-100";
  const card = darkMode ? "bg-slate-900 border-slate-800"  : "bg-white border-slate-100";
  const headingPrimary = darkMode ? "text-white"      : "text-slate-900";
  const headingMuted   = darkMode ? "text-slate-400"  : "text-slate-500";
  const bodyText       = darkMode ? "text-slate-300"  : "text-slate-600";
  const divider        = darkMode ? "border-slate-800" : "border-slate-200";
  const pillBg         = darkMode ? "bg-teal-900/50 text-teal-400" : "bg-teal-50 text-teal-700";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}>

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl ${
              darkMode ? "bg-blue-900/20" : "bg-blue-300/20"
            }`}
          />
          <motion.div
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className={`absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl ${
              darkMode ? "bg-purple-900/20" : "bg-purple-300/20"
            }`}
          />
        </motion.div>

        <div className="relative px-6 md:px-10 lg:px-16 py-16 md:py-20">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`text-4xl md:text-5xl font-semibold mb-5 leading-tight ${headingPrimary}`}
            >
              Welcome back,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {userName}
                </span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`text-lg leading-relaxed ${bodyText}`}
            >
              Access our powerful lead generation tools to find verified contacts,
              build targeted lists, and accelerate your sales process.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 lg:px-16 pb-24 space-y-16">

        {/* ── Analytics Cards ── */}
        <section>
          <SectionHeading label="Performance Overview" darkMode={darkMode} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnalyticsCard title="Total Searches"    value="2,547" icon={Activity}   trend="+23% this month" color="primary" darkMode={darkMode} />
            <AnalyticsCard title="Your Leads"        value="1,892" icon={Users}      trend="+31% this month" color="success" darkMode={darkMode} />
            <AnalyticsCard title="Conversion Rate"   value="45%"   icon={TrendingUp} trend="+7% this month"  color="warning" darkMode={darkMode} />
            <AnalyticsCard title="Active Campaigns"  value="18"    icon={BarChart3}  trend="5 new this week" color="info"    darkMode={darkMode} />
          </div>
        </section>

        {/* ── Charts Row ── */}
        <section>
          <SectionHeading label="Activity & Sources" darkMode={darkMode} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Weekly Bar Chart */}
            <div className={`lg:col-span-2 rounded-2xl p-6 md:p-8 border ${card}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-base font-semibold ${headingPrimary}`}>Weekly Activity</h3>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${pillBg}`}>
                  Live Feed
                </span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={searchData} barSize={36}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: darkMode ? "#1e293b" : "#f8fafc" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="searches" fill={chartBarColor} radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className={`rounded-2xl p-6 md:p-8 border ${card}`}>
              <h3 className={`text-base font-semibold mb-6 ${headingPrimary}`}>Lead Sources</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={sourceData} innerRadius={60} outerRadius={90} paddingAngle={6} dataKey="value" stroke="none">
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {sourceData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i] }} />
                      <span className={headingMuted}>{item.name}</span>
                    </div>
                    <span className={`font-medium ${headingPrimary}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Conversion Line Chart ── */}
        <section>
          <div className={`rounded-2xl p-6 md:p-8 border ${card}`}>
            <h3 className={`text-base font-semibold mb-6 ${headingPrimary}`}>Conversion Growth</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={chartLineColor}
                  strokeWidth={3}
                  dot={{ r: 5, fill: chartLineColor, strokeWidth: 3, stroke: darkMode ? "#0f172a" : "#ffffff" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── Search Tools ── */}
        <section>
          <SectionHeading label="Search Tools" darkMode={darkMode} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tools.map((tool) => {
              const palette = darkMode ? tool.dark : tool.light;
              const IconComponent = tool.icon;

              return (
                <motion.div
                  key={tool.title}
                  whileHover={{ scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`group relative bg-gradient-to-br ${palette.gradient} border ${palette.border} rounded-2xl p-7 cursor-pointer overflow-hidden`}
                  onClick={() => navigate(tool.path)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center p-2.5 rounded-xl mb-4 text-white ${palette.accent.split(" ")[0]}`}>
                      <IconComponent size={20} />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${headingPrimary}`}>{tool.title}</h3>
                    <p className={`text-sm leading-relaxed mb-6 ${bodyText}`}>{tool.description}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(tool.path); }}
                      className={`inline-flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 ${palette.accent} shadow-sm hover:shadow-md`}
                    >
                      {tool.buttonText}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <div className={`border-t ${divider} ${darkMode ? "bg-slate-900/60" : "bg-white/60"} backdrop-blur-sm`}>
        <div className={`max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-6 flex flex-col md:flex-row items-center justify-between text-sm ${headingMuted}`}>
          <p>All email addresses are verified and regularly updated.</p>
          <p className="mt-3 md:mt-0">
            Need help?{" "}
            <a href="#" className={`font-medium ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}>
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Section Heading Helper ────────────────────────────────────────────────────

const SectionHeading = ({ label, darkMode }) => (
  <div className="mb-7">
    <h2 className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>{label}</h2>
    <div className="w-10 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
  </div>
);

export default MainDashboard;