import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import ScheduleGridCard from './ScheduleGridCard';

const MySchedule = () => {
  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ['my_schedule'],
    queryFn: api.getMySchedule
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading schedule...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-3xl border border-border bg-card/40 p-4 shadow-sm backdrop-blur-xl sm:p-6"
    >
      <div>
        <h2 className="text-2xl font-black text-foreground">My Schedule</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The same locked timetable view you confirmed after saving your enrollment.
        </p>
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
