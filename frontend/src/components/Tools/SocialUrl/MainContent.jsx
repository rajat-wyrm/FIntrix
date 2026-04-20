import React, { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import Header from "./Header";
import Banner from "./Banner";
import SearchTool from "./SearchTool";
import ComingSoon from "./ComingSoon";
import ChatWidget from "./ChatWidget";

const MainContent = ({ activeItem, onSettingsClick, onMenuClick }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-white relative w-full">
      <Header onSettingsClick={onSettingsClick} onMenuClick={onMenuClick} />
      <Banner />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 min-h-[calc(100vh-180px)]">
        {activeItem === 'Social URL Search' ? <SearchTool /> : <ComingSoon title={activeItem} />}
      </div>

      {/* FAB */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

    </div>
  );
};
export default MainContent;