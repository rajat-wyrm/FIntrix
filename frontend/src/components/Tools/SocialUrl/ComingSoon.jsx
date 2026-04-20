import React from "react";
import { Bot } from "lucide-react";

const ComingSoon = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in-95 duration-300 min-h-[50vh]">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Bot size={40} className="text-teal-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
        <p className="text-gray-500 max-w-md">This tool is currently under maintenance. Please try the <span className="font-bold text-teal-600">Social URL Search</span> for now.</p>
    </div>
);
export default ComingSoon;