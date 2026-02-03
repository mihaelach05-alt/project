'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useScheduleStore, type CalendarConfig } from '@/lib/schedule-store';
import { Snowflake, Sun, CalendarDays, BookOpen, RotateCcw, Eraser } from 'lucide-react';

interface CalendarConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultConfig: CalendarConfig = {
  winterSemester: { start: '', end: '' },
  winterRegularSession: { start: '', end: '' },
  winterRetakeSession: { start: '', end: '' },
  summerSemester: { start: '', end: '' },
  summerRegularSession: { start: '', end: '' },
  annualRetakeSession: { start: '', end: '' },
  liquidationSession: { start: '', end: '' },
};

export function CalendarConfigModal({ isOpen, onClose }: CalendarConfigModalProps) {
  const { calendarConfig, setCalendarConfig } = useScheduleStore();
  
  // Merge existing config with defaults to handle migration from old data format
  const [config, setConfig] = useState<CalendarConfig>(() => {
    if (!calendarConfig) return defaultConfig;
    
    // Handle migration from old summerRetakeSession to annualRetakeSession
    const migrated: CalendarConfig = {
      ...defaultConfig,
      ...calendarConfig,
      annualRetakeSession: calendarConfig.annualRetakeSession || 
        (calendarConfig as unknown as { summerRetakeSession?: { start: string; end: string } }).summerRetakeSession || 
        { start: '', end: '' },
    };
    return migrated;
  });

  const handleSave = () => {
    // Validate that at least winter or summer semester has dates
    if ((!config.winterSemester.start || !config.winterSemester.end) && 
        (!config.summerSemester.start || !config.summerSemester.end)) {
      alert('Моля, въведете поне един семестър');
      return;
    }
    setCalendarConfig(config);
    onClose();
  };

  const updateField = (
    section: keyof CalendarConfig,
    field: 'start' | 'end',
    value: string
  ) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            Конфигурация на календар
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Winter Semester */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
              <Snowflake className="w-5 h-5" />
              Зимен семестър
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-blue-700">Начало</Label>
                <Input
                  type="date"
                  value={config.winterSemester.start}
                  onChange={(e) => updateField('winterSemester', 'start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-blue-700">Край</Label>
                <Input
                  type="date"
                  value={config.winterSemester.end}
                  onChange={(e) => updateField('winterSemester', 'end', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200">
              <h4 className="font-semibold text-blue-700 text-sm flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4" />
                Редовна сесия
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-blue-600">Начало</Label>
                  <Input
                    type="date"
                    value={config.winterRegularSession.start}
                    onChange={(e) => updateField('winterRegularSession', 'start', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-blue-600">Край</Label>
                  <Input
                    type="date"
                    value={config.winterRegularSession.end}
                    onChange={(e) => updateField('winterRegularSession', 'end', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200">
              <h4 className="font-semibold text-blue-700 text-sm flex items-center gap-2 mb-3">
                <RotateCcw className="w-4 h-4" />
                Поправителна сесия
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-blue-600">Начало</Label>
                  <Input
                    type="date"
                    value={config.winterRetakeSession.start}
                    onChange={(e) => updateField('winterRetakeSession', 'start', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-blue-600">Край</Label>
                  <Input
                    type="date"
                    value={config.winterRetakeSession.end}
                    onChange={(e) => updateField('winterRetakeSession', 'end', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summer Semester */}
          <div className="bg-amber-50 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-amber-800 flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Летен семестър
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-amber-700">Начало</Label>
                <Input
                  type="date"
                  value={config.summerSemester.start}
                  onChange={(e) => updateField('summerSemester', 'start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-amber-700">Край</Label>
                <Input
                  type="date"
                  value={config.summerSemester.end}
                  onChange={(e) => updateField('summerSemester', 'end', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200">
              <h4 className="font-semibold text-amber-700 text-sm flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4" />
                Редовна сесия
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-amber-600">Начало</Label>
                  <Input
                    type="date"
                    value={config.summerRegularSession.start}
                    onChange={(e) => updateField('summerRegularSession', 'start', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-amber-600">Край</Label>
                  <Input
                    type="date"
                    value={config.summerRegularSession.end}
                    onChange={(e) => updateField('summerRegularSession', 'end', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Annual Retake Session */}
          <div className="bg-violet-50 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-violet-800 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Годишна поправителна сесия
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-violet-700">Начало</Label>
                <Input
                  type="date"
                  value={config.annualRetakeSession.start}
                  onChange={(e) => updateField('annualRetakeSession', 'start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-violet-700">Край</Label>
                <Input
                  type="date"
                  value={config.annualRetakeSession.end}
                  onChange={(e) => updateField('annualRetakeSession', 'end', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Liquidation Session */}
          <div className="bg-pink-50 rounded-xl p-4 space-y-4">
            <h3 className="font-bold text-pink-800 flex items-center gap-2">
              <Eraser className="w-5 h-5" />
              Ликвидационна сесия
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-pink-700">Начало</Label>
                <Input
                  type="date"
                  value={config.liquidationSession.start}
                  onChange={(e) => updateField('liquidationSession', 'start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-pink-700">Край</Label>
                <Input
                  type="date"
                  value={config.liquidationSession.end}
                  onChange={(e) => updateField('liquidationSession', 'end', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Запази календар
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
