import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../layouts/AuthContext.jsx';

const ProtectedRoute = () => {
    const { user } = useAuth();

    // If a user is authenticated, render the nested routes (e.g., Dashboard, Leads).
    // Otherwise, redirect them to the login page.
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;