import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavItem = ({ item, isActive, isSidebarOpen, setIsSidebarOpen }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(item.path);

        // Close sidebar on mobile after navigation
        if (window.innerWidth < 768) { // 768px is the 'md' breakpoint in Tailwind
            setIsSidebarOpen(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`
                w-full flex items-center p-3 rounded-lg
                text-sm font-medium
                transition-colors duration-200
                ${isActive
                    ? "bg-[#04BDA5]/9 text-[#01BDA8] shadow-md"
                    : "text-[#475569] hover:bg-[#04BDA5]/9 hover:text-black hover:shadow-md"
                }
                ${isSidebarOpen ? "justify-start" : "justify-center"}
            `}
        >
            <item.icon size={20} className={`shrink-0 ${isSidebarOpen ? "mr-3" : "mr-0"}`} />
            <span
                className={`
                    transition-opacity duration-300
                    ${isSidebarOpen ? "opacity-100" : "opacity-0"}
                    ${!isSidebarOpen && "hidden"}
                `}
            >
                {item.name}
            </span>
        </button>
    );
};

export default NavItem;
