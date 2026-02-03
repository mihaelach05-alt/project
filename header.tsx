'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap, CalendarPlus } from 'lucide-react';
import { useScheduleStore } from '@/lib/schedule-store';
import { CalendarConfigModal } from './calendar-config-modal';

interface HeaderProps {
  onAddEvent: () => void;
}

export function Header({ onAddEvent }: HeaderProps) {
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const { calendarConfig, semester } = useScheduleStore();

  // Calculate academic year from calendar config
  const academicYear = useMemo(() => {
    if (!calendarConfig) return null;
    
    try {
      const winterStart = calendarConfig.winterSemester.start 
        ? new Date(calendarConfig.winterSemester.start) 
        : null;
      const summerEnd = calendarConfig.summerSemester.end 
        ? new Date(calendarConfig.summerSemester.end) 
        : null;
      
      if (winterStart && summerEnd) {
        const startYear = winterStart.getFullYear();
        const endYear = summerEnd.getFullYear();
        return `${startYear}/${endYear}`;
      }
      
      if (winterStart) {
        return `${winterStart.getFullYear()}/${winterStart.getFullYear() + 1}`;
      }
      
      if (summerEnd) {
        return `${summerEnd.getFullYear() - 1}/${summerEnd.getFullYear()}`;
      }
    } catch {
      return null;
    }
    
    return null;
  }, [calendarConfig]);

  const semesterLabel = semester === 'winter' ? 'Зимен семестър' : 'Летен семестър';

  return (
    <header className="bg-card/80 backdrop-blur-md shadow-sm border-b border-primary/10 px-6 py-5 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-primary" />
            {academicYear ? (
              <span>Учебна година {academicYear}</span>
            ) : (
              <span>Университетски Разпис</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {academicYear ? semesterLabel : 'Управление на учебния график'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setIsCalendarModalOpen(true)}
            className="border-primary/30 hover:border-primary hover:bg-primary/5 bg-transparent"
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            {calendarConfig ? 'Редактирай календар' : 'Добави календар'}
          </Button>
          <Button 
            onClick={onAddEvent}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добави събитие
          </Button>
        </div>
      </div>
      
      <CalendarConfigModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
      />
    </header>
  );
}
