import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Users, Clock, CheckCircle2, XCircle, MapPin, ArrowRight } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_SEMESTERS = [
  { id: 'sem-1', label: 'Spring 2024 (Latest)' },
  { id: 'sem-2', label: 'Fall 2023' },
];

const MOCK_SECTIONS = [
  { id: 'sec-1', label: 'CS-4A (Database Systems)' },
  { id: 'sec-2', label: 'SE-3B (Software Eng.)' },
];

const MOCK_STUDENTS = [
  { id: 1, name: 'Ali Khan', email: 'ali.student@edu.pk', schedule: [true, false, true, true, true, false] },
  { id: 2, name: 'Ayesha Tariq', email: 'ayesha.student@edu.pk', schedule: [true, true, false, true, true, true] },
  { id: 3, name: 'Bilal Ahmed', email: 'bilal.student@edu.pk', schedule: [false, true, true, true, false, true] },
  { id: 4, name: 'Sara Raza', email: 'sara.student@edu.pk', schedule: [true, true, true, false, true, true] },
  { id: 5, name: 'Zain Malik', email: 'zain.student@edu.pk', schedule: [true, false, false, true, true, true] },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SLOTS = [
  { id: 1, time: '8:00 - 9:15' },
  { id: 2, time: '9:30 - 10:45' },
  { id: 3, time: '11:00 - 12:15' },
  { id: 4, time: '12:30 - 1:45' },
  { id: 5, time: '2:00 - 3:15' },
  { id: 6, time: '3:30 - 4:45' },
];

const MOCK_AVAILABILITY = {
  free: [
    { name: 'Ali Khan' }, { name: 'Ayesha Tariq' }, { name: 'Sara Raza' },
    // ... representing 18 students
  ],
  busy: [
    { name: 'Bilal Ahmed', clash: 'Operating Systems (CS-4A)' },
    { name: 'Zain Malik', clash: 'Linear Algebra (MT-201)' },
  ],
  rooms: [
    { name: 'Room 302', building: 'Block A', capacity: 50 },
    { name: 'Lab 1', building: 'CS Dept', capacity: 45 },
  ]
};


const TeacherPortal = () => {
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCheckAvailability = () => {
    if (selectedDay !== null && selectedSlot !== null) {
      setChecking(true);
      setShowResults(false);
      // Simulate API call
      setTimeout(() => {
        setChecking(false);
        setShowResults(true);
      }, 800);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      
      {/* SCREEN 1: SECTION SELECTOR */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            Class Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Semester Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Select Semester</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="" disabled>Choose semester...</option>
                  {MOCK_SEMESTERS.map(sem => (
                    <option key={sem.id} value={sem.id}>{sem.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Section Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Select Section</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer disabled:opacity-50"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedSemester}
                >
                  <option value="" disabled>Choose section...</option>
                  {MOCK_SECTIONS.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Students List */}
        <AnimatePresence>
          {selectedSection && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-0"
            >
              <div className="px-6 py-4 border-b border-border bg-background flex justify-between items-center">
                <h3 className="font-semibold text-foreground">Enrolled Students ({MOCK_STUDENTS.length})</h3>
                <div className="text-xs text-muted-foreground flex gap-4">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Free</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Busy</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/20 text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 font-medium">Student</th>
                      <th className="px-6 py-3 font-medium text-center">Weekly Availability (Mon-Sat)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_STUDENTS.map((student, idx) => (
                      <motion.tr 
                        key={student.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-background hover:bg-muted/10 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-1.5">
                            {student.schedule.map((isFree, dayIdx) => (
                              <div 
                                key={dayIdx} 
                                className={`w-2.5 h-2.5 rounded-full ${isFree ? 'bg-emerald-500' : 'bg-red-500'} shadow-sm`}
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
      </motion.div>

      {/* SCREEN 2: MAKEUP CLASS PLANNER */}
      <AnimatePresence>
        {selectedSection && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-border bg-muted/30">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Makeup Class Planner
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Find the best time for an extra class without clashing with students' core subjects.</p>
            </div>

            <div className="p-6 space-y-8">
              {/* Day Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Select Day</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(idx)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedDay === idx 
                          ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slot Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Select Slot</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
                        selectedSlot === slot.id 
                          ? 'bg-primary/10 border-primary text-primary scale-105' 
                          : 'bg-background border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      <span className="font-bold">Slot {slot.id}</span>
                      <span className="text-xs opacity-80">{slot.time}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Check Action */}
              <div className="pt-4 flex justify-end border-t border-border">
                <button 
                  onClick={handleCheckAvailability}
                  disabled={selectedDay === null || selectedSlot === null || checking}
                  className="px-6 py-3 bg-foreground text-background rounded-xl font-medium flex items-center gap-2 hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {checking ? (
                    <span className="animate-pulse">Analyzing schedules...</span>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      Check Availability
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Card */}
            <AnimatePresence>
              {showResults && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-background border-t border-border"
                >
                  <div className="p-6 space-y-6">
                    {/* Header stat */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                      <div className="p-3 bg-background rounded-full shadow-sm">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">18 / 20 students free</div>
                        <div className="text-sm opacity-80">This is a highly optimal slot for a makeup class.</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Free Students */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-emerald-600 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Free ({MOCK_AVAILABILITY.free.length + 15})
                        </h4>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                          {MOCK_AVAILABILITY.free.map((s, i) => (
                            <div key={i} className="text-sm px-3 py-2 bg-muted/30 rounded-lg text-foreground">
                              {s.name}
                            </div>
                          ))}
                          <div className="text-sm px-3 py-2 text-muted-foreground italic">...and 15 more</div>
                        </div>
                      </div>

                      {/* Busy Students */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-red-500 flex items-center gap-2">
                          <XCircle className="w-4 h-4" /> Busy ({MOCK_AVAILABILITY.busy.length})
                        </h4>
                        <div className="space-y-2">
                          {MOCK_AVAILABILITY.busy.map((s, i) => (
                            <div key={i} className="text-sm px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg flex flex-col gap-0.5">
                              <span className="font-medium text-foreground">{s.name}</span>
                              <span className="text-xs text-red-500/80">{s.clash}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Available Rooms */}
                    <div className="pt-4 border-t border-border space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Available Rooms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {MOCK_AVAILABILITY.rooms.map((room, i) => (
                          <div key={i} className="px-3 py-2 bg-background border border-border rounded-lg shadow-sm flex items-center gap-2 text-sm">
                            <span className="font-bold text-foreground">{room.name}</span>
                            <span className="text-muted-foreground">({room.building})</span>
                            <span className="px-1.5 py-0.5 bg-muted rounded text-xs ml-1">Cap: {room.capacity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                        Looks good, proceed
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherPortal;
