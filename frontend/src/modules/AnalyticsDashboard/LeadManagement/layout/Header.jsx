import { Bell, Settings } from "lucide-react";
import React from "react";
import MainLayout from "./MainLayout";

const Header = () => {
  return (
    <div>
      <header className="sticky top-0 z-5 bg-white shadow-sm h-16 flex items-center justify-end px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700">
            <Settings size={20} />
          </button>
          <button className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src="https://placehold.co/40x40/60A5FA/FFF?text=D"
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="hidden sm:block font-medium text-gray-700">
              Devansh sharma
            </span>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
