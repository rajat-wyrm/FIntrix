import { motion } from "framer-motion";
import React, { useState } from "react";
import { ArrowRight, BarChart3, Search, Share2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tools = [
  {
    title: "Email Search",
    description:
      "Find verified email addresses for leads by simply entering their name and company.",
    path: "/tools/email",
    buttonText: "Start Searching",
    icon: Search,
    surface:
      "from-blue-50 to-blue-100/70 border-blue-200 dark:from-blue-950/50 dark:to-slate-900 dark:border-blue-900/60",
    accent: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
  },
  {
    title: "Domain Search",
    description:
      "Find employee contacts and email addresses by searching with a company's domain.",
    path: "/tools/domain",
    buttonText: "Search Domain",
    icon: BarChart3,
    surface:
      "from-amber-50 to-amber-100/70 border-amber-200 dark:from-amber-950/40 dark:to-slate-900 dark:border-amber-900/60",
    accent:
      "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700",
  },
  {
    title: "Database Search",
    description:
      "Identify professionals by name, job, role, location, skills, background, and key career details.",
    path: "/tools/database",
    buttonText: "Search Database",
    icon: Zap,
    surface:
      "from-emerald-50 to-emerald-100/70 border-emerald-200 dark:from-emerald-950/40 dark:to-slate-900 dark:border-emerald-900/60",
    accent:
      "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700",
  },
  {
    title: "Social URL Search",
    description:
      "Find social media profiles and contact details using public URLs from platforms like LinkedIn.",
    path: "/tools/url",
    buttonText: "Find Profiles",
    icon: Share2,
    surface:
      "from-violet-50 to-violet-100/70 border-violet-200 dark:from-violet-950/40 dark:to-slate-900 dark:border-violet-900/60",
    accent:
      "bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700",
  },
];

const MainLayout = () => {
  const navigate = useNavigate();

  const [userName] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        return window.localStorage.getItem("userName") || "there";
      }
      return "there";
    } catch {
      return "there";
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <section className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/15"
          />
          <motion.div
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/15"
          />
        </motion.div>

        <div className="relative px-4 py-16 md:px-8 md:py-24">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-6 text-4xl font-semibold leading-tight text-slate-900 dark:text-slate-100 md:text-5xl"
            >
              Welcome back,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-violet-400">
                  {userName}
                </span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-violet-500"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-2xl text-lg text-slate-600 dark:text-slate-300"
            >
              Access our lead generation tools to find verified contacts, build
              targeted lists, and accelerate your sales process.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 md:px-8">
        <div className="max-w-6xl">
          <div className="mb-12">
            <h2 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Choose a search tool
            </h2>
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {tools.map((tool) => {
              const IconComponent = tool.icon;

              return (
                <button
                  key={tool.title}
                  type="button"
                  onClick={() => navigate(tool.path)}
                  className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-7 text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${tool.surface}`}
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/20 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-white/10" />

                  <div className="relative">
                    <div
                      className={`mb-4 inline-flex rounded-xl p-3 text-white shadow-lg transition-colors duration-300 ${tool.accent}`}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>

                    <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {tool.title}
                    </h3>
                    <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {tool.description}
                    </p>

                    <span
                      className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-300 group-hover:translate-x-1 ${tool.accent}`}
                    >
                      {tool.buttonText}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-600 dark:text-slate-300 md:flex-row md:px-8">
          <p>All email addresses are verified and regularly updated.</p>
          <p>
            Need help?{" "}
            <a
              href="#"
              className="font-medium text-blue-600 transition-colors duration-300 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Contact support
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
