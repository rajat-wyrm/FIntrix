import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authentication.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // --- For Development: Bypass login and go straight to dashboard ---
    // We are setting a mock user and disabling the loading state.
    // To re-enable login, uncomment the useEffect block and the original useState lines.
    const [user, setUser] = useState({
        name: 'Devansh Sharma',
        email: 'devansh@example.com',
        id: 'dev_user'
    });
    const [loading, setLoading] = useState(false);
    // useEffect(() => { ... }); // Real authentication check is disabled.

    const value = { user, setUser, loading };

    // Render a loading state or null while checking auth to prevent flicker
    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>; // Or a loading spinner
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);