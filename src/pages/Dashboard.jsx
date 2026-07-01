import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  MapPin,
  Clock,
  Building,
  Users,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  BookOpen,
  Coins,
  Crown,
  Zap
} from "lucide-react";
import TeacherDashboard from "./TeacherDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import GenerateTimetableWizard from "@/components/GenerateTimetableWizard";
import MySchedule from "@/components/MySchedule";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Sparkles, label: "Generate Timetable", active: false },
  { icon: Calendar, label: "My Schedule", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const getClientSemesterKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const term = now.getMonth() + 1 <= 6 ? 'spring' : 'fall';
  return `${year}:${term}`;
};

// MOCK_SCHEDULE removed

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Generate Timetable");
  const [showPlanNotice, setShowPlanNotice] = useState(false);
  const [studentPlan, setStudentPlan] = useState(null);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.user_metadata?.role === 'teacher';

  useEffect(() => {
    if (!user?.id || isTeacher) return;

    if (user.id === 'dev') {
      setStudentPlan('pro');
      return;
    }

    supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setStudentPlan(data?.plan === 'pro' ? 'pro' : 'free'));
  }, [user?.id, isTeacher]);

  useEffect(() => {
    if (!studentPlan || !user?.id || isTeacher) return;

    const noticeKey = `semester-token-notice:${user.id}:${getClientSemesterKey()}:${studentPlan}`;
    if (!sessionStorage.getItem(noticeKey)) {
      setShowPlanNotice(true);
    }
  }, [studentPlan, user?.id, isTeacher]);

  const dismissPlanNotice = () => {
    if (studentPlan && user?.id) {
      sessionStorage.setItem(`semester-token-notice:${user.id}:${getClientSemesterKey()}:${studentPlan}`, 'seen');
    }
    setShowPlanNotice(false);
  };

  // Route to Teacher Dashboard if role matches
  if (isTeacher) {
    return <TeacherDashboard />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground flex overflow-hidden">
      {showPlanNotice && studentPlan && (
        <SemesterTokenNotice plan={studentPlan} onClose={dismissPlanNotice} />
      )}

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px]" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card/60 backdrop-blur-xl z-20">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                SyncWise
              </span>
              <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold">Student Portal</div>
            </div>
          </Link>
        </div>

        <div className="px-6 pb-6">
          <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-border flex items-center justify-center">
              <span className="font-bold text-sm text-foreground">{user?.user_metadata?.full_name?.charAt(0) || 'S'}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold truncate text-foreground">{user?.user_metadata?.full_name || 'Student'}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveNav(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                activeNav === item.label
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {activeNav === item.label && (
                <motion.div 
                  layoutId="activeStudentTab" 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-border rounded-xl"
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${activeNav === item.label ? 'text-emerald-500' : 'group-hover:text-emerald-500/70 transition-colors'}`} />
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay & nav */}
      <header className="lg:hidden fixed top-0 w-full z-40 h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-emerald-500" />
          <span className="font-bold text-foreground">SyncWise Student</span>
        </div>
        <button className="p-2 text-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative z-10 pt-16 lg:pt-0">
        <header className="hidden lg:flex sticky top-0 z-30 h-20 border-b border-border bg-background/50 backdrop-blur-2xl items-center px-10">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {activeNav}
          </h1>
        </header>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
          
          {/* SCREEN: OVERVIEW */}
          {activeNav === "Overview" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Admin Uploaded Data Details */}
              <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <Building className="w-6 h-6 text-emerald-500" />
                  </div>
                  Institution Sync Status
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> University Connected
                    </div>
                    <div className="text-lg font-bold text-foreground">NUST Islamabad</div>
                    <div className="text-xs text-emerald-500 mt-1 font-medium bg-emerald-500/10 inline-block px-2 py-0.5 rounded-md">Verified</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Department
                    </div>
                    <div className="text-lg font-bold text-foreground">Computer Science</div>
                    <div className="text-xs text-emerald-500 mt-1 font-medium bg-emerald-500/10 inline-block px-2 py-0.5 rounded-md">Synced</div>
                  </div>

                  <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Timetables Processed
                    </div>
                    <div className="text-3xl font-black text-foreground">14<span className="text-sm font-medium text-muted-foreground ml-2">Versions</span></div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">Latest parsed 2 hours ago</div>
                  </div>
                </div>
              </div>

              {/* Today's Snapshot */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Next Class Widget */}
                 <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-md relative overflow-hidden">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-500" /> Next Class
                    </h3>
                    <div className="p-5 rounded-2xl bg-muted/50 border border-border flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground">Database Systems (CS-4A)</span>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full">In 45 mins</span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Room 302, Block A</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Prof. Ahmed</span>
                      </div>
                    </div>
                 </div>

                 {/* Announcements / Updates */}
                 <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-md relative overflow-hidden">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" /> Recent Updates
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-foreground">Makeup class scheduled</div>
                          <div className="text-xs text-muted-foreground mt-1">SE-3B lab has been moved to Friday 2:00 PM.</div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-foreground">Timetable V3 Published</div>
                          <div className="text-xs text-muted-foreground mt-1">Admin uploaded a new version 2 hours ago. Clashes resolved.</div>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: MY SCHEDULE */}
          {activeNav === "My Schedule" && (
            <MySchedule />
          )}

          {/* SCREEN: GENERATE TIMETABLE */}
          {activeNav === "Generate Timetable" && (
            <GenerateTimetableWizard setActiveNav={setActiveNav} />
          )}

        </div>
      </main>
    </div>
  );
};

const SemesterTokenNotice = ({ plan, onClose }) => {
  const isPro = plan === 'pro';
  const allowance = isPro ? 500 : 100;
  const cost = 100;
  const attempts = isPro ? 5 : 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`w-full max-w-xl overflow-hidden rounded-3xl border bg-white shadow-2xl dark:bg-slate-950 ${isPro ? 'border-amber-400 shadow-amber-500/15' : 'border-emerald-400 shadow-emerald-500/15'}`}
      >
        <div className={`h-2 ${isPro ? 'bg-amber-500' : 'bg-emerald-600'}`} />
        <div className="p-7">
          <div className="flex items-start gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${isPro ? 'bg-amber-500 shadow-amber-500/30' : 'bg-emerald-600 shadow-emerald-600/30'}`}>
              {isPro ? <Crown className="h-7 w-7" /> : <Coins className="h-7 w-7" />}
            </div>
            <div>
              <div className={`mb-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white ${isPro ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                {isPro ? 'Pro plan active' : 'Free plan active'}
              </div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                {isPro ? 'You have five semester generations ready.' : 'You have one free semester generation.'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {isPro
                  ? 'Your Pro wallet receives 500 tokens every semester. Each schedule generation spends 100 tokens, so you can regenerate quickly if a seat is booked or your section choices change during realtime enrollment.'
                  : 'Your free wallet receives 100 tokens every semester. Each schedule generation spends 100 tokens, so choose your subjects and preferences carefully before generating.'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-100 p-4 text-center dark:bg-slate-900">
              <div className="text-2xl font-black text-slate-950 dark:text-white">{allowance}</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-500">semester tokens</div>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4 text-center dark:bg-slate-900">
              <div className="text-2xl font-black text-slate-950 dark:text-white">{cost}</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-500">cost per generation</div>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4 text-center dark:bg-slate-900">
              <div className="text-2xl font-black text-slate-950 dark:text-white">{attempts}</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-500">attempts left</div>
            </div>
          </div>

          <div className={`mt-6 flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold ${isPro ? 'bg-amber-50 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100' : 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100'}`}>
            <Zap className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {isPro
                ? 'Use regenerations when enrollment pressure changes the best section choice.'
                : 'Upgrade to Pro when you need fast regenerations during live enrollment.'}
            </span>
          </div>

          <button
            onClick={onClose}
            className={`mt-6 w-full rounded-2xl px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 ${isPro ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25' : 'bg-slate-950 hover:bg-slate-800 shadow-slate-950/20'}`}
          >
            I understand
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
