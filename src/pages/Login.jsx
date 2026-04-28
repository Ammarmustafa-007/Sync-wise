import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Successfully logged in");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message || "Failed to login with Google");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      {/* Box Container - Same consistent size as Signup */}
      <div className="w-full max-w-5xl bg-background rounded-2xl shadow-xl border overflow-hidden flex h-[85vh]">
        
        {/* Left Side (Form) - Preserved your structure, applied compact styling */}
        <div className="flex-1 flex flex-col justify-center px-8 py-6 h-full relative">
          <motion.div
            initial={{ opacity: 0, x: 20 }} // Sliding from right (opposite of signup)
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto flex flex-col justify-center h-full"
          >
            {/* Header Section */}
            <div className="mb-6">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">SyncWise</span>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to your account to continue
              </p>
            </div>

            {/* Google Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 gap-2 mb-6"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <GoogleIcon />
              <span className="text-sm">Continue with Google</span>
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <Button type="submit" className="w-full h-10 mt-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Sign in
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Right Side (Image/Decorative) */}
        <div className="hidden lg:flex w-1/2 bg-primary/5 items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Transform Timetable PDFs into Structured Schedules
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Join SyncWise to extract, organize, and generate
              clash-free academic timetables from university PDFs.
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Login;