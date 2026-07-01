import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, GraduationCap, Loader2, MailCheck, ShieldCheck } from "lucide-react";
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

const Signup = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = async () => {
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
      toast.error(error.message || "Failed to sign up with Google");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-muted/30 overflow-hidden">
      {/* Box Container - Flexible height to prevent squishing */}
      <div className="w-full max-w-5xl bg-background rounded-2xl shadow-xl border overflow-hidden flex min-h-[620px] max-h-[90vh]">
        
        {/* Left Side (Image/Decorative) */}
        <div className="hidden lg:flex w-1/2 bg-primary/5 items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-bounce">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Start Timetable Parsing
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              SyncWise is a university-controlled platform. Access is limited to
              students and teachers signing in with their official university Google account.
            </p>
            <div className="mt-6 grid gap-3 text-left">
              <div className="rounded-xl border border-primary/20 bg-background/70 p-3">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  No anonymous accounts
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Personal/random emails are rejected after Google authentication.
                </p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-background/70 p-3">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  University verified
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Use accounts like @student.uol.edu.pk or @teacher.uol.edu.pk.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side (Form) */}
        <div className="flex-1 flex flex-col justify-center px-8 py-6 relative overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
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
              <h1 className="text-2xl font-bold text-foreground">Create account</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Continue with your official university Google account.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-50">
              <div className="flex items-start gap-3">
                <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h2 className="text-sm font-black">University email required</h2>
                  <p className="mt-1 text-xs font-medium leading-relaxed opacity-85">
                    You can only access SyncWise through the Google account issued or approved by your university. Random Gmail accounts and personal emails are not allowed.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              className="w-full h-12 gap-2 text-base font-bold"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </Button>

            <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4">
              <h3 className="text-sm font-bold text-foreground">Allowed emails</h3>
              <div className="mt-3 grid gap-2 text-xs font-medium text-muted-foreground">
                <div className="rounded-lg bg-background/70 px-3 py-2">@student.uol.edu.pk for students</div>
                <div className="rounded-lg bg-background/70 px-3 py-2">@teacher.uol.edu.pk for teachers</div>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
