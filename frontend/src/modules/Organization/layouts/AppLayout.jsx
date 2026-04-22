import React from 'react';
import { Settings, Bell, Briefcase, Users, Database, Mail, Globe, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- LOGO Component ---
const UptoSkillsLogo = () => (
    <div className="flex items-center space-x-1 p-4">
        <span className="text-xl font-extrabold text-[#00c6b6]">UPTO</span>
        <span className="text-xl font-extrabold text-gray-800">SKILLS</span>
    </div>
);

// --- SIDEBAR Component (The main Navigation) ---
const Sidebar = ({ activeItem }) => {
    const NavItem = ({ icon: Icon, label, path }) => (
        <Link 
            to={path} 
            className={`flex items-center p-3 text-sm font-medium rounded-r-full transition duration-150 ${
                path === activeItem 
                    ? 'bg-[#00c6b6] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
        >
            <Icon size={18} className="mr-3" />
            <span>{label}</span>
        </Link>
    );

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full fixed top-0 left-0 z-20 shadow-xl">
            <UptoSkillsLogo />
            <div className="p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">All tools</p>
                <NavItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" />
                <NavItem icon={Briefcase} label="Organizations" path="/organizations" />
                <NavItem icon={Users} label="Leads" path="/leads" />
                <NavItem icon={Database} label="Database Search" path="/database-search" />
                <NavItem icon={Mail} label="Email Search" path="/email-search" />
                <NavItem icon={Globe} label="Domain Search" path="/domain-search" />
            </div>
            
            {/* User Profile Footer */}
            <div className="mt-auto p-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-700">
                    <img src="https://placehold.co/32x32/00c6b6/white?text=EC" alt="User" className="rounded-full mr-3" />
                    Eliza Chris
                    <ChevronDown size={16} />
                </div>
            </div>
        </div>
    );
};

// --- HEADER Component (The top bar) ---
const Header = () => (
    <header className="flex justify-end items-center h-16 bg-white border-b border-gray-200 px-6 shadow-sm">
        <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-[#00c6b6] transition p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} />
            </button>
            <button className="text-gray-500 hover:text-[#00c6b6] transition p-2 rounded-full hover:bg-gray-100">
                <Settings size={20} />
            </button>
        </div>
    </header>
);

/**
 * The main application layout wrapper.
 * Provides the fixed sidebar and header for all main pages.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content of the current page.
 * @param {string} props.activePath - The current route path for sidebar highlighting.
 */
const AppLayout = ({ children, activePath = '/' }) => {
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar activeItem={activePath} />
            <div className="ml-64 w-full flex flex-col">
                <Header /> 
                <main className="flex-grow p-8">{children}</main>
            </div>
        </div>
    );
};

export default AppLayout;