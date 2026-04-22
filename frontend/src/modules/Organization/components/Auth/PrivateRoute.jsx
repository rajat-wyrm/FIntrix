import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A wrapper component that checks for a valid user session (JWT token).
 * If authenticated, it renders the requested page (Outlet).
 * If not authenticated, it redirects the user to the Login page.
 */
const PrivateRoute = () => {
    // 🚨 IMPORTANT: You must implement the logic to check for the JWT token 
    // in local storage or your Redux store (Phase 2 requirement).
    
    // MOCK IMPLEMENTATION (Replace with actual logic later):
    // Checks if a 'user' item exists in localStorage (where the JWT is stored [cite: 50])
    const isAuthenticated = localStorage.getItem('user') ? true : false; 
    
    if (!isAuthenticated) {
        // Redirects user to the login page
        return <Navigate to="/login" replace />;
    }

    // Renders the child route component (e.g., <OrganizationsList />)
    return <Outlet />;
};

export default PrivateRoute;