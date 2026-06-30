import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from "./ui/CustomSelect";
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, ArrowLeft, UploadCloud, Database } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProUpgradeModal from './ProUpgradeModal';

const GenerateTimetableWizard = ({ setActiveNav }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState('university'); // 'university' or 'personal'
  const [isPro, setIsPro] = useState(false);
  const [proStatus, setProStatus] = useState('none');
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id && user.id !== 'dev') {
      supabase.from('users').select('plan, pro_request_status').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setIsPro(data.plan === 'pro');
          setProStatus(data.pro_request_status || 'none');
        }
      });
    } else if (user?.id === 'dev') {
      setIsPro(true); // Dev mode is always pro
    }
  }, [user]);

  // Step 1: Institution (University Database)
  const [uniId, setUniId] = useState('');
  const [deptId, setDeptId] = useState('');
  const [versionId, setVersionId] = useState('');

  // Step 1b: Personal PDF
  const [selectedFile, setSelectedFile] = useState(null);
  const [cachedExpiry, setCachedExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Step 2: Semesters
  const [selectedSemesters, setSelectedSemesters] = useState([]);

  // Step 3: Subjects
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Step 4: Preferences
  const [subjectPreferences, setSubjectPreferences] = useState({});

  // Step 5: Soft Options
  const [softPreferences, setSoftPreferences] = useState({
    free_day_preference: '',
    minimize_gaps: false,
    avoid_first_slot: false,
    avoid_last_slot: false,
  });
  const [clashPriority, setClashPriority] = useState('teacher');

  // Step 6: Result
  const [result, setResult] = useState(null);

  // --- API Queries (Database) ---
  const { data: universities = [] } = useQuery({ queryKey: ['universities'], queryFn: api.getUniversities });
  const { data: departments = [] } = useQuery({ queryKey: ['departments', uniId], queryFn: () => api.getDepartments(uniId), enabled: !!uniId });
  const { data: versions = [] } = useQuery({ queryKey: ['versions', deptId], queryFn: () => api.getVersions(deptId), enabled: !!deptId });
  const { data: dbSemesters = [] } = useQuery({ queryKey: ['semesters', versionId], queryFn: () => api.getSemesters(versionId), enabled: !!versionId && sourceType === 'university' });
  
  const { data: dbSubjects = [], isFetching: subjectsLoading } = useQuery({
    queryKey: ['subjects', versionId, selectedSemesters],
    queryFn: () => api.getSubjects(versionId, selectedSemesters),
    enabled: !!versionId && selectedSemesters.length > 0 && step >= 3 && sourceType === 'university',
  });

  // --- API Queries (Personal PDF) ---
  const { data: personalSlots = [] } = useQuery({
    queryKey: ['personal_slots'],
    enabled: false, // We only read from cache set by mutation
  });

  // Load cache on mount if exists
  useEffect(() => {
    if (sourceType === 'personal') {
      const cachedStr = localStorage.getItem('personal_slots_cache');
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          if (Date.now() < cached.expiry) {
            setCachedExpiry(cached.expiry);
            queryClient.setQueryData(['personal_slots'], cached.slots);
          } else {
            localStorage.removeItem('personal_slots_cache');
            setCachedExpiry(null);
            queryClient.setQueryData(['personal_slots'], []);
          }
        } catch(e) {}
      }
    }
  }, [sourceType, queryClient]);

  // Timer logic for cached personal slots
  useEffect(() => {
    if (!cachedExpiry) return;
    const interval = setInterval(() => {
      const diff = cachedExpiry - Date.now();
      if (diff <= 0) {
        setCachedExpiry(null);
        setTimeLeft('');
        localStorage.removeItem('personal_slots_cache');
        queryClient.setQueryData(['personal_slots'], []);
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cachedExpiry, queryClient]);

  const parseMutation = useMutation({
    mutationFn: (file) => api.parsePersonalTimetable(file),
    onSuccess: (data) => {
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      localStorage.setItem('personal_slots_cache', JSON.stringify({ slots: data.slots, expiry }));
      setCachedExpiry(expiry);
      queryClient.setQueryData(['personal_slots'], data.slots);
      setStep(2); // Go to semester selection just like DB flow
      toast.success('Timetable parsed successfully!');
    },
    onError: (err) => toast.error(err.message || 'Failed to parse PDF')
  });

  // Helper to extract semester from section (e.g. "BSSE-5A" -> 5)
  const getSemesterNumber = (sectionStr) => {
    if (!sectionStr) return 99;
    const match = sectionStr.match(/\d+/g);
    if (match && match.length > 0) return parseInt(match[match.length - 1], 10);
    const romanMatch = sectionStr.match(/(?:[- ])?(VIII|VII|VI|IV|V|III|II|I)[A-Z]?$/i);
    if (romanMatch) {
      const romanMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8 };
      return romanMap[romanMatch[1].toUpperCase()] || 99;
    }
    return 99;
  };

  const personalSemesters = useMemo(() => {
    if (sourceType !== 'personal' || !personalSlots || personalSlots.length === 0) return [];
    const sems = {};
    personalSlots.forEach(slot => {
      const semNum = getSemesterNumber(slot.section);
      if (!sems[semNum]) sems[semNum] = new Set();
      if (slot.subject) sems[semNum].add(slot.subject);
    });
    return Object.entries(sems).map(([num, subjectsSet]) => ({
      semester_number: parseInt(num, 10),
      subject_count: subjectsSet.size
    })).sort((a,b) => a.semester_number - b.semester_number);
  }, [personalSlots, sourceType]);

  // Derived Subjects for Personal PDF
  const personalSubjects = useMemo(() => {
    if (sourceType !== 'personal' || !personalSlots || personalSlots.length === 0) return [];
    const subMap = {};
    personalSlots.forEach((slot, idx) => {
      if (!slot.subject) return;
      const semNum = getSemesterNumber(slot.section);
      if (selectedSemesters.length > 0 && !selectedSemesters.includes(semNum)) return; // Filter by semester

      if (!subMap[slot.subject]) {
        subMap[slot.subject] = {
          subject: slot.subject,
          is_lab: String(slot.subject).toLowerCase().includes('lab'),
          available_sections: [],
          paired_lab: null, // Hard to infer reliably without db, assume null
        };
      }
      let sec = subMap[slot.subject].available_sections.find(s => s.section === slot.section);
      if (!sec) {
        sec = { section: slot.section, teacher: slot.teacher?.name || 'Staff', slots: [] };
        subMap[slot.subject].available_sections.push(sec);
      }
      // Give a mock ID based on index since no DB id exists
      sec.slots.push({ id: idx + 1000000, ...slot });
    });
    return Object.values(subMap);
  }, [personalSlots, sourceType, selectedSemesters]);

  const activeSubjects = sourceType === 'personal' ? personalSubjects : dbSubjects;
  const activeSemesters = sourceType === 'personal' ? personalSemesters : dbSemesters;

  // Auto-select latest version if only 1 exists
  useEffect(() => {
    if (versions.length > 0 && !versionId) {
      const latest = versions.find(v => v.is_latest) || versions[0];
      setVersionId(latest.id);
    }
  }, [versions, versionId]);

  // Pre-select all subjects initially when subjects load
  useEffect(() => {
    if (activeSubjects.length > 0 && selectedSubjects.length === 0) {
      if (activeSubjects.length <= 12 || sourceType === 'university') {
        setSelectedSubjects(activeSubjects.map(s => s.subject));
      }
    }
  }, [activeSubjects, selectedSubjects.length, sourceType]);

  // Generators
  const generateMutation = useMutation({
    mutationFn: () => {
      const formattedSubjects = selectedSubjects.map(subName => ({
        subject: subName,
        preferred_slot_id: subjectPreferences[subName] || null
      }));
      
      const payload = {
        selected_subjects: formattedSubjects,
        soft_preferences: {
          free_day_preference: softPreferences.free_day_preference || null,
          minimize_gaps: softPreferences.minimize_gaps,
          avoid_first_slot: softPreferences.avoid_first_slot,
          avoid_last_slot: softPreferences.avoid_last_slot
        },
        clash_priority: clashPriority
      };

      if (sourceType === 'personal') {
        const teacherMap = {};
        let teacherIdCounter = 1000000;
        payload.custom_slots = personalSlots.map((slot, index) => {
          const tName = (typeof slot.teacher === 'object' ? slot.teacher?.name : slot.teacher) || 'Staff';
          if (!teacherMap[tName]) teacherMap[tName] = teacherIdCounter++;
          const tId = teacherMap[tName];
          return {
            ...slot,
            id: index + 1000000,
            slot_number: slot.slot_number || slot.slot || 0,
            teacher: { id: tId, name: tName },
            teacher_id: tId
          };
        });
      } else {
        payload.version_id = versionId;
      }

      return api.generateSchedule(payload);
    },
    onSuccess: (data) => {
      setResult(data);
      setStep(6);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to generate schedule');
    }
  });

  const enrollMutation = useMutation({
    mutationFn: () => {
      const slotIds = result.schedule.map(s => s.id);
      return api.enrollSchedule(slotIds);
    },
    onSuccess: () => {
      toast.success('Schedule saved successfully!');
      setActiveNav('My Schedule');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to save schedule');
    }
  });

  // Handlers
  const toggleSemester = (semNum) => {
    setSelectedSemesters(prev => 
      prev.includes(semNum) ? prev.filter(s => s !== semNum) : [...prev, semNum]
    );
  };

  const toggleSubject = (subName) => {
    setSelectedSubjects(prev => 
      prev.includes(subName) ? prev.filter(s => s !== subName) : [...prev, subName]
    );
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted/50 rounded-full z-0" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500" 
          style={{ width: `${((step - 1) / 5) * 100}%` }}
        />
        
        {[1,2,3,4,5,6].map((num) => (
          <div 
            key={num} 
            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors font-bold shadow-md
              ${step >= num ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-muted border border-border text-muted-foreground'}
            `}
          >
            {step > num && num !== 6 ? <CheckCircle2 className="w-5 h-5" /> : num}
          </div>
        ))}
      </div>

      <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-xl relative shadow-sm">
        {step === 1 && (
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-6">
            <h2 className="text-2xl font-bold">Step 1: Select Data Source</h2>
            
            {proStatus === 'approved' && isPro && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl flex items-start gap-3 relative shadow-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="font-bold text-foreground">Pro Upgrade Approved!</h3>
                  <p className="text-sm mt-1 text-muted-foreground">Your request has been approved by the admin. You can now use the Personal PDF parser anytime to generate your personal schedule.</p>
                </div>
                <button 
                  className="absolute top-4 right-4 text-emerald-500/60 hover:text-emerald-500"
                  onClick={() => {
                    api.acknowledgeProUpgrade().catch(console.error);
                    setProStatus('none');
                  }}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setSourceType('university')} 
                className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${sourceType === 'university' ? 'border-emerald-500 bg-emerald-500/10 shadow-emerald-500/10' : 'border-border hover:bg-muted/50'}`}
              >
                <Database className={`w-6 h-6 ${sourceType === 'university' ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                <span className={`font-bold ${sourceType === 'university' ? 'text-emerald-500' : 'text-foreground'}`}>University Database</span>
                <span className="text-xs text-muted-foreground">Use the official university schedule</span>
              </button>

              <button 
                onClick={() => {
                  if (!isPro) {
                    if (proStatus === 'pending') {
                      toast.info('Your Pro upgrade request is pending review by an admin.');
                    } else {
                      setIsProModalOpen(true);
                    }
                    return;
                  }
                  setSourceType('personal');
                }} 
                className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${sourceType === 'personal' ? 'border-primary bg-primary/10 shadow-primary/10' : 'border-border hover:bg-muted/50'}`}
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className={`w-6 h-6 ${sourceType === 'personal' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">PRO</span>
                </div>
                <span className={`font-bold ${sourceType === 'personal' ? 'text-primary' : 'text-foreground'}`}>Personal PDF</span>
                <span className="text-xs text-muted-foreground">Upload your own unlisted PDF</span>
              </button>
            </div>

            {sourceType === 'university' ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2 relative z-30">
                  <label className="text-sm font-medium text-muted-foreground">University</label>
                  <CustomSelect 
                    value={uniId} 
                    onChange={(val) => setUniId(val)}
                    placeholder="Select University..."
                    options={universities?.map(u => ({ label: u.name, value: u.id }))}
                  />
                </div>

                <div className="space-y-2 relative z-20">
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <CustomSelect 
                    value={deptId} 
                    onChange={(val) => setDeptId(val)}
                    placeholder="Select Department..."
                    disabled={!uniId}
                    options={departments?.map(d => ({ label: d.name, value: d.id }))}
                  />
                </div>

                <div className="space-y-2 relative z-10">
                  <label className="text-sm font-medium text-muted-foreground">Timetable Version</label>
                  <CustomSelect 
                    value={versionId} 
                    onChange={(val) => setVersionId(val)}
                    placeholder="Select Version..."
                    disabled={!deptId}
                    options={versions?.map(v => ({ label: `${v.semester_label} - ${v.version_label} ${v.is_latest ? '(Latest)' : ''}`, value: v.id }))}
                  />
                </div>

                <button 
                  disabled={!versionId} 
                  onClick={() => setStep(2)}
                  className="mt-6 w-full py-4 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  {cachedExpiry && (
                    <div className="w-full max-w-md p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-6 text-center animate-in fade-in zoom-in duration-300">
                      <div className="flex justify-center items-center gap-2 text-emerald-500 mb-1">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold">Recent Timetable Cached</span>
                      </div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4 font-medium">
                        Your recently parsed timetable is available for <span className="font-bold tabular-nums bg-emerald-500/20 px-1.5 py-0.5 rounded">{timeLeft}</span>.
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStep(2);
                        }}
                        className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
                      >
                        Use Cached Timetable & Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <UploadCloud className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-1">{cachedExpiry ? 'Or parse a new PDF' : 'Drag and drop your PDF here'}</h3>
                  <p className="text-sm text-muted-foreground mb-4">or click below to browse</p>
                  <input 
                    type="file" 
                    id="personal-pdf" 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="personal-pdf" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium cursor-pointer">
                    Browse Files
                  </label>

                  {selectedFile && (
                    <div className="mt-6 p-3 bg-background/50 backdrop-blur rounded-xl border border-border w-full flex items-center justify-between">
                      <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                      <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">Ready</span>
                    </div>
                  )}
                </div>

                <button 
                  disabled={!selectedFile || parseMutation.isPending} 
                  onClick={() => parseMutation.mutate(selectedFile)}
                  className="mt-6 w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 flex justify-center items-center gap-2 shadow-primary/20 shadow-lg"
                >
                  {parseMutation.isPending ? 'Parsing Document...' : 'Upload & Parse PDF'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-6">
            <h2 className="text-2xl font-bold">Step 2: Select Semesters</h2>
            <p className="text-muted-foreground">Select one or more semesters. Select multiple if you are taking repeat/advanced courses.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeSemesters.map(sem => {
                const isSelected = selectedSemesters.includes(sem.semester_number);
                return (
                  <button 
                    key={sem.semester_number}
                    onClick={() => toggleSemester(sem.semester_number)}
                    className={`p-6 rounded-2xl border text-center transition-all ${isSelected ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-muted/30 border-border hover:bg-muted/50'}`}
                  >
                    <div className={`text-xl font-bold ${isSelected ? 'text-emerald-500' : 'text-foreground'}`}>Semester {sem.semester_number}</div>
                    <div className="text-xs text-muted-foreground mt-2">{sem.subject_count} subjects</div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(1)} className="px-6 py-4 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80">Back</button>
              <button 
                disabled={selectedSemesters.length === 0} 
                onClick={() => setStep(3)}
                className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-6">
            <h2 className="text-2xl font-bold">Step 3: Select Subjects</h2>
            <p className="text-muted-foreground">Deselect any subjects you are NOT taking.</p>
            
            {subjectsLoading && sourceType === 'university' ? (
              <div className="p-8 text-center text-muted-foreground">Loading subjects...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {activeSubjects.filter(s => !s.is_lab).map(sub => {
                  const isSelected = selectedSubjects.includes(sub.subject);
                  return (
                    <button 
                      key={sub.subject}
                      onClick={() => toggleSubject(sub.subject)}
                      className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${isSelected ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-background/30 border-border opacity-60'}`}
                    >
                      <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted-foreground'}`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{sub.subject}</div>
                        <div className="text-xs text-muted-foreground mt-1">Available in {sub.available_sections.length} sections</div>
                        {sub.paired_lab && <div className="text-xs text-blue-500 mt-1 font-medium">+ Paired with {sub.paired_lab}</div>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(sourceType === 'personal' ? 1 : 2)} className="px-6 py-4 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80">Back</button>
              <button 
                disabled={selectedSubjects.length === 0} 
                onClick={() => setStep(4)}
                className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-6">
            <h2 className="text-2xl font-bold">Step 4: Teacher & Section Preferences</h2>
            <p className="text-muted-foreground">Pick your preferred teacher for each subject, or leave it as "No Preference".</p>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {activeSubjects.filter(s => selectedSubjects.includes(s.subject)).map(sub => (
                <div key={sub.subject} className="p-5 border border-border bg-muted/20 rounded-2xl">
                  <div className="font-bold text-lg mb-3 flex items-center justify-between">
                    <span>{sub.subject}</span>
                    <span className="text-xs font-normal text-muted-foreground px-2 py-1 bg-muted rounded-md">Sem {sub.semester_number || 'N/A'}</span>
                  </div>
                  
                  {sub.is_lab && activeSubjects.some(s => s.paired_lab === sub.subject) ? (
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500/90 text-sm">
                      <span className="font-semibold block mb-1">Locked by System</span>
                      Theory and related labs are always enrolled in the same section. This lab will automatically follow the section you choose for {activeSubjects.find(s => s.paired_lab === sub.subject).subject}.
                      {subjectPreferences[sub.subject] && (
                        <div className="mt-2 text-xs font-mono bg-amber-500/20 px-2 py-1 rounded inline-block">
                          Currently following: {sub.available_sections.find(sec => sec.slots[0].id === subjectPreferences[sub.subject])?.section || 'No Preference'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-muted/50 ${!subjectPreferences[sub.subject] ? 'border-emerald-500 bg-emerald-500/5' : 'border-transparent'}`}>
                      <input 
                        type="radio" 
                        name={`pref-${sub.subject}`} 
                        checked={!subjectPreferences[sub.subject]}
                        onChange={() => {
                          setSubjectPreferences(p => {
                            const newP = { ...p, [sub.subject]: null };
                            if (sub.paired_lab) {
                              newP[sub.paired_lab] = null;
                            }
                            return newP;
                          });
                        }}
                        className="accent-emerald-500"
                      />
                      <span className="font-medium text-foreground">No preference (System picks best)</span>
                    </label>

                    {sub.available_sections.map((sec, idx) => {
                      // Grab the first slot ID for this section to use as preference ID
                      const slotId = sec.slots[0].id;
                      const isSelected = subjectPreferences[sub.subject] === slotId;
                      return (
                        <label key={slotId || idx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-muted/50 ${isSelected ? 'border-emerald-500 bg-emerald-500/5' : 'border-transparent'}`}>
                          <input 
                            type="radio" 
                            name={`pref-${sub.subject}`} 
                            checked={isSelected}
                            onChange={() => {
                              setSubjectPreferences(p => {
                                const newP = { ...p, [sub.subject]: slotId };
                                if (sub.paired_lab) {
                                  const labSub = activeSubjects.find(s => s.subject === sub.paired_lab);
                                  if (labSub) {
                                    const labSec = labSub.available_sections.find(s => s.section === sec.section);
                                    if (labSec) {
                                      newP[sub.paired_lab] = labSec.slots[0].id;
                                    } else {
                                      newP[sub.paired_lab] = null;
                                    }
                                  }
                                }
                                return newP;
                              });
                            }}
                            className="accent-emerald-500"
                          />
                          <div className="flex-1 flex justify-between items-center text-sm">
                            <span className="font-medium text-foreground">{sec.teacher}</span>
                            <div className="flex gap-3 text-muted-foreground text-xs">
                              <span className="font-bold">{sec.section}</span>
                              <span>{sec.slots.map(s => `${s.day.substring(0,3)} ${formatTime12Hour(s.start_time)} (${s.room || 'TBA'})`).join(', ')}</span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(3)} className="px-6 py-4 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80">Back</button>
              <button 
                onClick={() => setStep(5)}
                className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 flex justify-center items-center gap-2"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-6">
            <h2 className="text-2xl font-bold">Step 5: Soft Preferences</h2>
            <p className="text-muted-foreground">These are entirely optional. The algorithm will try to accommodate them without causing clashes.</p>
            
            <div className="p-6 rounded-2xl bg-muted/20 border border-border space-y-4 mb-6">
              <h3 className="font-bold text-foreground">Clash Resolution Priority</h3>
              <p className="text-sm text-muted-foreground mb-4">If your preferred teacher clashes with your schedule, what should we prioritize?</p>
              
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${clashPriority === 'teacher' ? 'border-emerald-500 bg-emerald-500/5 shadow-sm' : 'border-border hover:bg-muted/50'}`}>
                <input 
                  type="radio" 
                  name="clash-priority" 
                  value="teacher"
                  checked={clashPriority === 'teacher'}
                  onChange={() => setClashPriority('teacher')}
                  className="w-5 h-5 accent-emerald-500"
                />
                <div>
                  <div className="font-bold text-foreground">Prioritize Teacher</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Try to find another time slot with the same teacher, even if it hurts your soft preferences.</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${clashPriority === 'time' ? 'border-emerald-500 bg-emerald-500/5 shadow-sm' : 'border-border hover:bg-muted/50'}`}>
                <input 
                  type="radio" 
                  name="clash-priority" 
                  value="time"
                  checked={clashPriority === 'time'}
                  onChange={() => setClashPriority('time')}
                  className="w-5 h-5 accent-emerald-500"
                />
                <div>
                  <div className="font-bold text-foreground">Prioritize Time & Schedule</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Drop the teacher preference and find a section that best fits your time and day preferences.</div>
                </div>
              </label>
            </div>

            <div className="p-6 rounded-2xl bg-muted/20 border border-border space-y-6">
              <div className="space-y-2 relative z-30">
                <label className="text-sm font-medium text-foreground">Free Day Preference</label>
                <CustomSelect 
                  value={softPreferences.free_day_preference}
                  onChange={val => setSoftPreferences(p => ({...p, free_day_preference: val}))}
                  placeholder="No preference"
                  options={[
                    { label: "Monday", value: "Monday" },
                    { label: "Tuesday", value: "Tuesday" },
                    { label: "Wednesday", value: "Wednesday" },
                    { label: "Thursday", value: "Thursday" },
                    { label: "Friday", value: "Friday" },
                  ]}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={softPreferences.minimize_gaps}
                  onChange={e => setSoftPreferences(p => ({...p, minimize_gaps: e.target.checked}))}
                  className="w-5 h-5 rounded border-muted-foreground accent-emerald-500"
                />
                <span className="font-medium">Minimize gaps between classes</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={softPreferences.avoid_first_slot}
                  onChange={e => setSoftPreferences(p => ({...p, avoid_first_slot: e.target.checked}))}
                  className="w-5 h-5 rounded border-muted-foreground accent-emerald-500"
                />
                <span className="font-medium">Avoid 8:00 AM classes</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={softPreferences.avoid_last_slot}
                  onChange={e => setSoftPreferences(p => ({...p, avoid_last_slot: e.target.checked}))}
                  className="w-5 h-5 rounded border-muted-foreground accent-emerald-500"
                />
                <span className="font-medium">Avoid late afternoon classes</span>
              </label>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(4)} className="px-6 py-4 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80">Back</button>
              <button 
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20 hover:-translate-y-1 transition-all"
              >
                {generateMutation.isPending ? 'Resolving Schedule...' : 'Generate My Timetable'} <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && result && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Schedule Generated</h2>
              <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 font-bold rounded-xl border border-emerald-500/20">
                Match Score: {safeRender(result.score)}%
              </div>
            </div>

            {/* Match Summary */}
            <div className="p-5 rounded-2xl bg-muted/20 border border-border">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-foreground"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Match Summary</h3>
              <div className="space-y-2 text-sm">
                {result.match_summary.map((match, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="shrink-0 pt-0.5">
                      {match.match_type === 'perfect' ? '✅' : match.match_type === 'unresolvable' ? '❌' : '⚠️'}
                    </div>
                    <div>
                      <span className="font-bold text-foreground">{safeRender(match.subject)}</span>
                      <span className="text-muted-foreground ml-2">— {safeRender(match.note)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unresolvable Warning */}
            {result.unresolvable?.length > 0 && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Clash Detected</div>
                  <div className="text-sm">The following subjects could not be scheduled without a conflict: {result.unresolvable.join(', ')}. Try adjusting your preferences.</div>
                </div>
              </div>
            )}

            {/* Grid Preview */}
            <div className="border border-border rounded-xl overflow-hidden bg-background">
               <div className="p-4 bg-muted/50 border-b border-border font-bold text-foreground">Schedule Preview</div>
               <div className="p-4 space-y-3 max-h-[40vh] overflow-y-auto">
                 {result.schedule.sort((a,b) => (a.day+a.start_time).localeCompare(b.day+b.start_time)).map((s, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-muted/30 rounded-lg border border-border/50 text-sm">
                       <div className="w-32 font-bold text-emerald-600 dark:text-emerald-400">
                         {safeRender(s.day).substring(0,3)} {formatTime12Hour(safeRender(s.start_time))}
                       </div>
                       <div className="flex-1 text-foreground font-semibold">
                         {safeRender(s.subject)} <span className="text-muted-foreground ml-1 font-normal">({safeRender(s.section)}) - {safeRender(s.room) || 'TBA'}</span>
                       </div>
                       <div className="text-muted-foreground">{safeRender(s.teacher)}</div>
                    </div>
                 ))}
               </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => setStep(4)} className="px-6 py-4 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 flex items-center gap-2">
                 <ArrowLeft className="w-4 h-4" /> Adjust Preferences
              </button>
              <button 
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending || sourceType === 'personal'}
                className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg hover:-translate-y-1 transition-all"
              >
                {sourceType === 'personal' ? 'Cannot Save Personal PDF (View Only)' : (enrollMutation.isPending ? 'Saving...' : 'Confirm & Save Schedule')} {!sourceType === 'personal' && <CheckCircle2 className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      <ProUpgradeModal 
        isOpen={isProModalOpen} 
        onClose={() => setIsProModalOpen(false)} 
        onSuccess={() => {
          setIsProModalOpen(false);
          setProStatus('pending');
        }} 
      />
    </div>
  );
};

function safeRender(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return val.name || JSON.stringify(val);
  return String(val);
}

function formatTime12Hour(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

export default GenerateTimetableWizard;
