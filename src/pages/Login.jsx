import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  const [loading, setLoading] = useState(false);
  const { devLogin } = useAuth(); // Import devLogin
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-transparent overflow-hidden">
      {/* Box Container - Flexible height to prevent squishing */}
      <div className="w-full max-w-5xl bg-background rounded-2xl shadow-xl border overflow-hidden flex min-h-[600px] max-h-[90vh]">
        
        {/* Left Side (Form) */}
        <div className="flex-1 flex flex-col justify-center px-8 py-8 relative overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto flex flex-col justify-center"
          >
            {/* Header Section */}
            <div className="mb-4">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">SyncWise</span>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in with your official university Google account.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-50">
              <div className="flex items-start gap-3">
                <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h2 className="text-sm font-black">University email required</h2>
                  <p className="mt-1 text-xs font-medium leading-relaxed opacity-85">
                    Access is allowed only through the Google account issued or approved by your university. Random Gmail accounts and personal emails are rejected.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="w-full h-12 gap-2 text-base font-bold"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </Button>

            <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Protected university access
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Allowed domains: @student.uol.edu.pk and @teacher.uol.edu.pk.
              </p>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>

            {/* DEV BYPASS BUTTONS */}
            <div className="mt-8 p-4 border border-border rounded-xl bg-muted/20">
              <p className="text-xs text-muted-foreground text-center mb-3 font-semibold uppercase tracking-wider">Developer Quick Login</p>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={() => {
                    devLogin('teacher');
                    navigate('/dashboard');
                  }}
                >
                  Teacher POV
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={() => {
                    devLogin('student');
                    navigate('/dashboard');
                  }}
                >
                  Student POV
                </Button>
              </div>
            </div>
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
