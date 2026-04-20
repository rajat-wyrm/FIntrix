import React from "react";
import { Plus } from "lucide-react";

const DiagramSection = () => (
  <div className="relative w-full max-w-xs md:max-w-md mx-auto py-8 select-none transition-all hover:scale-105 duration-500">
    <div className="relative z-10 bg-gray-400/80 backdrop-blur-sm rounded-lg p-3 text-white shadow-lg w-full transform -rotate-1 mb-8 opacity-90">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            className="w-10 h-10 rounded-full grayscale opacity-80"
            alt="User"
          />
          <div>
            <div className="h-2 w-24 bg-white/30 rounded mb-1"></div>
            <div className="h-1.5 w-16 bg-white/20 rounded"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-12 bg-white/20 rounded-full"></div>
          <div className="h-6 w-6 bg-white/20 rounded"></div>
        </div>
      </div>
    </div>

    {/* Result Card Simulation (Orange) */}
    <div className="relative z-20 bg-[#FF8A65] rounded-lg p-4 text-white shadow-xl w-full transform rotate-1 -mt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            className="w-10 h-10 rounded-full border-2 border-white/20"
            alt="User"
          />
          <div>
            <div className="font-bold text-sm">Eliza Chris</div>
            <div className="text-[10px] text-orange-100 opacity-90">CEO - vibescapes</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="bg-white/20 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                eliza...
            </div>
            <div className="bg-white/20 p-1 rounded">
                <Plus size={12} />
            </div>
        </div>
      </div>
    </div>

    {/* Connecting Arrow - Hidden on very small screens to prevent overflow */}
    <svg className="hidden xs:block absolute top-1/2 -right-4 md:-right-8 w-12 h-12 md:w-16 md:h-16 text-orange-400 transform translate-y-[-50%]" viewBox="0 0 100 100" fill="none">
       <path d="M10,10 Q90,10 90,80" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
       <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  </div>
);

export default DiagramSection;