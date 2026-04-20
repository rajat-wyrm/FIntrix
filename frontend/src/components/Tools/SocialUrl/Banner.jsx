import React from "react";
import { PlayCircle, BookOpen } from "lucide-react";

const Banner = () => (
  <div className="bg-[#2DD4BF] text-white py-4 px-4 md:px-6 flex flex-col md:flex-row justify-center items-center gap-3 md:gap-4 text-center shadow-sm">
    <span className="font-semibold text-sm md:text-base leading-tight">
      Learn how to collect targeted leads from any domain
    </span>
    <div className="flex items-center gap-3">
      <button 
        onClick={() => window.open('https://youtu.be/ynSz8u0eqNc?si=ueJet6ZJM0Az9hPG', '_blank')}
        className="bg-white text-teal-500 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 hover:bg-teal-50 hover:scale-105 transition-all shadow-sm active:scale-95 whitespace-nowrap"
      >
        <PlayCircle size={14} />
        Watch tutorial
      </button>
      <button 
        onClick={() =>window.open('https://uptoskills.com/')}
        className="bg-white text-teal-500 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 hover:bg-teal-50 hover:scale-105 transition-all shadow-sm active:scale-95 whitespace-nowrap"
      >
        <BookOpen size={14} />
        Read Guide
      </button>
    </div>
  </div>
);
export default Banner;