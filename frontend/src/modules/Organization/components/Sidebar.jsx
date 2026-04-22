import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Database, 
  Globe, 
  Building 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Fintrix</h1>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/dashboard') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/email-search"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/email-search') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Email Search</span>
          </Link>

          <Link
            to="/domain-search"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/domain-search') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span>Domain Search</span>
          </Link>

          <Link
            to="/database-search"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/database-search') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            <Database className="w-5 h-5" />
            <span>Database Search</span>
          </Link>

          <Link
            to="/organizations"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/organizations') 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            <Building className="w-5 h-5" />
            <span>Organizations</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;