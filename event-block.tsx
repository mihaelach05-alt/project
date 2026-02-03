'use client';

import type { ScheduleEvent } from '@/lib/schedule-types';
import { CONTROL_FORMS, PROJECT_TYPES, SUBGROUP_LABELS } from '@/lib/schedule-types';
import { cn } from '@/lib/utils';

interface EventBlockProps {
  event: ScheduleEvent;
  isCompact?: boolean;
  onClick: () => void;
}

export function EventBlock({ event, isCompact = false, onClick }: EventBlockProps) {
  const bgClass = 
    event.subject_type === 'lecture' ? 'lecture-bg' :
    event.subject_type === 'seminar' ? 'seminar-bg' :
    event.subject_type === 'lab' ? 'lab-bg' : 'makeup-bg';

  const showControl = event.control_form !== 'none' && event.subject_type === 'lecture';
  const showProject = event.project_type !== 'none' && event.subject_type === 'lecture';
  const showSubgroup = event.subgroup !== 'none' && (event.subject_type === 'seminar' || event.subject_type === 'lab');

  return (
    <div
      className={cn('event-block', bgClass, isCompact && 'compact')}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 z-10 gap-0.5 overflow-hidden">
        {/* Subject Name - LARGE & BOLD */}
        <div className={cn(
          "font-bold text-slate-900 break-words tracking-tight hyphens-auto leading-tight",
          isCompact 
            ? "text-[13px] line-clamp-2" 
            : "text-[16px] line-clamp-3"
        )}
        style={{ wordBreak: 'break-word' }}
        >
          {event.subject_name}
        </div>
        
        {/* Room Number - normal weight */}
        <div className={cn(
          "font-normal text-slate-600",
          isCompact ? "text-[11px]" : "text-[13px]"
        )}>
          {event.room || '-'}
        </div>
        
        {/* Control Form - italic in parentheses */}
        {showControl && !isCompact && (
          <div className="font-medium text-slate-500 text-[12px] italic">
            ({CONTROL_FORMS[event.control_form]})
          </div>
        )}
      </div>

      {/* TAGS AREA - Bottom row with strict positioning */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between items-end pointer-events-none z-20">
        {/* LEFT: Subgroup tag */}
        <div>
          {showSubgroup && (
            <span className="glassy-badge">
              {SUBGROUP_LABELS[event.subgroup]}
            </span>
          )}
        </div>
        
        {/* RIGHT: Project tag */}
        <div>
          {showProject && (
            <span className="glassy-badge">
              {PROJECT_TYPES[event.project_type]}
            </span>
          )}
          {event.event_type === 'makeup' && event.group_number && (
            <span className="glassy-badge">
              Група {event.group_number}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
