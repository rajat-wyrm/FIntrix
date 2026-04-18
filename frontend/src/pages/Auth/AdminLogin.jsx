import React, { useState } from "react";
import { Loader2, UserCheck, XCircle, Lock, Building, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "Password must be at least 8 characters.";
    if (!hasUpperCase) return "Must contain an uppercase letter.";
    if (!hasLowerCase) return "Must contain a lowercase letter.";
    if (!hasNumbers) return "Must contain a number.";
    if (!hasSpecialChar) return "Must contain a special character.";

    return null;
  };

  const handleSubmit = async (e) => { // 🚀 Changed to async
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      // 📡 REAL API CALL to the backend's admin login route
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ SUCCESS: Admin credentials are valid
        console.log('Admin Login Successful:', data);
        
        const token = data.token; // Expecting JWT token from backend

        // -------------------------------------------------------------
        // 🔥 FIXES APPLIED HERE: USE KEYS REQUIRED BY ProtectedAdminRoute
        // -------------------------------------------------------------
        localStorage.setItem("adminToken", token);
        // Change "isAdminLoggedIn" to "isLoggedIn" to satisfy AppRouter's check
        localStorage.setItem("isLoggedIn", "true"); 
        localStorage.setItem("adminEmail", email);
        // CRITICAL FIX: Save the userRole as 'ADMIN' is required for the route protection
        localStorage.setItem("userRole", data.role); // data.role is 'ADMIN'
        // -------------------------------------------------------------

        // Navigate to the protected route. The ProtectedAdminRoute will now allow access.
        navigate("/admin-dashboard");
      } else {
        // ❌ FAILURE: Backend returned error
        console.error("Admin Login Failed:", data.message || data.error || 'Unknown error');
        setError(data.message || data.error || "Invalid admin email or password.");
      }
    } catch (err) {
      // 📡 NETWORK ERROR: Server may be down
      console.error('Network/Server Error:', err);
      setError("Could not connect to the backend server (http://localhost:3000).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-inter bg-white">
      <div className="hidden md:block w-1/3 h-screen relative p-0 m-0 overflow-hidden">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 z-20 text-white hover:text-gray-300 flex items-center gap-2 font-medium transition-colors"
        >
          ← Back
        </button>

        <img
          src="/image 1.png"
          alt="Admin Portal Background"
          className="absolute inset-0 w-full h-full rounded-r-4xl object-cover"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 tracking-widest">ADMIN LOGIN</h2>
            <p className="text-slate-500 text-sm mt-1">Secure Management Gateway</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div>
              <label className="block text-sm mb-1">Admin Email</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-600 bg-red-50 p-2 rounded flex items-center text-sm">
                <XCircle className="w-4 h-4 mr-2" /> {error}
              </p>
            )}

            <button
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin inline" /> : "Access Dashboard"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-4">
            Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;