import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";



const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: false },
  { icon: CalendarDays, label: "Makeup Planner", active: true },
  { icon: Users, label: "My Students", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FALLBACK_TIME_SLOTS = [
  { value: '08:00:00-09:15:00', slot_number: 1, start_time: '08:00:00', end_time: '09:15:00', label: 'Slot 1 · 8:00 AM - 9:15 AM' },
  { value: '09:30:00-10:45:00', slot_number: 2, start_time: '09:30:00', end_time: '10:45:00', label: 'Slot 2 · 9:30 AM - 10:45 AM' },
  { value: '11:00:00-12:15:00', slot_number: 3, start_time: '11:00:00', end_time: '12:15:00', label: 'Slot 3 · 11:00 AM - 12:15 PM' },
  { value: '12:30:00-13:45:00', slot_number: 4, start_time: '12:30:00', end_time: '13:45:00', label: 'Slot 4 · 12:30 PM - 1:45 PM' },
  { value: '14:00:00-15:15:00', slot_number: 5, start_time: '14:00:00', end_time: '15:15:00', label: 'Slot 5 · 2:00 PM - 3:15 PM' },
  { value: '15:30:00-16:45:00', slot_number: 6, start_time: '15:30:00', end_time: '16:45:00', label: 'Slot 6 · 3:30 PM - 4:45 PM' }
];

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'ST';

const TeacherDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Makeup Planner");
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Portal State
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [checking, setChecking] = useState(false);
  const [makeupResults, setMakeupResults] = useState(null);

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['teacherStats'],
    queryFn: api.getTeacherStats,
    enabled: activeNav === 'Overview',
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: makeupOptions, isLoading: optionsLoading } = useQuery({
    queryKey: ['teacherMakeupOptions'],
    queryFn: api.getTeacherMakeupOptions,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const semesters = makeupOptions?.semesters || [];
  const timeSlots = makeupOptions?.time_slots?.length ? makeupOptions.time_slots : FALLBACK_TIME_SLOTS;
  const selectedSemesterData = semesters.find(sem => String(sem.semester_number) === String(selectedSemester));
  const selectedSubjectData = selectedSemesterData?.subjects?.find(subject => subject.subject === selectedSubject);
  const selectedSlotData = timeSlots.find(slot => slot.value === selectedSlot);
  const selectedVersionIds = selectedSection === 'all'
    ? (selectedSubjectData?.version_ids || [])
    : (selectedSubjectData?.section_version_ids?.[selectedSection] || []);
  const totalStudents = makeupResults?.summary?.total_students ?? ((makeupResults?.free_students?.length || 0) + (makeupResults?.busy_students?.length || 0));
  const freeCount = makeupResults?.summary?.free_count ?? (makeupResults?.free_students?.length || 0);
  const busyCount = makeupResults?.summary?.busy_count ?? (makeupResults?.busy_students?.length || 0);
  const freePercentage = makeupResults?.summary?.free_percentage ?? (totalStudents > 0 ? Math.round((freeCount / totalStudents) * 100) : 0);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const resetResults = () => {
    setShowResults(false);
    setMakeupResults(null);
  };

  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
    setSelectedSubject('');
    setSelectedSection('all');
    setSelectedSlot('');
    resetResults();
  };

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setSelectedSection('all');
    setSelectedSlot('');
    resetResults();
  };

  const handleSectionChange = (value) => {
    setSelectedSection(value);
    resetResults();
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    resetResults();
  };

  const handleSlotChange = (slotValue) => {
    setSelectedSlot(slotValue);
    resetResults();
  };

  const handleCheckAvailability = () => {
    if (!selectedSemester || !selectedSubject || !selectedDay || !selectedSlotData) {
      toast.error("Select semester, subject, day, and time first.");
      return;
    }

    setChecking(true);
    setShowResults(false);

    api.checkMakeupClass({
      semester_number: Number(selectedSemester),
      subject: selectedSubject,
      section: selectedSection,
      day: selectedDay,
      slot_number: selectedSlotData.slot_number,
      start_time: selectedSlotData.start_time,
      end_time: selectedSlotData.end_time,
      version_id: selectedVersionIds[0] || null,
      version_ids: selectedVersionIds
    })
       .then(data => {
          setMakeupResults(data);
          setChecking(false);
          setShowResults(true);
       })
       .catch(err => {
          setChecking(false);
          toast.error(err.message);
       });
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground flex overflow-hidden selection:bg-primary/30">
      {/* Background Effects */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, rgba(168, 85, 247, 0.14), transparent 30%), radial-gradient(circle at 92% 88%, rgba(59, 130, 246, 0.12), transparent 34%)",
        }}
      />

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

          {/* SCREEN: MAKEUP PLANNER */}
          {activeNav === "Makeup Planner" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-3xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50" />
              <div className="relative bg-card/45 border border-border rounded-3xl backdrop-blur-xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border bg-gradient-to-br from-primary/10 via-background/40 to-blue-500/10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                        <CalendarDays className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3">
                          <Sparkles className="w-3.5 h-3.5" />
                          Availability Lookup
                        </div>
                        <h2 className="text-2xl font-extrabold text-foreground">Makeup Availability Planner</h2>
                        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                          Pick the class you want to recover, then check saved student enrollments for that exact day and time.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 min-w-[280px]">
                      <div className="rounded-2xl border border-border bg-background/70 p-4 text-center">
                        <div className="text-2xl font-black text-foreground">{semesters.length}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Semesters</div>
                      </div>
                      <div className="rounded-2xl border border-border bg-background/70 p-4 text-center">
                        <div className="text-2xl font-black text-foreground">{selectedSemesterData?.subject_count || 0}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Subjects</div>
                      </div>
                      <div className="rounded-2xl border border-border bg-background/70 p-4 text-center">
                        <div className="text-2xl font-black text-foreground">{timeSlots.length}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Slots</div>
                      </div>
                    </div>
                  </div>

                  {makeupOptions?.teacher && (
                    <div className="mt-6 text-xs text-muted-foreground">
                      Teacher POV: <span className="font-semibold text-foreground">{makeupOptions.teacher.full_name}</span>
                      <span className="mx-2">·</span>
                      Browsing all latest timetable sections
                    </div>
                  )}
                </div>

                <div className="p-8 space-y-8">
                  {optionsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(item => (
                        <div key={item} className="h-24 rounded-2xl border border-border bg-muted/40 animate-pulse" />
                      ))}
                    </div>
                  ) : semesters.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-10 text-center">
                      <Users className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-bold text-foreground">No timetable catalog found yet</h3>
                      <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
                        Upload or seed timetable slots first. Once the database has latest timetable data, semesters and subjects will appear here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 relative z-20">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground ml-1">Semester</label>
                          <CustomSelect
                            value={selectedSemester}
                            onChange={handleSemesterChange}
                            placeholder="Choose semester..."
                            options={semesters.map(semester => ({
                              label: `${semester.label} · ${semester.subject_count} subjects`,
                              value: semester.semester_number
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground ml-1">Subject</label>
                          <CustomSelect
                            value={selectedSubject}
                            onChange={handleSubjectChange}
                            placeholder="Choose subject..."
                            disabled={!selectedSemesterData}
                            options={(selectedSemesterData?.subjects || []).map(item => ({
                              label: `${item.subject} · ${item.sections.length} section${item.sections.length === 1 ? '' : 's'}`,
                              value: item.subject
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground ml-1">Class Scope</label>
                          <CustomSelect
                            value={selectedSection}
                            onChange={handleSectionChange}
                            placeholder="Choose scope..."
                            disabled={!selectedSubjectData}
                            options={[
                              { label: 'All sections for this subject', value: 'all' },
                              ...((selectedSubjectData?.sections || []).map(section => ({
                                label: section,
                                value: section
                              })))
                            ]}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground ml-1">Timetable Slot</label>
                          <CustomSelect
                            value={selectedSlot}
                            onChange={handleSlotChange}
                            placeholder="Choose timetable time..."
                            options={timeSlots.map(slot => ({
                              label: slot.label || `${slot.start_time} - ${slot.end_time}`,
                              value: slot.value
                            }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground ml-1">Target Day</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {(makeupOptions?.days || DAYS).map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleDayChange(day)}
                              className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                                selectedDay === day
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.03] border-primary/20'
                                  : 'bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground border-border'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-stretch">
                        <div className="rounded-3xl border border-border bg-background/45 p-6">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground">Cohort Preview</h3>
                              <p className="text-xs text-muted-foreground">Students are pulled from saved enrollments for this subject scope.</p>
                            </div>
                          </div>

                          {selectedSubjectData ? (
                            <div className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {(selectedSection === 'all' ? selectedSubjectData.sections : [selectedSection]).map(section => (
                                  <span key={section} className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                                    {section}
                                  </span>
                                ))}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(selectedSubjectData.meetings || []).slice(0, 4).map(meeting => (
                                  <div key={meeting.slot_id} className="rounded-2xl border border-border bg-card/70 p-4">
                                    <div className="text-sm font-bold text-foreground">{meeting.section}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{meeting.day} · {meeting.time_label}</div>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {meeting.room_name}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {(selectedSubjectData.meeting_count || 0) > (selectedSubjectData.meetings || []).length && (
                                <div className="text-xs text-muted-foreground">
                                  Showing {(selectedSubjectData.meetings || []).length} sample meetings from {selectedSubjectData.meeting_count}. Availability check still uses the full selected subject scope.
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                              Select a semester and subject to preview the class scope.
                            </div>
                          )}
                        </div>

                        <div className="rounded-3xl border border-border bg-foreground text-background p-6 flex flex-col justify-between">
                          <div>
                            <div className="text-xs uppercase tracking-widest font-bold opacity-70">Ready check</div>
                            <div className="mt-3 text-2xl font-black">
                              {selectedDay && selectedSlotData ? `${selectedDay}, ${selectedSlotData.label}` : 'Choose day and time'}
                            </div>
                            <p className="text-sm opacity-70 mt-3">
                              This checks saved student schedules only. It does not modify enrollments or run the clash resolver.
                            </p>
                          </div>

                          <button
                            onClick={handleCheckAvailability}
                            disabled={!selectedSemester || !selectedSubject || !selectedDay || !selectedSlot || checking}
                            className="mt-8 w-full px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all active:scale-95"
                          >
                            {checking ? (
                              <>
                                <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                                Checking availability...
                              </>
                            ) : (
                              <>
                                Analyze Student Availability
                                <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <AnimatePresence>
                  {showResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-border bg-muted/20 backdrop-blur-md relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-transparent" />
                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Total Students', value: totalStudents, color: 'text-foreground', bg: 'bg-background/70' },
                            { label: 'Free', value: freeCount, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                            { label: 'Busy', value: busyCount, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
                            { label: 'Free Rate', value: `${freePercentage}%`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' }
                          ].map(stat => (
                            <div key={stat.label} className={`rounded-3xl border border-border ${stat.bg} p-5`}>
                              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h4 className="text-xs uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Free Students
                            </h4>
                            <div className="max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                              {(makeupResults?.free_students || []).length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground text-center">
                                  No free students found for this slot.
                                </div>
                              ) : (
                                (makeupResults?.free_students || []).map(student => (
                                  <div key={student.id} className="px-4 py-3 bg-card rounded-2xl text-foreground border border-border flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
                                        {getInitials(student.full_name)}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-bold truncate">{student.full_name || student.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{student.target_sections?.join(', ') || selectedSubject}</div>
                                      </div>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-xs uppercase tracking-widest font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                              <XCircle className="w-4 h-4" />
                              Busy Students
                            </h4>
                            <div className="max-h-80 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                              {(makeupResults?.busy_students || []).length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground text-center">
                                  No one is booked in this slot.
                                </div>
                              ) : (
                                (makeupResults?.busy_students || []).map(student => (
                                  <div key={student.id} className="px-4 py-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="font-bold text-foreground">{student.full_name || student.name}</div>
                                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    </div>
                                    <div className="mt-3 space-y-2">
                                      {(student.busy_with || []).map(conflict => (
                                        <div key={conflict.slot_id} className="rounded-xl bg-background/70 border border-border px-3 py-2 text-xs">
                                          <div className="font-bold text-foreground">{conflict.subject} · {conflict.section}</div>
                                          <div className="text-muted-foreground mt-1">{conflict.day} · {conflict.time_label}</div>
                                          <div className="text-muted-foreground mt-1">{conflict.room_name} · {conflict.teacher_name}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-4">
                          <h4 className="text-xs uppercase tracking-widest font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Rooms Free At This Time
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {(makeupResults?.available_rooms || []).length === 0 ? (
                              <div className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border px-4 py-3">
                                No available room suggestion found for this time.
                              </div>
                            ) : (
                              (makeupResults?.available_rooms || []).map(room => (
                                <div key={room.id} className="px-4 py-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl shadow-sm flex flex-col gap-1 min-w-[150px]">
                                  <div className="font-bold text-foreground">{room.name}</div>
                                  <div className="text-xs text-muted-foreground flex items-center justify-between gap-3">
                                    <span>{room.building || 'Campus room'}</span>
                                    {room.capacity && (
                                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md font-semibold">
                                        {room.capacity}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
