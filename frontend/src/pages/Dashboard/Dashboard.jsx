import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import Header from "../../components/layout/Header";
import MainLayout from "../../components/layout/MainLayout";
import React, { useState } from "react";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50 font-inter transition-colors duration-300 dark:bg-gray-950">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex h-screen flex-1 flex-col bg-gray-50 transition-colors duration-300 dark:bg-gray-950">
        <Header />
        <MainLayout />
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-5 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
