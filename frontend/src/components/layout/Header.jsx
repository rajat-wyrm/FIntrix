import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import ThemeToggle from "@/context/ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const [hasNotification, setHasNotification] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const seen = localStorage.getItem("notificationsSeen");
    if (seen === "true") {
      setHasNotification(false);
    }
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleNotificationClick = () => {
    localStorage.setItem("notificationsSeen", "true");
    setHasNotification(false);
    navigate("/notifications");
  };

  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-4 shadow-sm backdrop-blur transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/95 dark:shadow-black/20 md:px-8">
      
        <img
          src="/UptoSkillsLogo.webp"
          alt="UptoSkills Logo"
          className="h-11 w-auto object-contain"
        />
      

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors duration-300 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleNotificationClick}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors duration-300 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {hasNotification && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
        </button>

        <Link
          to="/Maindashboard"
          className="hidden items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-2 py-1.5 shadow-sm transition-colors duration-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-800 sm:flex"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
            {userInitial}
          </div>
          <div className="pr-2 text-left">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Signed in as
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {userName}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
