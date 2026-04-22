import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const Header = () => {
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    // Dynamically get the logged-in user from localStorage
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (savedUser && savedUser.name) {
      setUserName(savedUser.name);
    }
  }, []);

  // Get the first letter for the profile icon
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome, <span className="text-teal-600">{userName}</span>
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-teal-600 transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">{userName}</span>
            <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {initial}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;