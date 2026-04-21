import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import DomainSearch from "../../components/Tools/Domain/DomainSearch.jsx";
import EmailSearch from "../../components/Tools/Email/EmailSearch.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import URLSearch from "./pages/URLSearch.jsx";
import Database from "./pages/Database.jsx";
import Leads from "./pages/Leads.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import AppLayout from "./services/AppLayout.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";

export default function LeadModule() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<MainLayout />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/database" element={<Database />} />
              <Route path="/domain" element={<DomainSearch />} />
              <Route path="/email" element={<EmailSearch />} />
              <Route path="/url" element={<URLSearch />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
