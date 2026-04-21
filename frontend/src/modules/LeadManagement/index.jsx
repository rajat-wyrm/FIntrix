import React from "react";
import { Routes, Route } from "react-router-dom";

import Leads from "./pages/Leads.jsx";
import Database from "./pages/Database.jsx";
import EmailSearch from "../../components/Tools/Email/EmailSearch.jsx";
import DomainSearch from "../../components/Tools/Domain/DomainSearch.jsx";
import URLSearch from "../../components/Tools/SocialUrl/SocialUrlSearch.jsx";

import AppLayout from "./services/AppLayout.jsx";
import { AuthProvider } from "./layouts/AuthContext.jsx";

const LeadModule = () => {
  return (
    <AuthProvider>
      <Routes>

        {/* ✅ ALL PAGES INSIDE AppLayout */}
        <Route path="/" element={<AppLayout />}>

          {/* Dashboard/Leads Default */}
          <Route index element={<Leads />} />

          {/* Other pages */}
          <Route path="leads" element={<Leads />} />
          <Route path="database" element={<Database />} />
          <Route path="email" element={<EmailSearch />} />
          <Route path="domain" element={<DomainSearch />} />
          <Route path="url" element={<URLSearch />} />

        </Route>

      </Routes>
    </AuthProvider>
  );
};

export default LeadModule;
