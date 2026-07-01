import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

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

function safeRender(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return val.name || JSON.stringify(val);
  return String(val);
}

export function formatTime12Hour(timeStr) {
  if (!timeStr) return '';
  const [h, m] = String(timeStr).split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

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

function StatPill({ label, value }) {
  return (
    <div className="rounded-lg bg-white px-3 py-1.5 text-center text-slate-950 shadow-sm">
      <div className="text-base font-black leading-tight">{value}</div>
      <div className="text-[8px] font-black uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function ScheduleGridCard({ title, subtitle, schedule = [], score, scoreLabel, footerNote = 'Weekly layout is ready' }) {
  const timeSlots = buildTimeSlots(schedule);
  const stats = getScheduleStats(schedule);
  const gridTemplateColumns = `66px repeat(${timeSlots.length}, minmax(0, 1fr))`;
  const scoreValue = scoreLabel || (score === null || score === undefined ? '--' : `${safeRender(score)}%`);
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
          <div key={`${day}-${timeSlot.start_time}`} className="min-h-[70px] rounded-lg border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60" />
        );
        continue;
      }

      const span = Math.max(1, Math.min(Number(classSlot.col_span) || 1, timeSlots.length - idx));
      const style = CLASS_STYLES[getSubjectHash(classSlot.subject) % CLASS_STYLES.length];
      cells.push(
        <div
          key={`${day}-${classSlot.id || classSlot.subject}-${timeSlot.start_time}`}
          style={{ gridColumn: `span ${span}` }}
          className={`min-h-[70px] rounded-lg border p-2 shadow-sm ${style}`}
        >
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 break-words text-[12px] font-black leading-tight">{safeRender(classSlot.subject)}</div>
            {String(classSlot.slot_type || '').toLowerCase() === 'lab' && (
              <span className="shrink-0 rounded-full bg-white/25 px-1 py-0.5 text-[8px] font-black uppercase tracking-wide">Lab</span>
            )}
          </div>
          <div className="mt-1 space-y-0.5 text-[8.5px] font-semibold leading-tight opacity-95">
            <div className="flex items-start gap-1">
              <Clock className="mt-px h-2.5 w-2.5 shrink-0" />
              <span className="min-w-0 break-words">{formatTime12Hour(classSlot.start_time)} - {formatTime12Hour(classSlot.end_time)}</span>
            </div>
            <div className="flex items-start gap-1">
              <MapPin className="mt-px h-2.5 w-2.5 shrink-0" />
              <span className="min-w-0 break-words">{safeRender(classSlot.room) || 'TBA'} · {safeRender(classSlot.section)}</span>
            </div>
            <div className="flex items-start gap-1">
              <Users className="mt-px h-2.5 w-2.5 shrink-0" />
              <span className="min-w-0 break-words">{classSlot.teacher?.name || safeRender(classSlot.teacher) || 'Staff'}</span>
            </div>
          </div>
        </div>
      );
      idx += span - 1;
    }

    return cells;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-emerald-700 bg-emerald-600 p-3 text-white">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
              <Calendar className="h-2.5 w-2.5" />
              Weekly Timetable
            </div>
            <h3 className="mt-1 text-xl font-black leading-tight text-white">{title}</h3>
            <p className="mt-0.5 text-xs font-medium text-emerald-50">{subtitle}</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <StatPill label="Score" value={scoreValue} />
            <StatPill label="Subjects" value={stats.subjects} />
            <StatPill label="Meetings" value={stats.meetings} />
            <StatPill label="Sections" value={stats.sections} />
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="grid bg-slate-900 text-[9px] font-black uppercase tracking-wide text-white" style={{ gridTemplateColumns }}>
            <div className="border-r border-slate-700 p-1.5">Day</div>
            {timeSlots.map(slot => (
              <div key={slot.start_time} className="border-r border-slate-700 p-1.5 text-center last:border-r-0">
                <div>{formatTime12Hour(slot.start_time)}</div>
                <div className="mt-0.5 text-[8px] font-semibold normal-case text-slate-300">to {formatTime12Hour(slot.end_time)}</div>
              </div>
            ))}
          </div>

          {WEEK_DAYS.map((day, idx) => (
            <div
              key={day}
              className={`grid items-stretch gap-1 border-t border-slate-200 p-1 dark:border-slate-800 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900/70'}`}
              style={{ gridTemplateColumns }}
            >
              <div className="flex min-h-[70px] items-center justify-center rounded-lg border border-slate-200 bg-white px-1 text-center text-[10px] font-black text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white">
                <span className="hidden 2xl:inline">{day}</span>
                <span className="2xl:hidden">{day.slice(0, 3)}</span>
              </div>
              {renderDayCells(day)}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-3 py-2 text-[10px] dark:border-slate-800 dark:bg-slate-900">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          Free days: <span className="font-black text-slate-950 dark:text-white">{stats.freeDays.length ? stats.freeDays.join(', ') : 'None'}</span>
        </span>
        <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[9px] font-black text-white">
          {footerNote}
        </span>
      </div>
    </div>
  );
}

export default ScheduleGridCard;
