import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 transition-colors duration-300 dark:bg-gray-950">

      {/* Header - full width */}
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Below header */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 transition-colors duration-300 dark:bg-gray-950">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
