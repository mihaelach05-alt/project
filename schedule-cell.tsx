'use client';

import type { ScheduleEvent } from '@/lib/schedule-types';
import { EventBlock } from './event-block';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleCellProps {
  events: ScheduleEvent[];
  onCellClick: () => void;
  onEventClick: (event: ScheduleEvent) => void;
  rowSpan?: number;
  height?: number;
}

export function ScheduleCell({ 
  events, 
  onCellClick, 
  onEventClick,
  rowSpan = 1,
  height = 100
}: ScheduleCellProps) {
  const regularEvents = events.filter(e => e.event_type !== 'makeup');
  const oddWeekEvents = regularEvents.filter(e => e.week_cycle === 'odd');
  const evenWeekEvents = regularEvents.filter(e => e.week_cycle === 'even');
  const everyWeekEvents = regularEvents.filter(e => e.week_cycle === 'every');

  const isEmpty = events.length === 0;

  // Render empty cell
  if (isEmpty) {
    return (
      <td 
        className={cn("schedule-cell empty-cell border border-border")}
        style={{ height: `${height}px` }}
        rowSpan={rowSpan}
        onClick={onCellClick}
      >
        <div className="h-full flex items-center justify-center text-muted-foreground/40 text-sm font-medium cursor-pointer hover:text-muted-foreground/60 transition-colors">
          <Plus className="w-5 h-5" />
        </div>
      </td>
    );
  }

  // Single event for every week - FULL CELL
  if (everyWeekEvents.length > 0 && oddWeekEvents.length === 0 && evenWeekEvents.length === 0) {
    return (
      <td 
        className="schedule-cell border border-border p-0"
        style={{ height: `${height}px` }}
        rowSpan={rowSpan}
      >
        <div className="h-full w-full">
          {everyWeekEvents.map((event) => (
            <EventBlock 
              key={event.id} 
              event={event} 
              onClick={() => onEventClick(event)} 
            />
          ))}
        </div>
      </td>
    );
  }

  // Check for odd/even alternation
  const hasOdd = oddWeekEvents.length > 0;
  const hasEven = evenWeekEvents.length > 0;

  // HORIZONTAL SPLIT for ODD/EVEN - Safe zones, no overlap
  if (hasOdd && hasEven) {
    return (
      <td 
        className="schedule-cell border border-border p-0"
        style={{ height: `${height}px` }}
        rowSpan={rowSpan}
      >
        <div className="split-container">
          {/* TOP HALF - ODD WEEK */}
          <div className="split-top">
            <div className="split-label odd-label">Нечетна</div>
            <div className="split-content">
              {oddWeekEvents.length === 1 ? (
                <EventBlock 
                  event={oddWeekEvents[0]} 
                  isCompact
                  onClick={() => onEventClick(oddWeekEvents[0])} 
                />
              ) : (
                <div className="flex gap-0.5 w-full h-full">
                  {oddWeekEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="flex-1 min-w-0">
                      <EventBlock 
                        event={event} 
                        isCompact
                        onClick={() => onEventClick(event)} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* DIVIDER LINE */}
          <div className="split-divider" />
          
          {/* BOTTOM HALF - EVEN WEEK */}
          <div className="split-bottom">
            <div className="split-label even-label">Четна</div>
            <div className="split-content">
              {evenWeekEvents.length === 1 ? (
                <EventBlock 
                  event={evenWeekEvents[0]} 
                  isCompact
                  onClick={() => onEventClick(evenWeekEvents[0])} 
                />
              ) : (
                <div className="flex gap-0.5 w-full h-full">
                  {evenWeekEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className="flex-1 min-w-0">
                      <EventBlock 
                        event={event} 
                        isCompact
                        onClick={() => onEventClick(event)} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
    );
  }

  // Single week type only (odd OR even, but not both)
  if (hasOdd || hasEven) {
    const weekEvents = hasOdd ? oddWeekEvents : evenWeekEvents;
    const weekType = hasOdd ? 'odd' : 'even';
    const label = hasOdd ? 'Нечетна' : 'Четна';
    
    return (
      <td 
        className="schedule-cell border border-border p-0"
        style={{ height: `${height}px` }}
        rowSpan={rowSpan}
      >
        <div className={cn("single-week-container", weekType)}>
          <div className={cn("split-label", weekType === 'odd' ? 'odd-label' : 'even-label')}>
            {label}
          </div>
          <div className="single-week-content">
            {weekEvents.length === 1 ? (
              <EventBlock 
                event={weekEvents[0]} 
                onClick={() => onEventClick(weekEvents[0])} 
              />
            ) : (
              <div className="flex gap-0.5 w-full h-full">
                {weekEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="flex-1 min-w-0">
                    <EventBlock 
                      event={event} 
                      isCompact
                      onClick={() => onEventClick(event)} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>
    );
  }

  // Fallback: render all events
  return (
    <td 
      className="schedule-cell border border-border p-1"
      style={{ height: `${height}px` }}
      rowSpan={rowSpan}
    >
      <div className="h-full flex flex-col gap-1 overflow-hidden">
        {events.map((event) => (
          <EventBlock 
            key={event.id} 
            event={event} 
            isCompact
            onClick={() => onEventClick(event)} 
          />
        ))}
      </div>
    </td>
  );
}
