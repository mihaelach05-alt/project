'use client';

import { ClipboardList } from 'lucide-react';

export function Legend() {
  return (
    <div className="bg-card/50 backdrop-blur-sm border-b border-primary/10 px-6 py-4 flex-shrink-0 overflow-x-auto scrollbar-thin">
      <div className="flex items-center gap-8 min-w-max">
        <span className="font-bold text-primary text-sm whitespace-nowrap flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Легенда:
        </span>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md lecture-bg shadow-sm" />
          <span className="text-sm text-foreground/80 font-medium">Лекция</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md seminar-bg shadow-sm" />
          <span className="text-sm text-foreground/80 font-medium">Семинарно упражнение</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md lab-bg shadow-sm" />
          <span className="text-sm text-foreground/80 font-medium">Лабораторно упражнение</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md makeup-bg shadow-sm" />
          <span className="text-sm text-foreground/80 font-medium">Отработване</span>
        </div>
        
        <div className="h-6 w-px bg-border" />
        
        <div className="flex items-center gap-2 text-foreground/80">
          <div className="w-4 h-4 rounded bg-[var(--odd-split-bg)] border border-blue-200" />
          <span className="text-sm font-medium">Нечетна седмица</span>
        </div>
        
        <div className="flex items-center gap-2 text-foreground/80">
          <div className="w-4 h-4 rounded bg-[var(--even-split-bg)] border border-purple-200" />
          <span className="text-sm font-medium">Четна седмица</span>
        </div>
      </div>
    </div>
  );
}
