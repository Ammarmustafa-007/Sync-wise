import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";



const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: false },
  { icon: CalendarDays, label: "Makeup Planner", active: true },
  { icon: Users, label: "My Students", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Makeup Planner");
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['teacherStats'],
    queryFn: api.getTeacherStats
  });

  const { data: mySections } = useQuery({
    queryKey: ['teacherSections'],
    queryFn: api.getTeacherSections
  });

  const { data: sectionStudents } = useQuery({
    queryKey: ['sectionStudents', selectedSection],
    queryFn: () => api.getSectionStudents(selectedSection),
    enabled: !!selectedSection
  });

  // Portal State
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [checking, setChecking] = useState(false);
  const [makeupResults, setMakeupResults] = useState(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleCheckAvailability = () => {
    if (selectedDay !== null && selectedSlot !== null && selectedSection) {
      setChecking(true);
      setShowResults(false);
      
      const dayName = DAYS[selectedDay];
      api.checkMakeupClass({ section_id: selectedSection, day: dayName, slot_number: selectedSlot })
         .then(data => {
            setMakeupResults(data);
            setChecking(false);
            setShowResults(true);
         })
         .catch(err => {
            setChecking(false);
            toast.error(err.message);
         });
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground flex overflow-hidden selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[20%] h-[20%] rounded-full bg-indigo-500/5 blur-[100px]" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card/60 backdrop-blur-xl z-20">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                SyncWise
              </span>
              <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">Teacher Portal</div>
            </div>
          </Link>
        </div>

        <div className="px-6 pb-6">
          <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-blue-500/20 border border-border flex items-center justify-center">
              <span className="font-bold text-sm">{user?.user_metadata?.full_name?.charAt(0) || 'T'}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold truncate text-foreground">{user?.user_metadata?.full_name || 'Teacher'}</div>
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
                  layoutId="activeTab" 
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-border rounded-xl"
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${activeNav === item.label ? 'text-primary' : 'group-hover:text-primary/70 transition-colors'}`} />
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

      {/* Mobile sidebar overlay & mobile nav logic */}
      <header className="lg:hidden fixed top-0 w-full z-40 h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-primary" />
          <span className="font-bold text-foreground">SyncWise Teacher</span>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Active Students", value: stats?.total_students || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { label: "Assigned Sections", value: stats?.total_sections || 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
                  { label: "Makeup Classes Done", value: stats?.makeup_classes || 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Total Classes Today", value: stats?.today_slots || 0, icon: CalendarDays, color: "text-orange-500", bg: "bg-orange-500/10" },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-card/40 border border-border backdrop-blur-md flex items-center gap-4 group hover:bg-card/60 transition-colors">
                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                      <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Next Class Widget */}
                 <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" /> Upcoming Class
                    </h3>
                    <div className="p-5 rounded-2xl bg-muted/50 border border-border flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground">Database Systems (CS-4A)</span>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">In 45 mins</span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Room 302, Block A</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 50 Students</span>
                      </div>
                    </div>
                 </div>

                 {/* System Synced Data */}
                 <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-md relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[50px] translate-y-1/2 translate-x-1/4 pointer-events-none" />
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-500" /> Platform Sync Status
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">University</span>
                        <span className="font-semibold text-foreground">NUST Islamabad</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border-b border-border/50">
                        <span className="text-sm text-muted-foreground">Department</span>
                        <span className="font-semibold text-foreground">Computer Science</span>
                      </div>
                      <div className="flex justify-between items-center p-3">
                        <span className="text-sm text-muted-foreground">Last Timetable Sync</span>
                        <span className="font-semibold text-emerald-500 text-sm flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Today, 08:00 AM
                        </span>
                      </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN: MAKEUP PLANNER & SECTION SELECTOR */}
          {activeNav === "Makeup Planner" && (
          <>
          <motion.div 

            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
            <div className="relative bg-card/40 border border-border rounded-3xl backdrop-blur-xl overflow-hidden shadow-sm">
              <div className="p-8 border-b border-border bg-gradient-to-b from-muted/30 to-transparent">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Class Selection</h2>
                    <p className="text-sm text-muted-foreground">Select your active semester and class section</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Section Dropdown */}
                  <div className="space-y-2 relative z-30">
                    <label className="text-sm font-medium text-muted-foreground ml-1">Assigned Section</label>
                    <div className="relative group/select">
                      <CustomSelect 
                        value={selectedSection}
                        onChange={(val) => setSelectedSection(val)}
                        placeholder="Choose a section you teach..."
                        options={mySections?.map(sec => ({ label: sec.section_name, value: sec.section_name }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Students List (Glass Table) */}
              <AnimatePresence>
                {selectedSection && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="px-8 py-5 border-b border-border bg-muted/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        Enrolled Students <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{sectionStudents?.length || 0}</span>
                      </h3>
                      <div className="text-xs font-medium text-muted-foreground flex gap-5 bg-background/50 px-4 py-2 rounded-full border border-border">
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> Free</span>
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span> Busy</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto pb-4">
                      <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="text-muted-foreground uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="px-8 py-4 font-semibold">Student Identity</th>
                            <th className="px-8 py-4 font-semibold text-center">Weekly Availability (M-S)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {(sectionStudents || []).map((student, idx) => (
                            <motion.tr 
                              key={student.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="hover:bg-muted/30 transition-colors group/row"
                            >
                              <td className="px-8 py-4">
                                <div className="font-semibold text-foreground group-hover/row:text-primary transition-colors">{student.full_name || student.name}</div>
                                <div className="text-xs text-muted-foreground">{student.email}</div>
                              </td>
                              <td className="px-8 py-4">
                                <div className="flex justify-center gap-2">
                                  {[true, true, true, true, true, true].map((isFree, dayIdx) => (
                                    <div 
                                      key={dayIdx} 
                                      className={`w-3 h-3 rounded-full transition-transform hover:scale-150 cursor-help ${
                                        isFree 
                                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                                        : 'bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                      }`}
                                      title={`${DAYS[dayIdx]}: ${isFree ? 'Free' : 'Busy'}`}
                                    />
                                  ))}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* SCREEN 2: MAKEUP CLASS PLANNER (PREMIUM UI) */}
          <AnimatePresence>
            {selectedSection && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative group"
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
                 <div className="relative bg-card/40 border border-border rounded-3xl backdrop-blur-xl overflow-hidden shadow-sm">
                  
                  <div className="p-8 border-b border-border bg-gradient-to-b from-muted/30 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <CalendarDays className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Makeup Planner</h2>
                        <p className="text-sm text-muted-foreground">Find optimal slots using algorithmic schedule checking</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-10">
                    {/* Day Selector */}
                    <div className="space-y-4">
                      <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground ml-1">Target Day</label>
                      <div className="flex flex-wrap gap-3">
                        {DAYS.map((day, idx) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(idx)}
                            className={`px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                              selectedDay === idx 
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105 border border-primary/20' 
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Slot Selector */}
                    <div className="space-y-4">
                      <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground ml-1">Time Slot</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {SLOTS.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot.id)}
                            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 border ${
                              selectedSlot === slot.id 
                                ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400 scale-105 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                                : 'bg-background/40 border-border text-muted-foreground hover:border-border/80 hover:text-foreground hover:bg-muted/30'
                            }`}
                          >
                            <span className="font-bold">Slot {slot.id}</span>
                            <span className="text-[10px] uppercase tracking-wider opacity-70">{slot.time}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Check Action */}
                    <div className="pt-4 flex justify-end">
                      <button 
                        onClick={handleCheckAvailability}
                        disabled={selectedDay === null || selectedSlot === null || checking}
                        className="px-8 py-4 bg-foreground text-background rounded-2xl font-bold flex items-center gap-3 hover:bg-foreground/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95"
                      >
                        {checking ? (
                          <>
                            <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                            Analyzing Data...
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5" />
                            Run Clash Analysis
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Results Card */}
                  <AnimatePresence>
                    {showResults && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t border-border bg-muted/20 backdrop-blur-md relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
                        
                        <div className="p-8 space-y-8">
                          {/* Header stat */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
                              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="relative z-10">
                              <div className="text-3xl font-extrabold text-foreground">
                                <span className="text-emerald-600 dark:text-emerald-400">{makeupResults?.free_students?.length || 0}</span> / {(makeupResults?.free_students?.length || 0) + (makeupResults?.busy_students?.length || 0)} Free
                              </div>
                              <div className="text-sm text-emerald-600/70 dark:text-emerald-400/70 mt-1">Highly optimal slot detected. Minimal clashes found.</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Free Students */}
                            <div className="space-y-4">
                              <h4 className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Available Students
                              </h4>
                              <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {(makeupResults?.free_students || []).map((s, i) => (
                                  <div key={i} className="text-sm px-4 py-3 bg-card rounded-xl text-foreground border border-border flex items-center justify-between">
                                    {s.full_name || s.name}
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                                  </div>
                                ))}
                                <div className="text-sm px-4 py-3 text-muted-foreground italic text-center border border-border border-dashed rounded-xl">
                                  + 15 additional students
                                </div>
                              </div>
                            </div>

                            {/* Busy Students */}
                            <div className="space-y-4">
                              <h4 className="text-xs uppercase tracking-widest font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Schedule Clashes
                              </h4>
                              <div className="space-y-2">
                                {(makeupResults?.busy_students || []).map((s, i) => (
                                  <div key={i} className="px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-foreground">{s.full_name || s.name}</span>
                                      <XCircle className="w-4 h-4 text-red-500/50" />
                                    </div>
                                    <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 self-start px-2 py-0.5 rounded-md">
                                      Schedule Clash
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Available Rooms */}
                          <div className="pt-6 border-t border-border space-y-4">
                            <h4 className="text-xs uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> Available Locations
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {(makeupResults?.available_rooms || []).map((room, i) => (
                                <div key={i} className="px-4 py-3 bg-blue-500/5 border border-blue-500/20 rounded-xl shadow-sm flex flex-col gap-1 min-w-[140px] group/room hover:bg-blue-500/10 transition-colors">
                                  <div className="font-bold text-foreground">{room.name}</div>
                                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                                    {room.building}
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md font-semibold">
                                      {room.capacity}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-6 flex justify-end">
                            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                              Finalize Makeup Class
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
