import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Database,
  Globe,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  Settings,
  Users,
  Building2,
} from "lucide-react";
import "./sidebar.css";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/Maindashboard" },
  { name: "Insights", icon: Users, path: "/insights" },
  { name: "Leads", icon: Users, path: "/leads" },
  { name: "Organization", icon: Building2, path: "/organizations" },
  { name: "Email Search", icon: Mail, path: "/tools/email" },
  { name: "Domain Search", icon: Globe, path: "/tools/domain" },
  { name: "Database Search", icon: Database, path: "/tools/database" },
  { name: "Social URL Search", icon: Link2, path: "/tools/url" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`sidebar-scroll hidden h-full shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-100/95 px-3 py-4 shadow-xl transition-all duration-300 dark:border-gray-700 dark:bg-gray-800/95 dark:shadow-black/30 md:flex md:flex-col ${
        isExpanded ? "w-72" : "w-24"
      }`}
    >
        <Link to="Maindashboard">
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm transition-colors duration-300 dark:bg-gray-900">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-lg font-bold text-white shadow-lg shadow-teal-500/30">
          U
        </div>
        {isExpanded && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              UptoSkills
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Lead intelligence suite
            </p>
          </div>
        )}
      </div>
        </Link>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => navigate(item.path)}
              className={`group relative flex w-full items-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                isExpanded ? "justify-start" : "justify-center"
              } ${
                isActive
                  ? "bg-teal-50 text-teal-700 shadow-sm dark:bg-teal-500/10 dark:text-teal-300"
                  : "text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
              }`}
              aria-current={isActive ? "page" : undefined}
              title={isExpanded ? undefined : item.name}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isExpanded ? "mr-3" : ""}`} />
              {isExpanded && <span className="truncate">{item.name}</span>}
              {isActive && isExpanded && (
                <span className="ml-auto h-2.5 w-2.5 rounded-full bg-teal-500 dark:bg-teal-400" />
              )}
            </button>
          );
        })}
      </nav>
        <Link to="Maindashboard">
      <div className="mt-6 border-t border-gray-200 pt-4 transition-colors duration-300 dark:border-gray-700">
        <div
          className={`mb-3 flex items-center rounded-2xl bg-white px-3 py-3 shadow-sm transition-colors duration-300 dark:bg-gray-900 ${
            isExpanded ? "justify-start" : "justify-center"
            }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
            {userInitial}
          </div>
          {isExpanded && (
            <div className="ml-3 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Active workspace
              </p>
            </div>
          )}
        </div>

        
      </div>
            </Link>
    </aside>
  );
};

export default Sidebar;
