'use client';

import React from "react"

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useScheduleStore } from '@/lib/schedule-store';
import { BULGARIAN_MONTHS } from '@/lib/schedule-types';
import { Snowflake, Sun, Pin, CalendarPlus, Trash2, Palmtree, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarConfigModal } from './calendar-config-modal';
import { Button } from '@/components/ui/button';

type DateMarking = 'holiday' | 'vacation' | null;

interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isWithinSemester: boolean;
  isOdd: boolean | null;
  marking: DateMarking;
  sessionType: 'regular' | 'retake' | 'liquidation' | null;
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isOddWeek(date: Date, semesterStart: Date): boolean {
  const startMonday = getMondayOfWeek(semesterStart);
  const dateMonday = getMondayOfWeek(date);
  const diffTime = dateMonday.getTime() - startMonday.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks % 2 === 0; // First week is odd (index 0)
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return d >= s && d <= e;
}

function CompactMonthGrid({ 
  year, 
  month, 
  semesterStart,
  semesterEnd,
  holidays,
  vacations,
  sessionRanges,
  onDateClick 
}: { 
  year: number; 
  month: number;
  semesterStart: Date;
  semesterEnd: Date;
  holidays: string[];
  vacations: string[];
  sessionRanges: { start: Date; end: Date; type: 'regular' | 'retake' | 'liquidation' }[];
  onDateClick: (date: Date) => void;
}) {
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - diff);

    const days: DayInfo[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateKey = formatDateKey(date);
      let marking: DateMarking = null;
      if (holidays.includes(dateKey)) marking = 'holiday';
      else if (vacations.includes(dateKey)) marking = 'vacation';
      
      let sessionType: 'regular' | 'retake' | 'liquidation' | null = null;
      for (const range of sessionRanges) {
        if (isDateInRange(date, range.start, range.end)) {
          sessionType = range.type;
          break;
        }
      }
      
      // Check if date is within semester range for coloring
      const isWithinSemester = isDateInRange(date, semesterStart, semesterEnd);
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isWithinSemester,
        isOdd: isWithinSemester ? isOddWeek(date, semesterStart) : null,
        marking,
        sessionType
      });
    }

    return days;
  }, [year, month, semesterStart, semesterEnd, holidays, vacations, sessionRanges]);

  // Check if we need all 6 rows
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const weeksNeeded = Math.ceil((lastDayOfMonth + adjustedFirstDay) / 7);
  const daysToShow = weeksNeeded * 7;

  return (
    <div className="bg-card rounded-lg p-2 shadow-sm border border-border/50">
      <div className="font-semibold text-[10px] text-foreground mb-1 text-center">
        {BULGARIAN_MONTHS[month]} {year}
      </div>
      
      <div className="grid grid-cols-7 gap-px mb-0.5">
        {['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map((day, idx) => (
          <div key={idx} className="text-center font-semibold text-[7px] text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px">
        {calendarDays.slice(0, daysToShow).map((dayInfo, idx) => {
          const isWeekend = dayInfo.date.getDay() === 0 || dayInfo.date.getDay() === 6;
          
          return (
            <button
              type="button"
              key={idx}
              onClick={() => dayInfo.isCurrentMonth && onDateClick(dayInfo.date)}
              className={cn(
                "aspect-square flex items-center justify-center rounded-sm text-[8px] font-medium cursor-pointer transition-all relative",
                dayInfo.isCurrentMonth 
                  ? dayInfo.isOdd === true 
                    ? "bg-blue-100 text-blue-900 hover:bg-blue-200" 
                    : dayInfo.isOdd === false
                    ? "bg-purple-100 text-purple-900 hover:bg-purple-200"
                    : "bg-background text-foreground hover:bg-muted"
                  : "text-muted-foreground/20 pointer-events-none",
                isWeekend && dayInfo.isCurrentMonth && dayInfo.isOdd !== null && "opacity-70",
                dayInfo.marking === 'holiday' && dayInfo.isCurrentMonth && "ring-1 ring-red-500 ring-inset",
                dayInfo.marking === 'vacation' && dayInfo.isCurrentMonth && "ring-1 ring-emerald-500 ring-inset bg-emerald-100 text-emerald-900",
                dayInfo.sessionType === 'regular' && dayInfo.isCurrentMonth && "border-b border-orange-500",
                dayInfo.sessionType === 'retake' && dayInfo.isCurrentMonth && "border-b border-purple-500",
                dayInfo.sessionType === 'liquidation' && dayInfo.isCurrentMonth && "border-b border-pink-500"
              )}
            >
              {dayInfo.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SidebarCalendar() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [markingMode, setMarkingMode] = useState<'holiday' | 'vacation' | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX - (sidebarRef.current?.getBoundingClientRect().left || 0);
      setSidebarWidth(Math.min(Math.max(newWidth, 250), 450));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  
  const { 
    semester, 
    setSemester, 
    calendarConfig,
    clearCalendarConfig,
    holidays,
    addHoliday,
    removeHoliday,
    vacations,
    addVacation,
    removeVacation
  } = useScheduleStore();

  const handleDateClick = (date: Date) => {
    const dateKey = formatDateKey(date);
    
    if (markingMode === 'holiday') {
      if (holidays.includes(dateKey)) {
        removeHoliday(dateKey);
      } else {
        removeVacation(dateKey);
        addHoliday(dateKey);
      }
    } else if (markingMode === 'vacation') {
      if (vacations.includes(dateKey)) {
        removeVacation(dateKey);
      } else {
        removeHoliday(dateKey);
        addVacation(dateKey);
      }
    }
  };

  // Calculate months to display based on semester
  const months = useMemo(() => {
    if (!calendarConfig) return [];
    
    const monthsList: { year: number; month: number }[] = [];
    
    if (semester === 'winter') {
      // Winter: September through end of Winter Retake Session
      const winterStart = calendarConfig.winterSemester.start ? new Date(calendarConfig.winterSemester.start) : null;
      const winterRetakeEnd = calendarConfig.winterRetakeSession.end ? new Date(calendarConfig.winterRetakeSession.end) : null;
      
      if (winterStart) {
        const endDate = winterRetakeEnd || (calendarConfig.winterSemester.end ? new Date(calendarConfig.winterSemester.end) : null);
        if (endDate) {
          const current = new Date(winterStart.getFullYear(), winterStart.getMonth(), 1);
          while (current <= endDate) {
            monthsList.push({ year: current.getFullYear(), month: current.getMonth() });
            current.setMonth(current.getMonth() + 1);
          }
        }
      }
    } else {
      // Summer: February through June, then September (for Annual Retake/Liquidation)
      const summerStart = calendarConfig.summerSemester.start ? new Date(calendarConfig.summerSemester.start) : null;
      const summerEnd = calendarConfig.summerSemester.end ? new Date(calendarConfig.summerSemester.end) : null;
      
      if (summerStart && summerEnd) {
        // Add Feb-June
        const current = new Date(summerStart.getFullYear(), summerStart.getMonth(), 1);
        while (current <= summerEnd && current.getMonth() <= 5) { // Up to June (month 5)
          monthsList.push({ year: current.getFullYear(), month: current.getMonth() });
          current.setMonth(current.getMonth() + 1);
        }
        
        // Add September for Annual Retake and Liquidation sessions
        const annualRetake = calendarConfig.annualRetakeSession || { start: '', end: '' };
        const liquidation = calendarConfig.liquidationSession || { start: '', end: '' };
        
        if ((annualRetake?.start && annualRetake?.end) || (liquidation?.start && liquidation?.end)) {
          // Determine the year for September (could be same year or next)
          const septemberYear = summerStart.getFullYear();
          monthsList.push({ year: septemberYear, month: 8 }); // September is month 8
        }
      }
    }
    
    return monthsList;
  }, [calendarConfig, semester]);

  const semesterStart = useMemo(() => {
    if (!calendarConfig) return new Date();
    const semesterKey = semester === 'winter' ? 'winterSemester' : 'summerSemester';
    return new Date(calendarConfig[semesterKey].start);
  }, [calendarConfig, semester]);

  const semesterEnd = useMemo(() => {
    if (!calendarConfig) return new Date();
    const semesterKey = semester === 'winter' ? 'winterSemester' : 'summerSemester';
    return new Date(calendarConfig[semesterKey].end);
  }, [calendarConfig, semester]);

  const sessionRanges = useMemo(() => {
    if (!calendarConfig) return [];
    
    const ranges: { start: Date; end: Date; type: 'regular' | 'retake' | 'liquidation' }[] = [];
    
    if (semester === 'winter') {
      if (calendarConfig.winterRegularSession.start && calendarConfig.winterRegularSession.end) {
        ranges.push({
          start: new Date(calendarConfig.winterRegularSession.start),
          end: new Date(calendarConfig.winterRegularSession.end),
          type: 'regular'
        });
      }
      if (calendarConfig.winterRetakeSession.start && calendarConfig.winterRetakeSession.end) {
        ranges.push({
          start: new Date(calendarConfig.winterRetakeSession.start),
          end: new Date(calendarConfig.winterRetakeSession.end),
          type: 'retake'
        });
      }
    } else {
      if (calendarConfig.summerRegularSession.start && calendarConfig.summerRegularSession.end) {
        ranges.push({
          start: new Date(calendarConfig.summerRegularSession.start),
          end: new Date(calendarConfig.summerRegularSession.end),
          type: 'regular'
        });
      }
      // Annual Retake Session (shown in summer view)
      const annualRetake = calendarConfig.annualRetakeSession || { start: '', end: '' };
      if (annualRetake?.start && annualRetake?.end) {
        ranges.push({
          start: new Date(annualRetake.start),
          end: new Date(annualRetake.end),
          type: 'retake'
        });
      }
    }
    
    // Liquidation session shown in both views if in range
    const liquidation = calendarConfig.liquidationSession || { start: '', end: '' };
    if (liquidation?.start && liquidation?.end) {
      ranges.push({
        start: new Date(liquidation.start),
        end: new Date(liquidation.end),
        type: 'liquidation'
      });
    }
    
    return ranges;
  }, [calendarConfig, semester]);

  // No calendar configured - show Add Calendar button
  if (!calendarConfig) {
    return (
      <div className="w-[280px] bg-card/80 backdrop-blur-md rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center gap-4 flex-shrink-0">
        <div className="text-center">
          <CalendarPlus className="w-12 h-12 text-primary/40 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-foreground mb-1">Няма календар</h3>
          <p className="text-xs text-muted-foreground">
            Добавете календар за визуализация на семестъра.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsConfigModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 text-sm"
          size="sm"
        >
          <CalendarPlus className="w-4 h-4 mr-2" />
          Добави календар
        </Button>
        
        <CalendarConfigModal 
          isOpen={isConfigModalOpen} 
          onClose={() => setIsConfigModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div 
      ref={sidebarRef}
      className="bg-card/80 backdrop-blur-md rounded-2xl shadow-lg p-3 flex flex-col gap-3 overflow-hidden flex-shrink-0 relative"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize flex items-center justify-center hover:bg-primary/10 transition-colors z-10",
          isResizing && "bg-primary/20"
        )}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground/50" />
      </div>
      
      {/* Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
            Семестър
          </span>
          <button
            type="button"
            onClick={() => clearCalendarConfig()}
            className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Изтрий
          </button>
        </div>
        
        <div className="flex gap-1 bg-muted p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setSemester('winter')}
            className={cn(
              "flex-1 py-1.5 px-2 border-none rounded-md font-semibold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1",
              semester === 'winter' 
                ? "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 shadow-sm" 
                : "bg-transparent text-muted-foreground hover:bg-muted-foreground/10"
            )}
          >
            <Snowflake className="w-3 h-3" />
            Зимен
          </button>
          <button
            type="button"
            onClick={() => setSemester('summer')}
            className={cn(
              "flex-1 py-1.5 px-2 border-none rounded-md font-semibold text-[10px] cursor-pointer transition-all flex items-center justify-center gap-1",
              semester === 'summer' 
                ? "bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 shadow-sm" 
                : "bg-transparent text-muted-foreground hover:bg-muted-foreground/10"
            )}
          >
            <Sun className="w-3 h-3" />
            Летен
          </button>
        </div>

        {/* Marking Mode */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMarkingMode(markingMode === 'holiday' ? null : 'holiday')}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-md text-[9px] font-medium transition-all flex items-center justify-center gap-1 border",
              markingMode === 'holiday' 
                ? "border-red-500 bg-red-50 text-red-700" 
                : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Почивен
          </button>
          <button
            type="button"
            onClick={() => setMarkingMode(markingMode === 'vacation' ? null : 'vacation')}
            className={cn(
              "flex-1 py-1.5 px-2 rounded-md text-[9px] font-medium transition-all flex items-center justify-center gap-1 border",
              markingMode === 'vacation' 
                ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <Palmtree className="w-2.5 h-2.5" />
            Ваканция
          </button>
        </div>
      </div>

      {/* Multi-month Calendar - 2 column grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
        {months.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-4">
            Няма дефинирани дати за {semester === 'winter' ? 'зимния' : 'летния'} семестър
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {months.map(({ year, month }) => (
              <CompactMonthGrid
                key={`${year}-${month}`}
                year={year}
                month={month}
                semesterStart={semesterStart}
                semesterEnd={semesterEnd}
                holidays={holidays}
                vacations={vacations}
                sessionRanges={sessionRanges}
                onDateClick={handleDateClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compact Legend */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
        <div className="font-bold text-[8px] text-foreground uppercase tracking-wider flex items-center gap-1">
          <Pin className="w-2.5 h-2.5" />
          Обозначения
        </div>
        
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px]">
          <div className="flex items-center gap-1 text-muted-foreground font-medium">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-300" />
            <span>Нечетна</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground font-medium">
            <div className="w-2.5 h-2.5 rounded-sm bg-purple-100 border border-purple-300" />
            <span>Четна</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground font-medium">
            <div className="w-2.5 h-2.5 rounded-sm ring-1 ring-red-500 ring-inset" />
            <span>Почивен</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground font-medium">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-100 ring-1 ring-emerald-500 ring-inset" />
            <span>Ваканция</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground font-medium">
            <div className="w-4 h-0.5 bg-orange-500 rounded-sm" />
            <span>Редовна</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground font-medium">
            <div className="w-4 h-0.5 bg-purple-500 rounded-sm" />
            <span>Поправка</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground font-medium col-span-2">
            <div className="w-4 h-0.5 bg-pink-500 rounded-sm" />
            <span>Ликвидация</span>
          </div>
        </div>
      </div>

      <CalendarConfigModal 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)} 
      />
    </div>
  );
}
