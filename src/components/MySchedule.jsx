import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import ScheduleGridCard from './ScheduleGridCard';

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
      className="space-y-6 rounded-3xl border border-border bg-card/40 p-4 shadow-sm backdrop-blur-xl sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">My Schedule</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The same locked timetable view you confirmed after saving your enrollment.
          </p>
        </div>
        <button 
          onClick={exportICS}
          disabled={schedule.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-bold rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export .ics
        </button>
      </div>
      
      {schedule.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
          No schedule found. Please generate your timetable first.
        </div>
      ) : (
        <ScheduleGridCard
          title="Your Locked Weekly Schedule"
          subtitle="A clean grid view of the timetable saved to your enrollment record."
          schedule={schedule}
          scoreLabel="Saved"
          footerNote="Saved layout is ready for teacher makeup planning"
        />
      )}
    </motion.div>
  );
};

export default MySchedule;
