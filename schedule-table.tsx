'use client';

import { cn } from "@/lib/utils"

import { useMemo } from 'react';
import { TIME_SLOTS, DAYS, DAY_NAMES, getSlotIndex, getSlotCountBetween } from '@/lib/schedule-types';
import type { ScheduleEvent } from '@/lib/schedule-types';
import { useScheduleStore } from '@/lib/schedule-store';
import { ScheduleCell } from './schedule-cell';
import { UtensilsCrossed } from 'lucide-react';

interface ScheduleTableProps {
  onCellClick: (day: string, startTime: string, endTime: string) => void;
  onEventClick: (event: ScheduleEvent) => void;
}

export function ScheduleTable({ onCellClick, onEventClick }: ScheduleTableProps) {
  const events = useScheduleStore((state) => state.events);

  // Group events by day and start slot
  const eventGrid = useMemo(() => {
    const grid: Record<string, Record<number, ScheduleEvent[]>> = {};
    
    DAYS.forEach((day) => {
      grid[day] = {};
      TIME_SLOTS.forEach((_, idx) => {
        grid[day][idx] = [];
      });
    });

    events.forEach((event) => {
      const startIdx = getSlotIndex(event.start_time);
      if (startIdx !== -1 && grid[event.day]) {
        grid[event.day][startIdx].push(event);
      }
    });

    return grid;
  }, [events]);

  // Track which cells are covered by rowspan
  const occupiedCells = useMemo(() => {
    const occupied: Record<string, Set<number>> = {};
    DAYS.forEach((day) => {
      occupied[day] = new Set();
    });

    events.forEach((event) => {
      const startIdx = getSlotIndex(event.start_time);
      const slotCount = getSlotCountBetween(event.start_time, event.end_time);
      
      if (startIdx !== -1) {
        let coveredSlots = 0;
        for (let i = startIdx + 1; i < TIME_SLOTS.length && coveredSlots < slotCount - 1; i++) {
          if (!TIME_SLOTS[i].lunch) {
            occupied[event.day].add(i);
            coveredSlots++;
          } else {
            // Skip lunch row in occupied calculation but don't count it
            occupied[event.day].add(i);
          }
        }
      }
    });

    return occupied;
  }, [events]);

  // Calculate rowspan for events
  const getRowSpan = (day: string, slotIdx: number): number => {
    const cellEvents = eventGrid[day]?.[slotIdx] || [];
    if (cellEvents.length === 0) return 1;

    let maxSlotCount = 1;
    cellEvents.forEach((event) => {
      const slotCount = getSlotCountBetween(event.start_time, event.end_time);
      if (slotCount > maxSlotCount) maxSlotCount = slotCount;
    });

    // Account for lunch break
    const lunchIdx = TIME_SLOTS.findIndex(s => s.lunch);
    let rowSpan = maxSlotCount;
    
    // If span would cross lunch, add 1 for the lunch row
    const endIdx = slotIdx + maxSlotCount - 1;
    if (slotIdx < lunchIdx && endIdx >= lunchIdx) {
      rowSpan += 1;
    }
    
    return Math.max(1, rowSpan);
  };

  return (
    <div className="flex-1 overflow-auto scrollbar-thin">
      <div className="min-w-max">
        <table className="w-full border-collapse bg-card">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 shadow-lg">
              <th className="w-28 px-4 py-5 text-center text-white font-semibold text-sm tracking-wide border-r border-slate-600/50 rounded-tl-lg">
                <span className="opacity-90">Час</span>
              </th>
              {DAYS.map((day, idx) => (
                <th 
                  key={day}
                  className={cn(
                    "w-1/5 px-3 py-5 text-center text-white font-semibold text-sm tracking-wide border-r border-slate-600/50 last:border-r-0",
                    idx === DAYS.length - 1 && "rounded-tr-lg"
                  )}
                >
                  <span className="opacity-90">{DAY_NAMES[day]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TIME_SLOTS.map((slot, slotIdx) => {
              if (slot.lunch) {
                return (
                  <tr key={`lunch-${slotIdx}`}>
                    <td className="w-28 px-4 py-4 text-center text-sm font-bold bg-gradient-to-r from-muted to-muted/80 text-muted-foreground whitespace-nowrap">
                      {slot.start}–{slot.end}
                    </td>
                    <td 
                      colSpan={5} 
                      className="lunch-bg"
                      style={{ height: '60px' }}
                    >
                      <div className="h-full flex items-center justify-center gap-2 font-semibold text-slate-600">
                        <UtensilsCrossed className="w-5 h-5" />
                        <span>Обедна почивка</span>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slotIdx}>
                  <td className="w-28 px-4 py-4 text-center text-sm font-bold bg-gradient-to-r from-muted to-muted/80 text-muted-foreground whitespace-nowrap">
                    {slot.start}–{slot.end}
                  </td>
                  {DAYS.map((day) => {
                    // Skip if this cell is covered by a rowspan from above
                    if (occupiedCells[day].has(slotIdx)) {
                      return null;
                    }

                    const cellEvents = eventGrid[day]?.[slotIdx] || [];
                    const rowSpan = getRowSpan(day, slotIdx);

                    return (
                      <ScheduleCell
                        key={`${day}-${slotIdx}`}
                        events={cellEvents}
                        rowSpan={rowSpan}
                        height={100 * rowSpan}
                        onCellClick={() => onCellClick(day, slot.start, slot.end)}
                        onEventClick={onEventClick}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
