import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import Logo from "../components/Logo";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: signUpData.firstName,
            last_name: signUpData.lastName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Redirecting to dashboard...",
      });

      setTimeout(() => navigate("/analytics/dashboard"), 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Redirecting to dashboard...",
      });

      setTimeout(() => navigate("/analytics/dashboard"), 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/analytics/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: error?.message || "Unable to start Google sign in.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: `${window.location.origin}/analytics/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Microsoft sign in failed",
        description: error?.message || "Unable to start Microsoft sign in.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Animations */}
      <style>{`
        @keyframes float1 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(20px,-25px); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-15px,-20px); }
        }
        @keyframes float3 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(10px,-15px); }
        }
      `}</style>

      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#c7e9f1] via-[#dff4fb] to-[#eaf9ff]">

          <div
            className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, #9b87f5, #7c3aed)",
              boxShadow: "0 20px 40px rgba(124, 58, 237, 0.3)",
              animation: "float1 8s ease-in-out infinite",
            }}
          />

          <div
            className="absolute bottom-[20%] left-[15%] w-24 h-24 rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, #22d3ee, #06b6d4)",
              boxShadow: "0 15px 30px rgba(6, 182, 212, 0.3)",
              animation: "float2 6s ease-in-out infinite",
            }}
          />

          <div
            className="absolute top-[50%] left-[5%] w-20 h-20 rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, #fb923c, #f97316)",
              boxShadow: "0 15px 30px rgba(249, 115, 22, 0.3)",
              animation: "float3 5s ease-in-out infinite",
            }}
          />

          <div className="relative z-10 flex items-center justify-center w-full p-12 text-center">
            <div className="space-y-6 max-w-md">
              <Logo className="justify-center text-4xl mb-8" />
              <h2 className="text-4xl font-bold">
                {isSignUp ? "WELCOME" : "WELCOME BACK"}
              </h2>
              <p className="text-lg text-gray-600">
                Please enter your details to continue your journey
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex-1 flex items-center justify-center p-8">

          <div className="absolute w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-3xl animate-pulse" />

          <Card className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
            <CardContent className="p-8">

              <div className="flex justify-end mb-6">
                <select className="text-sm bg-transparent cursor-pointer">
                  <option>English (UK)</option>
                </select>
              </div>

              {/* OAuth */}
             <div className="grid grid-cols-2 gap-3 mb-6">
  <Button
    variant="outline"
    onClick={handleMicrosoftSignIn}
    className="flex items-center justify-center gap-2"
  >
    <svg className="w-5 h-5" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
    Sign up with Microsoft
  </Button>

  <Button
    variant="outline"
    onClick={handleGoogleSignIn}
    className="flex items-center justify-center gap-2"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    Sign up with Google
  </Button>
</div>

              {/* OR Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <span className="text-xs tracking-widest text-gray-400 uppercase">
                  OR
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={signUpData.firstName}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={signUpData.lastName}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={signUpData.email}
                      onChange={(e) =>
                        setSignUpData({ ...signUpData, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={signUpData.password}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white h-12 rounded-xl">
                    CREATE ACCOUNT
                  </Button>

                  <p className="text-center text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-teal-600 font-semibold"
                    >
                      Login
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={signInData.email}
                      onChange={(e) =>
                        setSignInData({ ...signInData, email: e.target.value })
                      }
                    />
                  </div>

                 <div>
  <Label>Password</Label>
  <Input
    type="password"
    placeholder="Enter your password"
    className="placeholder:text-gray-400"
    value={signInData.password}
    onChange={(e) =>
      setSignInData({ ...signInData, password: e.target.value })
    }
  />
</div>

                  <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white h-12 rounded-xl">
                    LOGIN
                  </Button>

                  <p className="text-center text-sm">
                    Don’t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-teal-600 font-semibold"
                    >
                      Sign Up
                    </button>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Auth;