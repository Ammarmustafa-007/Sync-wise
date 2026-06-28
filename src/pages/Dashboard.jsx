import { useState } from "react";
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
  BookOpen
} from "lucide-react";
import TeacherDashboard from "./TeacherDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { api } from "@/lib/api";
import GenerateTimetableWizard from "@/components/GenerateTimetableWizard";
import MySchedule from "@/components/MySchedule";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Sparkles, label: "Generate Timetable", active: false },
  { icon: Calendar, label: "My Schedule", active: false },
  { icon: Settings, label: "Settings", active: false },
];

// MOCK_SCHEDULE removed

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Generate Timetable");
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Route to Teacher Dashboard if role matches
  if (user?.user_metadata?.role === 'teacher') {
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

export default Dashboard;
