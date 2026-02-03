'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/schedule/header';
import { Legend } from '@/components/schedule/legend';
import { SidebarCalendar } from '@/components/schedule/sidebar-calendar';
import { ScheduleTable } from '@/components/schedule/schedule-table';
import { EventModal } from '@/components/schedule/event-modal';
import type { ScheduleEvent } from '@/lib/schedule-types';
import { useScheduleStore } from '@/lib/schedule-store';
import { Loader2 } from 'lucide-react';

export default function SchedulePlanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [defaultDay, setDefaultDay] = useState<string>('');
  const [defaultStartTime, setDefaultStartTime] = useState<string>('');
  const [defaultEndTime, setDefaultEndTime] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydrated = useScheduleStore((state) => state._hasHydrated);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setDefaultDay('');
    setDefaultStartTime('');
    setDefaultEndTime('');
    setIsModalOpen(true);
  };

  const handleCellClick = (day: string, startTime: string, endTime: string) => {
    setSelectedEvent(null);
    setDefaultDay(day);
    setDefaultStartTime(startTime);
    setDefaultEndTime(endTime);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (!isHydrated || !hasHydrated) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-blue-50/30 to-primary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Зареждане...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-gradient-to-br from-background via-blue-50/30 to-primary/5">
      <Header onAddEvent={handleAddEvent} />
      <Legend />
      
      <div className="flex flex-1 gap-4 px-6 py-4 overflow-hidden">
        <SidebarCalendar />
        <ScheduleTable 
          onCellClick={handleCellClick}
          onEventClick={handleEventClick}
        />
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        defaultDay={defaultDay}
        defaultStartTime={defaultStartTime}
        defaultEndTime={defaultEndTime}
      />
    </div>
  );
}
