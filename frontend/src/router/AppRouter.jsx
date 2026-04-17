import React, { useState, useLayoutEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import ErrorBoundary from "../ErrorBoundary";

// Nested dashboard routes swap content without a full page reload, so we manually restore the expected scroll-to-top behavior.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

import ChatBot from "../components/ChatBot";

// Auth pages
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ResetPassword from "../pages/Auth/ResetPassword";
import AdminLogin from "../pages/Auth/AdminLogin";

// Public landing / gateway
import Landing from "../pages/Landing/LandingPage";
import LoginGateway from "../pages/Landing/LoginGateway";

// Layouts
import DashboardLayout from "../components/layout/DashboardLayout"; // MUST render <Outlet /> inside
import MainLayout from "../components/layout/MainLayout"; // Your user main content (dashboard shell)
import CriticalThinking from "@/pages/Dashboard/CriticalThinking";

// Dashboards
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import Maindashboard from "../components/layout/Maindashboard"

// Tools
import EmailSearch from "../components/Tools/Email/EmailSearch";
import DomainSearch from "../components/Tools/Domain/DomainSearch";
import DatabaseSearch from "../components/Tools/Database/DatabaseSearch";
import URLSearch from "../components/Tools/SocialUrl/SocialUrlSearch";
import Settings1 from "../components/Tools/Settings1/Settings1"
import Notifcations from "../components/Tools/Notifications/Notification"

// Analytics / Leads / Insights
import AnalyticsDashboard from "../modules/AnalyticsDashboard";
import AnalyticsDashboardPage from "../modules/AnalyticsDashboard/pages/Dashboard";
import Leads from "../modules/LeadManagement/pages/Leads";
import InsightDashboard from "../modules/InsightDashboard/Insight";

// Organizations
import {
  OrganizationsList,
  AddOrganization,
  EditOrganization,
  OrganizationDetails,
} from "../modules/Organization";

// ------------------------------
//  AUTH / ROLE HELPERS
// ------------------------------

// These guards read the same lightweight session flags the login page stores in localStorage.
const isLoggedIn = () => localStorage.getItem("isLoggedIn") === "true";

const getUserRole = () => localStorage.getItem("userRole");

// Only INVESTOR (or no role) is treated as normal user
const isInvestorUser = () => {
  const role = getUserRole();
  return role === "INVESTOR" || !role;
};

const isAdminUser = () => getUserRole() === "ADMIN";

// Generic protected wrapper for logged in users
const RequireAuth = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

// Protected routes only for INVESTOR / normal users
const ProtectedUserRoute = ({ children }) => {
  return isLoggedIn() && isInvestorUser()
    ? children
    : <Navigate to="/login" replace />;
};

// Protected routes only for ADMIN
const ProtectedAdminRoute = ({ children }) => {
  return isLoggedIn() && isAdminUser()
    ? children
    : <Navigate to="/admin-login" replace />;
};

// ------------------------------
//  APP ROUTER
// ------------------------------

export default function AppRouter() {
  const [userEmail, setUserEmail] = useState("");

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <Landing />
            </ErrorBoundary>
          }
        />
        <Route
          path="/login-gateway"
          element={
            <ErrorBoundary>
              <LoginGateway />
            </ErrorBoundary>
          }
        />
        <Route
          path="/login"
          element={
            <ErrorBoundary>
              <Login setUserEmail={setUserEmail} />
            </ErrorBoundary>
          }
        />

        <Route
          path="/signup"
          element={
            <ErrorBoundary>
              <Signup />
            </ErrorBoundary>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ErrorBoundary>
              <ResetPassword />
            </ErrorBoundary>
          }
        />

        {/* Admin login (separate) */}
        <Route
          path="/admin-login"
          element={
            <ErrorBoundary>
              <AdminLogin />
            </ErrorBoundary>
          }
        />

        {/* ---------- PROTECTED AREA WITH LAYOUT ---------- */}
        {/* Wrap the shell once so every protected page keeps the same sidebar/header chrome and shared state. */}
        <Route
          element={
            <RequireAuth>
              <ErrorBoundary>
                <DashboardLayout />
              </ErrorBoundary>
            </RequireAuth>
          }
        >
          {/* USER DASHBOARD SHELL (MainLayout shows user dashboard UI, uses userEmail if needed) */}
          {/* <Route
            path="/user-dashboard"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <MainLayout userEmail={userEmail} />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          /> */}

          {/* ADMIN DASHBOARD (no MainLayout if AdminDashboard already has its own layout) */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <AdminDashboard />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            }
          />

          {/* ---------- TOOLS (user only) ---------- */}
          <Route
            path="/tools/email"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <EmailSearch />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/tools/domain"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <DomainSearch />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/tools/database"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <DatabaseSearch />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/tools/url"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <URLSearch />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <Settings1/>
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/criticalThinking"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <CriticalThinking/>
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <Notifcations/>
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          {/* ---------- ANALYTICS / LEADS / INSIGHTS (user only) ---------- */}
          {/* Parent analytics container (if it has its own internal routes, use /analytics/*) */}
          <Route
            path="/analytics"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <AnalyticsDashboard />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          {/* Specific analytics dashboard page */}
          <Route
            path="/analytics/dashboard"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <AnalyticsDashboardPage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/leads"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <Leads />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/Maindashboard"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <Maindashboard />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/insights"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <InsightDashboard />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/insights/reports"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <InsightDashboard />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/insights/trend-analysis"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <InsightDashboard />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/insights/feedback"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <InsightDashboard />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          {/* ---------- ORGANIZATIONS (user only) ---------- */}
          <Route
            path="/organizations"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <OrganizationsList />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/organizations/add"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <AddOrganization />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/organizations/:id"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <OrganizationDetails />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/organizations/:id/edit"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <EditOrganization />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Keep the chatbot mounted outside page routes so conversations survive navigation. */}
      <ChatBot />
    </BrowserRouter>
  );
}
