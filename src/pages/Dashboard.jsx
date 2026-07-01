import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { api } from "@/lib/api";
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

const formatDateTime = (value) => {
  if (!value) return 'No upload yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No upload yet';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const updateToneClass = (tone) => {
  if (tone === 'amber') return 'bg-amber-500';
  if (tone === 'blue') return 'bg-blue-500';
  return 'bg-emerald-500';
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");
  const [showPlanNotice, setShowPlanNotice] = useState(false);
  const [studentPlan, setStudentPlan] = useState(null);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.user_metadata?.role === 'teacher';
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQuery({
    queryKey: ['studentOverview'],
    queryFn: api.getStudentOverview,
    enabled: !!user && !isTeacher,
  });

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

  const institution = overview?.institution || {};
  const connectedUniversity = institution.current_university;
  const departments = overview?.departments || [];
  const upcomingClasses = overview?.schedule?.upcoming_classes || [];
  const recentUpdates = overview?.recent_updates || [];

  return (
    <div className="min-h-screen bg-transparent text-foreground flex overflow-hidden">
      {showPlanNotice && studentPlan && (
        <SemesterTokenNotice plan={studentPlan} onClose={dismissPlanNotice} />
      )}

      {/* Background Decor */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0.14), transparent 30%), radial-gradient(circle at 92% 88%, rgba(20, 184, 166, 0.12), transparent 34%)",
        }}
      />

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
              {overviewError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-500">
                  Could not load live overview: {overviewError.message}
                </div>
              )}

              <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <Building className="w-6 h-6 text-emerald-500" />
                  </div>
                  Live Institution Sync
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> University Connected
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {overviewLoading ? 'Loading...' : connectedUniversity?.name || 'Not assigned'}
                    </div>
                    <div className="text-xs text-emerald-500 mt-1 font-medium bg-emerald-500/10 inline-block px-2 py-0.5 rounded-md">
                      {institution.connected_universities_count || 0} live universities
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Departments
                    </div>
                    <div className="text-3xl font-black text-foreground">
                      {overviewLoading ? '--' : institution.departments_count || 0}
                      <span className="text-sm font-medium text-muted-foreground ml-2">Synced</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">
                      {departments.slice(0, 2).map(dept => dept.code || dept.name).join(', ') || 'No departments yet'}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-muted/40 border border-border">
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Timetables Processed
                    </div>
                    <div className="text-3xl font-black text-foreground">
                      {overviewLoading ? '--' : institution.timetable_versions_count || 0}
                      <span className="text-sm font-medium text-muted-foreground ml-2">Versions</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">
                      Latest parsed {formatDateTime(institution.latest_upload?.uploaded_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
                <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-md relative overflow-hidden">
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-500" /> Department Timetable Status
                  </h3>
                  <div className="space-y-3">
                    {overviewLoading ? (
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border text-sm text-muted-foreground">Loading departments...</div>
                    ) : departments.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border text-sm text-muted-foreground">No departments are connected yet.</div>
                    ) : departments.slice(0, 5).map(dept => (
                      <div key={dept.id} className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-foreground">{dept.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {dept.latest_version
                              ? `${dept.latest_version.semester_label} · ${dept.latest_version.version_label || 'Version'}`
                              : 'No timetable uploaded yet'}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-xs font-black px-2.5 py-1 rounded-full ${dept.latest_version ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                            {dept.latest_version ? 'Live' : 'Pending'}
                          </div>
                          {dept.latest_version && (
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {dept.latest_version.slots_count} slots
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-md relative overflow-hidden">
                  <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" /> Upcoming Classes
                  </h3>
                  <div className="space-y-3">
                    {overviewLoading ? (
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border text-sm text-muted-foreground">Checking your saved schedule...</div>
                    ) : upcomingClasses.length === 0 ? (
                      <div className="p-5 rounded-2xl bg-muted/30 border border-border text-sm text-muted-foreground">
                        No saved classes yet. Generate and save your timetable to see upcoming classes here.
                      </div>
                    ) : upcomingClasses.map(slot => (
                      <div key={`${slot.id}-${slot.day}-${slot.start_time}`} className="p-4 rounded-2xl bg-muted/30 border border-border">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-bold text-foreground">{slot.subject} <span className="text-muted-foreground font-medium">({slot.section})</span></div>
                            <div className="text-xs text-muted-foreground mt-1">{slot.day} · {slot.time_label}</div>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full shrink-0">{slot.starts_in}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3 mt-3">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {slot.room || 'TBA'}</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {slot.teacher?.name || 'Staff'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-md relative overflow-hidden">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" /> Recent Updates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {overviewLoading ? (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-sm text-muted-foreground">Loading recent updates...</div>
                  ) : recentUpdates.length === 0 ? (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border text-sm text-muted-foreground">No recent timetable updates yet.</div>
                  ) : recentUpdates.map(update => (
                    <div key={update.id} className="p-4 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
                      <div className={`w-2 h-2 mt-1.5 rounded-full ${updateToneClass(update.tone)} shrink-0`} />
                      <div>
                        <div className="text-sm font-bold text-foreground">{update.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{update.description}</div>
                        <div className="text-[10px] text-muted-foreground mt-2">{formatDateTime(update.timestamp)}</div>
                      </div>
                    </div>
                  ))}
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
