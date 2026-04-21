import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";

const AppLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 font-inter">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header />
                {/* The Outlet will render the matched child route's component (e.g., MainLayout or Leads) */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
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

export default AppLayout;