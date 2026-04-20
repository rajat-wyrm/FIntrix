import React from "react";

const ChatWidget = () => {
  return (
    // Outer Container (The Button)
    // - Fixed position bottom-right
    // - Standard sizes: w-12 (48px) on mobile, w-14 (56px) on desktop
    <div
      className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50
                 w-12 h-12 md:w-14 md:h-14
                 rounded-full bg-[#00d6d6] shadow-xl shadow-cyan-500/30
                 flex items-center justify-center overflow-hidden
                 cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-2xl"
    >

      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0fa9af 1px, transparent 1px), linear-gradient(to bottom, #0fa9af 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      />

      {/* The Robot Character 
          - We use a fixed small scale here so it fits inside the small button.
          - No need for complex media queries on the robot parts, just center it.
      */}
      <div className="relative flex flex-col items-center justify-center translate-y-[2px]">

        {/* Antenna */}
        <div className="flex flex-col items-center -mb-[2px]">
          <div className="w-[2px] h-2 bg-[#7bb9c9]" />
          <div className="w-1.5 h-1.5 bg-[#7bb9c9] rounded-full shadow-sm animate-pulse" />
        </div>

        {/* Head/Screen */}
        <div className="relative w-8 h-5 bg-[#7bb9c9] rounded-[0.6rem] flex items-center justify-center shadow-sm z-10">
          <div className="w-[85%] h-[75%] bg-[#111827] rounded-[0.4rem] flex items-center justify-center gap-1">
            {/* Eyes */}
            <div className="w-1.5 h-1.5 bg-[#8af0ff] rounded-full shadow-[0_0_4px_1px_#8af0ff]" />
            <div className="w-1.5 h-1.5 bg-[#8af0ff] rounded-full shadow-[0_0_4px_1px_#8af0ff]" />
          </div>
        </div>

        {/* Neck Shadow */}
        <div className="w-5 h-1 bg-[#546370] rounded-full opacity-50 -mt-[1px]" />

        {/* Body (Top half visible) */}
        <div className="w-6 h-4 bg-[#7bb9c9] rounded-t-lg -mt-[1px] shadow-sm relative">
          {/* Arms/Details */}
          <div className="absolute top-1 left-[-2px] w-1 h-2 bg-[#7bb9c9] rounded-l-md"></div>
          <div className="absolute top-1 right-[-2px] w-1 h-2 bg-[#7bb9c9] rounded-r-md"></div>
        </div>

      </div>
    </div>
  );
};

export default ChatWidget;