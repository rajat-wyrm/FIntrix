import React from "react";

import {
  LayoutDashboard,
  Mail,
  Globe,
  Database,
  Link2,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  Users,
  X,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import authService from "../services/authentication.js";
import NavItem from "../services/NavItem.jsx";

// --- Sidebar Component ---
const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Leads", icon: Users, path: "/leads" },
    { name: "Email Search", icon: Mail, path: "/email" },
    { name: "Domain Search", icon: Globe, path: "/domain" },
    { name: "Database Search", icon: Database, path: "/database" },
    { name: "Social URL Search", icon: Link2, path: "/url" },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <>
      <div className="md:flex">
        {/* Mobile Sidebar Toggle Button */}
        <button
          className={`
           md:hidden fixed top-4 z-20 p-2 bg-white text-gray-800 rounded-md
           transition-all duration-300
           ${isSidebarOpen ? "left-[200px]" : "left-4"}
  `}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Toggle Button when closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-20 p-2 bg-white text-gray-800 rounded-md hidden md:block"
          >
            <ChevronsRight size={20} />
          </button>
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed
            inset-y-0 left-0 z-10
            flex flex-col
            bg-white text-gray-800
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            ${isSidebarOpen ? "w-64" : "w-0 md:w-20"}
          `}
        >
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200">
            <img
              src="\uptoskillLogo.png" // <-- Change to your actual image name
              alt="UPTOSKILLS Logo"
              className={`
                w-[276.71px] h-[51.27px] transition-opacity duration-300
                ${isSidebarOpen ? "opacity-100" : "opacity-0"}
                ${!isSidebarOpen && "hidden"}
              `}
            />
            {/* Desktop Toggle Button when open */}
            {isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="hidden md:block p-1 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <ChevronsLeft size={20} />
              </button>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-4 mt-4">
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name || 'G'}&background=0D9488&color=fff&size=40`}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div
              className={`
                transition-opacity duration-300
                ${isSidebarOpen ? "opacity-100" : "opacity-0"}
                ${!isSidebarOpen && "hidden"}
              `}
            >
              <span className="block font-semibold text-sm text-gray-700">
                {user?.name || 'Guest User'}
              </span>
              <span className="block text-xs text-gray-700">
                {user?.email || 'No email'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={location.pathname === item.path}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-2 border-t border-gray-200">
            <a
              href="#"
              className={`
                flex items-center p-3 rounded-lg
                text-sm font-medium text-gray-800
                hover:bg-gray-700 hover:text-white
                ${isSidebarOpen ? "justify-start" : "justify-center"}
              `}
            >
              <Settings
                size={20}
                className={`
              shrink-0
              ${isSidebarOpen ? "mr-3" : "hidden md:block"}
    `}
              />
              <span
                className={`
                  transition-opacity duration-300
                  ${isSidebarOpen ? "opacity-100" : "opacity-0"}
                  ${!isSidebarOpen && "hidden"}
                `}
              >
                Settings
              </span>
            </a>
            <button
              onClick={handleLogout}
              className={`
              flex items-center p-3 rounded-lg
              text-sm font-medium text-gray-800
              hover:bg-gray-100 hover:text-gray-900
              ${isSidebarOpen ? "justify-start" : "justify-center"}

            `}
            >
              <LogOut
                size={20}
                className={`shrink-0 ${isSidebarOpen ? "mr-3" : "hidden md:block"
                  }`}
              />

              <span
                className={`
                  transition-opacity duration-300
                  ${isSidebarOpen ? "opacity-100" : "opacity-0"}
                  ${!isSidebarOpen && "hidden"}
                `}
              >
                Logout
              </span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
