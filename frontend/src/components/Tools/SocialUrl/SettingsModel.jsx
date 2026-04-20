import React from "react";
import { Settings, Bell, Moon, User, X } from "lucide-react";

const SettingsModel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
            <Settings className="text-teal-500" /> Settings
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Bell size={20} /></div>
              <div>
                <p className="font-medium text-gray-700">Notifications</p>
                <p className="text-xs text-gray-500">Receive email updates</p>
              </div>
            </div>
            <div className="w-11 h-6 bg-teal-500 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-500"><Moon size={20} /></div>
              <div>
                <p className="font-medium text-gray-700">Dark Mode</p>
                <p className="text-xs text-gray-500">Switch to dark theme</p>
              </div>
            </div>
            <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg text-green-500"><User size={20} /></div>
              <div>
                <p className="font-medium text-gray-700">Account</p>
                <p className="text-xs text-gray-500">Manage profile details</p>
              </div>
            </div>
            <button className="text-sm text-teal-600 font-medium hover:underline">Edit</button>
          </div>
        </div>
        <div className="p-4 bg-gray-50 text-right">
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export default SettingsModel;