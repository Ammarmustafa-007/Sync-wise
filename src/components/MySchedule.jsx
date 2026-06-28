import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

const formatTime12Hour = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
};

const MySchedule = () => {
  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ['my_schedule'],
    queryFn: api.getMySchedule
  });

  const exportICS = () => {
    if (!schedule || schedule.length === 0) return;

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SyncWise//Timetable//EN\n";
    
    // For simplicity, we just generate events for the next 7 days based on the day string
    const dayMap = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 0 };
    
    schedule.forEach(slot => {
      // Just a dummy format for ICS logic for now. 
      // Real ICS would parse start_time, end_time, and generate RRules
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:${slot.subject}\n`;
      icsContent += `LOCATION:${slot.room}\n`;
      icsContent += `DESCRIPTION:Teacher: ${slot.teacher?.name}\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MySchedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading schedule...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-3xl bg-card/40 border border-border backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <Calendar className="w-6 h-6 text-emerald-500" />
          </div>
          Your Weekly Schedule
        </h2>
        <button 
          onClick={exportICS}
          disabled={schedule.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export .ics
        </button>
      </div>
      
      <div className="space-y-4">
        {schedule.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
            No schedule found. Please generate your timetable first.
          </div>
        ) : schedule.sort((a,b) => (a.day+a.start_time).localeCompare(b.day+b.start_time)).map((item, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-24 text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.day.substring(0,3)}</div>
                <div className="text-sm font-bold text-foreground mt-1">{formatTime12Hour(item.start_time)}</div>
                <div className="text-xs text-muted-foreground">{formatTime12Hour(item.end_time)}</div>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" />
              <div>
                <div className="font-bold text-foreground">{item.subject} <span className="font-normal text-muted-foreground text-sm ml-2">({item.section})</span></div>
                <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.room || 'TBA'}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {item.teacher?.name || 'Staff'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MySchedule;
