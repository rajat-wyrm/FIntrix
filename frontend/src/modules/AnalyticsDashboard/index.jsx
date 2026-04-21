import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import PublicDashboard from "./pages/PublicDashboard";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
//import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

export default function AnalyticsDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        
        {/* Child routes only (parent BrowserRouter lives in AppRouter.jsx) */}
        <Routes>
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster />

        {/* Floating Chatbot */}
        {/* <ChatBot /> */}
      </TooltipProvider>
    </QueryClientProvider>
  );
}


