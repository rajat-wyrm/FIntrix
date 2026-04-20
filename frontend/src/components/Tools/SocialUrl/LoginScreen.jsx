import React from "react";
import { Mail, Lock, LogIn } from "lucide-react";

const LoginScreen = ({ onLogin }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-center mb-8">
        <div className="text-orange-500 font-bold text-3xl tracking-tighter flex items-center">
          Up<span className="text-teal-400">to</span>SKILLS
        </div>
      </div>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Please sign in to continue</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="email" 
                defaultValue="elizachris@gmail.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="password" 
                defaultValue="password123"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>
          <button 
            onClick={onLogin}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            Sign In
          </button>
        </div>
        <div className="text-center text-sm text-gray-400">
          <p>Demo Mode: Click Sign In to continue</p>
        </div>
      </div>
    </div>
  </div>
);

export default LoginScreen;