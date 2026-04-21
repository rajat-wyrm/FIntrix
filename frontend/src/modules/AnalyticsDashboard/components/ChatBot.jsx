import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import useChatAgent from "../hooks/useChatAgent";

const ChatBot = ({ searchData, conversionData, sourceData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! I'm your UptoSkills assistant. How can I help you with your analytics and search tools today?" }
  ]);
  const [input, setInput] = useState("");
  const { askAgent, loading } = useChatAgent(searchData, conversionData, sourceData);

  // --- Suggested Questions ---
  const suggestions = [
    "Check performance",
    "Analyze risks",
    "Lead sources?"
  ];

  const handleSuggestion = (text) => {
    setInput(text);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userQuery = input.toLowerCase().trim();
    const originalInput = input;
    setInput(""); 

    setMessages(prev => [...prev, { role: "user", content: originalInput }]);

    let demoResponse = null;
    if (userQuery.includes("performance") || userQuery.includes("stats")) {
      demoResponse = "Analyzing search data... Our conversion rate is holding steady at 4.2%, with a significant spike in organic search traffic this morning.";
    } else if (userQuery.includes("risk") || userQuery.includes("issue")) {
      demoResponse = "I've identified a potential bottleneck in the 'Source' distribution. We are overly reliant on Direct traffic; I recommend diversifying our lead sources.";
    } else if (userQuery.includes("hi") || userQuery.includes("hello")) {
      demoResponse = "Hello! I'm your UptoSkills data assistant. I can help you analyze the search, conversion, and source data on this dashboard.";
    }

    if (demoResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "bot", content: demoResponse }]);
      }, 600);
    } else {
      try {
        const agentResponse = await askAgent(originalInput);
        setMessages(prev => [...prev, agentResponse]);
      } catch (err) {
        setMessages(prev => [...prev, { role: "bot", content: "I'm processing the live data. Please try that query again in a moment." }]);
      }
    }
  };

  return (
    <>
      {/* Floating Button - Back to Original */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl bg-[#00b5ad] hover:bg-[#00a39c] z-[100] transition-all duration-300 flex items-center justify-center p-0 overflow-hidden border-2 border-white"
        size="icon"
      >
        {isOpen ? (
          <X className="h-8 w-8 text-white" />
        ) : (
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
            alt="AI" 
            className="h-full w-full object-cover p-2 invert brightness-0" 
          />
        )}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-28 right-8 w-[600px] h-[800px] max-h-[85vh] max-w-[95vw] shadow-2xl z-[100] flex flex-col border-none overflow-hidden animate-in fade-in zoom-in duration-300 rounded-3xl">
          
          {/* Header - Back to Original */}
          <div className="bg-[#00b5ad] text-white p-6 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
                  alt="Logo" 
                  className="h-10 w-10 invert brightness-0" 
                />
              </div>
              <div>
                <h3 className="font-bold text-2xl tracking-tight">UptoSkills Assistant</h3>
                <p className="text-sm text-teal-50 font-medium opacity-90">AI-Powered Lead Analytics</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-2 rounded-full transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Message Area - Back to Original */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}>
                {msg.role === "bot" && (
                  <div className="h-10 w-10 rounded-full bg-[#00b5ad] flex items-center justify-center mr-3 mt-auto shrink-0 shadow-sm">
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
                      className="h-6 w-6 invert brightness-0" 
                      alt="Bot" 
                    />
                  </div>
                )}
                <div className={`
                  p-5 rounded-2xl text-[17px] shadow-sm leading-relaxed max-w-[80%]
                  ${msg.role === "user" 
                    ? "bg-[#00b5ad] text-white rounded-br-none" 
                    : "bg-[#e0f2f1] text-[#004d40] rounded-bl-none font-medium border border-teal-100"
                  }
                `}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions - Help for the user */}
          <div className="px-6 py-3 bg-white border-t border-slate-50 flex gap-2 overflow-x-auto no-scrollbar">
            {suggestions.map((text, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(text)}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-[#00b5ad]/30 text-[#00b5ad] text-sm font-bold hover:bg-[#e0f2f1] transition-colors bg-[#f0f9f9]"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Input Area - Back to Original */}
          <div className="p-6 bg-white border-t border-gray-100 flex gap-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
            <input 
              className="flex-1 bg-gray-50 rounded-2xl px-6 py-4 text-lg outline-none border border-gray-200 focus:ring-2 focus:ring-[#00b5ad]/30 transition-all"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button 
              onClick={sendMessage} 
              className="rounded-2xl px-10 bg-[#00b5ad] hover:bg-[#00a39c] font-bold text-lg h-[60px] shadow-lg"
            >
              Send
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;