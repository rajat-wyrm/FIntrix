import React, { useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminMainLayout from "../../components/admin/AdminMainLayout";

const AdminDashboard = ({ onLogout, userEmail }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50 font-inter overflow-hidden">
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={onLogout}
        userEmail={userEmail}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50">
        <AdminHeader />
        <AdminMainLayout />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-0 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;