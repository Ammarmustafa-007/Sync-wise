import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomSelect } from "./ui/CustomSelect";
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, ArrowLeft, UploadCloud, Database, Calendar, Clock, MapPin, Users, Coins, Crown, RefreshCw } from 'lucide-react';
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
  const [savedSchedule, setSavedSchedule] = useState(null);

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
  const tokenQueryKey = useMemo(
    () => ['schedule_tokens', sourceType, sourceType === 'university' ? versionId || 'no-version' : 'current'],
    [sourceType, versionId]
  );
  const {
    data: tokenStatus,
    isFetching: tokenStatusLoading,
  } = useQuery({
    queryKey: tokenQueryKey,
    queryFn: () => api.getTokenStatus(sourceType === 'university' ? { versionId } : {}),
    enabled: !!user && (sourceType === 'personal' || !!versionId),
  });
  const generationCost = tokenStatus?.generation_cost || 100;
  const hasGenerationTokens = !tokenStatus || tokenStatus.tokens_remaining >= generationCost;
  const labToTheoryMap = useMemo(() => {
    const map = {};
    activeSubjects.forEach(sub => {
      if (sub.paired_lab) map[sub.paired_lab] = sub.subject;
    });
    return map;
  }, [activeSubjects]);

  const getControlledSelectedSubjects = (subjects) => {
    const selectedSet = new Set(subjects);
    const controlled = new Set();

    activeSubjects.forEach(sub => {
      if (sub.is_lab) {
        const theorySubject = labToTheoryMap[sub.subject];
        if (theorySubject && selectedSet.has(theorySubject)) {
          controlled.add(sub.subject);
        }
        return;
      }

      if (selectedSet.has(sub.subject)) {
        controlled.add(sub.subject);
        if (sub.paired_lab) controlled.add(sub.paired_lab);
      }
    });

    return Array.from(controlled);
  };

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

  // Keep selected subjects and preferences aligned with the currently visible subjects.
  // This prevents stale selections from earlier semester/source changes reaching the resolver.
  useEffect(() => {
    const activeSubjectNames = new Set(activeSubjects.map(s => s.subject));

    setSelectedSubjects(prev => {
      const pruned = getControlledSelectedSubjects(
        [...new Set(prev)].filter(subName => activeSubjectNames.has(subName))
      );
      return pruned.length === prev.length && pruned.every((subName, idx) => subName === prev[idx])
        ? prev
        : pruned;
    });

    setSubjectPreferences(prev => {
      const next = {};
      Object.entries(prev).forEach(([subName, slotId]) => {
        if (activeSubjectNames.has(subName)) next[subName] = slotId;
      });
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  }, [activeSubjects, labToTheoryMap]);

  // Generators
  const generateMutation = useMutation({
    mutationFn: () => {
      const activeSubjectNames = new Set(activeSubjects.map(s => s.subject));
      const currentSelectedSubjects = getControlledSelectedSubjects(
        [...new Set(selectedSubjects)].filter(subName => activeSubjectNames.has(subName))
      );

      const formattedSubjects = currentSelectedSubjects.map(subName => ({
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
      if (data?.token_status) {
        queryClient.setQueryData(tokenQueryKey, data.token_status);
        queryClient.invalidateQueries({ queryKey: ['semester_tokens'] });
      }
      setResult(data);
      setSavedSchedule(null);
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
      setSavedSchedule(result?.schedule || []);
      queryClient.invalidateQueries({ queryKey: ['my_schedule'] });
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
    if (labToTheoryMap[subName]) return;

    setSelectedSubjects(prev => {
      const selectedSet = new Set(prev);
      const subject = activeSubjects.find(s => s.subject === subName);
      if (selectedSet.has(subName)) {
        selectedSet.delete(subName);
        if (subject?.paired_lab) selectedSet.delete(subject.paired_lab);
      } else {
        selectedSet.add(subName);
        if (subject?.paired_lab) selectedSet.add(subject.paired_lab);
      }
      return getControlledSelectedSubjects(Array.from(selectedSet));
    });
    setSubjectPreferences(prev => {
      const subject = activeSubjects.find(s => s.subject === subName);
      if (!(subName in prev) && !subject?.paired_lab) return prev;
      const { [subName]: _removed, [subject?.paired_lab]: _removedLab, ...rest } = prev;
      return rest;
    });
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`space-y-8 mx-auto pb-20 ${step === 6 ? 'max-w-7xl' : 'max-w-4xl'}`}>
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

      <TokenBalanceCard
        tokenStatus={tokenStatus}
        isLoading={tokenStatusLoading}
        isPro={isPro}
        onUpgrade={() => setIsProModalOpen(true)}
      />

      <div className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-xl relative shadow-sm">
        {step === 1 && (
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="space-y-6">
            <h2 className="text-2xl font-bold">Step 1: Select Data Source</h2>
            
            {proStatus === 'approved' && isPro && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 rounded-xl flex items-start gap-3 relative shadow-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="font-bold text-foreground">Pro Upgrade Approved!</h3>
                  <p className="text-sm mt-1 text-muted-foreground">Your request has been approved by the admin. Your semester wallet now supports 500 tokens, giving you up to five schedule generations when enrollment choices change.</p>
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
                {activeSubjects.map(sub => {
                  const controllingTheory = labToTheoryMap[sub.subject];
                  const isLockedLab = Boolean(controllingTheory);
                  const controlledSelectedSubjects = getControlledSelectedSubjects(selectedSubjects);
                  const isSelected = controlledSelectedSubjects.includes(sub.subject);
                  return (
                    <button 
                      key={sub.subject}
                      type="button"
                      onClick={() => !isLockedLab && toggleSubject(sub.subject)}
                      className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all ${isSelected ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-background/30 border-border opacity-60'} ${isLockedLab ? 'cursor-not-allowed' : ''}`}
                      aria-disabled={isLockedLab}
                    >
                      <div className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted-foreground'}`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-2">
                          {sub.subject}
                          {isLockedLab && <span className="text-[10px] uppercase tracking-wide text-blue-500 border border-blue-500/30 rounded-full px-2 py-0.5">Lab</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Available in {sub.available_sections.length} sections</div>
                        {sub.paired_lab && <div className="text-xs text-blue-500 mt-1 font-medium">+ Paired with {sub.paired_lab}</div>}
                        {isLockedLab && (
                          <div className="text-xs text-blue-500 mt-1 font-medium">
                            Follows {controllingTheory}. Select or deselect the theory to control this lab.
                          </div>
                        )}
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
                disabled={generateMutation.isPending || tokenStatusLoading || !hasGenerationTokens}
                className="flex-1 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20 hover:-translate-y-1 transition-all"
              >
                {generateMutation.isPending
                  ? 'Resolving Schedule...'
                  : !hasGenerationTokens
                    ? 'No Semester Tokens Remaining'
                    : `Generate My Timetable (-${generationCost} tokens)`}
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && result && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="space-y-6">
            {savedSchedule ? (
              <SavedScheduleCelebration
                schedule={savedSchedule}
                score={result.score}
                enrolledCount={savedSchedule.length}
                onViewSchedule={() => setActiveNav('My Schedule')}
                onAdjust={() => {
                  setSavedSchedule(null);
                  setStep(4);
                }}
              />
            ) : (
              <>
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

                <ScheduleGridCard
                  title="Schedule Preview"
                  subtitle="Review the weekly layout before locking this timetable."
                  schedule={result.schedule}
                  score={result.score}
                  footerNote="Preview layout is ready for review"
                />

                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep(4)} className="px-6 py-4 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 flex items-center gap-2">
                     <ArrowLeft className="w-4 h-4" /> Adjust Preferences
                  </button>
                  <button 
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending || sourceType === 'personal'}
                    className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg hover:-translate-y-1 transition-all"
                  >
                    {sourceType === 'personal' ? 'Cannot Save Personal PDF (View Only)' : (enrollMutation.isPending ? 'Saving...' : 'Confirm & Save Schedule')} {sourceType !== 'personal' && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                </div>
              </>
            )}
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

function TokenBalanceCard({ tokenStatus, isLoading, isPro, onUpgrade }) {
  const plan = tokenStatus?.plan || (isPro ? 'pro' : 'free');
  const proPlan = plan === 'pro';
  const allowance = tokenStatus?.tokens_awarded || (proPlan ? 500 : 100);
  const cost = tokenStatus?.generation_cost || 100;
  const remaining = tokenStatus?.tokens_remaining ?? allowance;
  const attemptsRemaining = tokenStatus?.attempts_remaining ?? Math.floor(remaining / cost);
  const used = Math.max(0, allowance - remaining);
  const usedPercent = allowance > 0 ? Math.min(100, Math.round((used / allowance) * 100)) : 0;

  return (
    <div className={`overflow-hidden rounded-3xl border shadow-xl ${proPlan ? 'border-amber-300 bg-amber-50 text-amber-950 shadow-amber-500/10 dark:border-amber-700 dark:bg-amber-950/35 dark:text-amber-50' : 'border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-500/10 dark:border-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-50'}`}>
      <div className={`h-1.5 ${proPlan ? 'bg-amber-500' : 'bg-emerald-600'}`} />
      <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_auto] lg:items-center">
        <div className="flex gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${proPlan ? 'bg-amber-500 shadow-amber-500/25' : 'bg-emerald-600 shadow-emerald-600/25'}`}>
            {proPlan ? <Crown className="h-6 w-6" /> : <Coins className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black">{proPlan ? 'Pro semester wallet' : 'Free semester wallet'}</h3>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white ${proPlan ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                {proPlan ? '500 tokens' : '100 tokens'}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium opacity-80">
              {proPlan
                ? 'You can regenerate up to five times this semester when seats get booked or your selections change.'
                : 'One generation costs 100 tokens, so the free plan gives you one careful schedule generation this semester.'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-black/20">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-black leading-none">{isLoading ? '--' : remaining}</div>
              <div className="mt-1 text-[11px] font-black uppercase tracking-wide opacity-60">tokens left</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black">{isLoading ? '--' : attemptsRemaining}</div>
              <div className="mt-1 text-[11px] font-black uppercase tracking-wide opacity-60">attempts left</div>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className={`h-full rounded-full ${proPlan ? 'bg-amber-500' : 'bg-emerald-600'}`}
              style={{ width: `${100 - usedPercent}%` }}
            />
          </div>
        </div>

        {proPlan ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/80 px-4 py-3 text-sm font-black shadow-sm dark:bg-black/20">
            <RefreshCw className="h-4 w-4" />
            Realtime enrollment ready
          </div>
        ) : (
          <button
            type="button"
            onClick={onUpgrade}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Upgrade for 5 attempts
          </button>
        )}
      </div>
    </div>
  );
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FALLBACK_TIME_SLOTS = [
  { start_time: '08:00:00', end_time: '09:15:00' },
  { start_time: '09:30:00', end_time: '10:45:00' },
  { start_time: '11:00:00', end_time: '12:15:00' },
  { start_time: '12:30:00', end_time: '13:45:00' },
  { start_time: '14:00:00', end_time: '15:15:00' },
  { start_time: '15:30:00', end_time: '16:45:00' },
];

const CLASS_STYLES = [
  'bg-emerald-600 border-emerald-700 text-white',
  'bg-blue-600 border-blue-700 text-white',
  'bg-violet-600 border-violet-700 text-white',
  'bg-amber-400 border-amber-500 text-slate-950',
  'bg-rose-600 border-rose-700 text-white',
  'bg-cyan-600 border-cyan-700 text-white',
  'bg-slate-800 border-slate-900 text-white',
  'bg-fuchsia-600 border-fuchsia-700 text-white',
];

function normalizeTime(timeStr) {
  if (!timeStr) return '';
  const [h = '00', m = '00', s = '00'] = String(timeStr).split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
}

function minutesFromTime(timeStr) {
  const [h = '0', m = '0'] = normalizeTime(timeStr).split(':');
  return Number(h) * 60 + Number(m);
}

function getSubjectHash(subject) {
  return String(subject || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildTimeSlots(schedule = []) {
  const slotsByStart = new Map();
  FALLBACK_TIME_SLOTS.forEach(slot => {
    slotsByStart.set(slot.start_time, slot);
  });

  schedule.forEach(slot => {
    const start = normalizeTime(slot.start_time);
    if (!start) return;
    slotsByStart.set(start, {
      start_time: start,
      end_time: normalizeTime(slot.end_time) || slotsByStart.get(start)?.end_time || '',
    });
  });

  return Array.from(slotsByStart.values()).sort((a, b) => minutesFromTime(a.start_time) - minutesFromTime(b.start_time));
}

function getScheduleStats(schedule = []) {
  const subjects = new Set(schedule.map(s => s.subject).filter(Boolean));
  const sections = new Set(schedule.map(s => s.section).filter(Boolean));
  const busyDays = new Set(schedule.map(s => s.day).filter(Boolean));
  const freeDays = WEEK_DAYS.filter(day => !busyDays.has(day));

  return {
    subjects: subjects.size,
    meetings: schedule.length,
    sections: sections.size,
    freeDays,
  };
}

function ScheduleGridCard({ title, subtitle, schedule = [], score, footerNote = 'Weekly layout is ready' }) {
  const timeSlots = buildTimeSlots(schedule);
  const stats = getScheduleStats(schedule);
  const gridTemplateColumns = `82px repeat(${timeSlots.length}, minmax(0, 1fr))`;
  const scoreValue = score === null || score === undefined ? '--' : `${safeRender(score)}%`;
  const sortedSchedule = [...schedule].sort((a, b) =>
    `${a.day}-${normalizeTime(a.start_time)}`.localeCompare(`${b.day}-${normalizeTime(b.start_time)}`)
  );

  const renderDayCells = (day) => {
    const daySchedule = sortedSchedule.filter(slot => slot.day === day);
    const cells = [];

    for (let idx = 0; idx < timeSlots.length; idx += 1) {
      const timeSlot = timeSlots[idx];
      const classSlot = daySchedule.find(slot => normalizeTime(slot.start_time) === timeSlot.start_time);

      if (!classSlot) {
        cells.push(
          <div key={`${day}-${timeSlot.start_time}`} className="min-h-[62px] rounded-lg border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60" />
        );
        continue;
      }

      const span = Math.max(1, Math.min(Number(classSlot.col_span) || 1, timeSlots.length - idx));
      const style = CLASS_STYLES[getSubjectHash(classSlot.subject) % CLASS_STYLES.length];
      cells.push(
        <div
          key={`${day}-${classSlot.id || classSlot.subject}-${timeSlot.start_time}`}
          style={{ gridColumn: `span ${span}` }}
          className={`min-h-[62px] overflow-hidden rounded-lg border p-2 shadow-sm ${style}`}
        >
          <div className="flex items-start justify-between gap-1">
            <div className="truncate text-[13px] font-black leading-tight">{safeRender(classSlot.subject)}</div>
            {String(classSlot.slot_type || '').toLowerCase() === 'lab' && (
              <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide">Lab</span>
            )}
          </div>
          <div className="mt-1.5 space-y-0.5 text-[10px] font-semibold leading-tight opacity-95">
            <div className="flex items-center gap-1.5">
              <Clock className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{formatTime12Hour(classSlot.start_time)} - {formatTime12Hour(classSlot.end_time)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{safeRender(classSlot.room) || 'TBA'} · {safeRender(classSlot.section)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{classSlot.teacher?.name || safeRender(classSlot.teacher) || 'Staff'}</span>
            </div>
          </div>
        </div>
      );
      idx += span - 1;
    }

    return cells;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-emerald-700 bg-emerald-600 p-4 text-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white">
              <Calendar className="h-3 w-3" />
              Weekly Timetable
            </div>
            <h3 className="mt-2 text-2xl font-black leading-tight text-white">{title}</h3>
            <p className="mt-0.5 text-sm font-medium text-emerald-50">{subtitle}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill label="Score" value={scoreValue} />
            <StatPill label="Subjects" value={stats.subjects} />
            <StatPill label="Meetings" value={stats.meetings} />
            <StatPill label="Sections" value={stats.sections} />
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="grid bg-slate-900 text-[11px] font-black uppercase tracking-wide text-white" style={{ gridTemplateColumns }}>
            <div className="border-r border-slate-700 p-2">Day</div>
            {timeSlots.map(slot => (
              <div key={slot.start_time} className="border-r border-slate-700 p-2 text-center last:border-r-0">
                <div>{formatTime12Hour(slot.start_time)}</div>
                <div className="mt-0.5 text-[9px] font-semibold normal-case text-slate-300">to {formatTime12Hour(slot.end_time)}</div>
              </div>
            ))}
          </div>

          {WEEK_DAYS.map((day, idx) => (
            <div
              key={day}
              className={`grid items-stretch gap-1.5 border-t border-slate-200 p-1.5 dark:border-slate-800 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900/70'}`}
              style={{ gridTemplateColumns }}
            >
              <div className="flex min-h-[62px] items-center justify-center rounded-lg border border-slate-200 bg-white px-1 text-center text-[13px] font-black text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <span className="hidden xl:inline">{day}</span>
                <span className="xl:hidden">{day.slice(0, 3)}</span>
              </div>
              {renderDayCells(day)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          Free days: <span className="font-black text-slate-950 dark:text-white">{stats.freeDays.length ? stats.freeDays.join(', ') : 'None'}</span>
        </span>
        <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black text-white">
          {footerNote}
        </span>
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl bg-white px-4 py-2 text-center text-slate-950 shadow-sm">
      <div className="text-lg font-black leading-tight">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function SavedScheduleCelebration({ schedule, score, enrolledCount, onViewSchedule, onAdjust }) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/20 via-background to-cyan-500/10 p-7 shadow-2xl shadow-emerald-500/10">
        <div className="absolute -right-14 -top-20 h-52 w-52 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-500 p-4 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-foreground">Schedule Saved</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Your enrollment is locked. Teachers can now see your subject and section enrollments for makeup class planning.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-500/25 bg-background/70 px-5 py-4 text-center">
            <div className="text-3xl font-black text-emerald-500">{enrolledCount}</div>
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Saved meetings</div>
          </div>
        </div>
      </div>

      <ScheduleGridCard
        title="Your Locked Weekly Schedule"
        subtitle="A clean grid view of the timetable that was saved to your enrollment record."
        schedule={schedule}
        score={score}
        footerNote="Saved layout is ready for teacher makeup planning"
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onAdjust}
          className="px-6 py-4 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Adjust and Resave
        </button>
        <button
          onClick={onViewSchedule}
          className="flex-1 py-4 bg-foreground text-background rounded-xl font-bold hover:bg-foreground/90 flex justify-center items-center gap-2 shadow-lg hover:-translate-y-1 transition-all"
        >
          Go to My Schedule <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

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
