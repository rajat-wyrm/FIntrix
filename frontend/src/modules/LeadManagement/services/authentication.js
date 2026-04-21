import { api } from './api.js';

export const authService = {
    async login(email, password) {
        const response = await fetch(`${api.baseURL}/api/users/login`, {
            method: 'POST',
            headers: api.headers,
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        if (data.success && data.token) {
            localStorage.setItem('token', data.token);
        }
        return data;
    },

    async register(userData) {
        const response = await fetch(`${api.baseURL}/api/users/register`, {
            method: 'POST',
            headers: api.headers,
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        return data;
    },

    async getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch(`${api.baseURL}/api/users/me`, {
            headers: {
                ...api.headers,
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.success ? data.user : null;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },
};

export default authService;
