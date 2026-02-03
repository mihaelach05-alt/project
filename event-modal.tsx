'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useScheduleStore } from '@/lib/schedule-store';
import { TIME_SLOTS, DAYS, DAY_NAMES } from '@/lib/schedule-types';
import type { ScheduleEvent } from '@/lib/schedule-types';
import { Save, Trash2, X, FileText, Clock, Settings, AlertTriangle } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: ScheduleEvent | null;
  defaultDay?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  isMakeup?: boolean;
}

export function EventModal({ 
  isOpen, 
  onClose, 
  event,
  defaultDay,
  defaultStartTime,
  defaultEndTime,
  isMakeup = false
}: EventModalProps) {
  const { addEvent, updateEvent, deleteEvent } = useScheduleStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    subject_name: '',
    subject_type: 'lecture' as 'lecture' | 'seminar' | 'lab',
    room: '',
    day: 'monday' as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday',
    start_time: '',
    end_time: '',
    control_form: 'none' as 'none' | 'exam' | 'continuous',
    project_type: 'none' as 'none' | 'course-project' | 'coursework' | 'thesis',
    subgroup: 'none' as 'none' | 'A' | 'B',
    week_cycle: 'every' as 'every' | 'odd' | 'even',
    event_type: 'regular' as 'regular' | 'makeup',
    group_number: ''
  });

  useEffect(() => {
    if (event) {
      setFormData({
        subject_name: event.subject_name,
        subject_type: event.subject_type,
        room: event.room,
        day: event.day,
        start_time: event.start_time,
        end_time: event.end_time,
        control_form: event.control_form,
        project_type: event.project_type,
        subgroup: event.subgroup,
        week_cycle: event.week_cycle,
        event_type: event.event_type,
        group_number: event.group_number || ''
      });
    } else {
      setFormData({
        subject_name: '',
        subject_type: isMakeup ? 'seminar' : 'lecture',
        room: '',
        day: (defaultDay as typeof formData.day) || 'monday',
        start_time: defaultStartTime || '',
        end_time: defaultEndTime || '',
        control_form: 'none',
        project_type: 'none',
        subgroup: 'none',
        week_cycle: 'every',
        event_type: isMakeup ? 'makeup' : 'regular',
        group_number: ''
      });
    }
    setShowDeleteConfirm(false);
  }, [event, defaultDay, defaultStartTime, defaultEndTime, isMakeup, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (event) {
      updateEvent(event.id, formData);
    } else {
      addEvent(formData);
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (event) {
      deleteEvent(event.id);
      onClose();
    }
  };

  const timeOptions = TIME_SLOTS.filter(slot => !slot.lunch);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-primary-foreground z-10">
          <DialogTitle className="text-2xl font-bold">
            {event ? 'Редактирай събитие' : 'Добави събитие'}
          </DialogTitle>
          {event && (
            <p className="text-sm text-primary-foreground/80 mt-1">
              {event.subject_name} - {DAY_NAMES[event.day]} {event.start_time}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Основна информация
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject_name" className="font-semibold">
                  Название на предмет <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject_name"
                  value={formData.subject_name}
                  onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                  placeholder="Въведете название на предмета"
                  required
                  className="bg-muted/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject_type" className="font-semibold">
                  Тип на час <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.subject_type}
                  onValueChange={(value) => setFormData({ ...formData, subject_type: value as typeof formData.subject_type })}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Изберете тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {!isMakeup && <SelectItem value="lecture">Лекция</SelectItem>}
                    <SelectItem value="seminar">Семинарно упражнение</SelectItem>
                    <SelectItem value="lab">Лабораторно упражнение</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room" className="font-semibold">
                Зала/Стая <span className="text-destructive">*</span>
              </Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="Напр. 101A, Амфитеатър 2, Лаб. 3"
                required
                className="bg-muted/50"
              />
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Section 2: Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              График
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day" className="font-semibold">
                  Ден <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.day}
                  onValueChange={(value) => setFormData({ ...formData, day: value as typeof formData.day })}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Изберете" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>{DAY_NAMES[day]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="start_time" className="font-semibold">
                  Начало <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.start_time}
                  onValueChange={(value) => setFormData({ ...formData, start_time: value })}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Изберете час" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((slot) => (
                      <SelectItem key={slot.start} value={slot.start}>{slot.start}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_time" className="font-semibold">
                  Край <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.end_time}
                  onValueChange={(value) => setFormData({ ...formData, end_time: value })}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Изберете час" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((slot) => (
                      <SelectItem key={slot.end} value={slot.end}>{slot.end}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="week_cycle" className="font-semibold">
                Седмичен цикъл <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.week_cycle}
                onValueChange={(value) => setFormData({ ...formData, week_cycle: value as typeof formData.week_cycle })}
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="every">Всяка седмица</SelectItem>
                  <SelectItem value="odd">Нечетна седмица</SelectItem>
                  <SelectItem value="even">Четна седмица</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Определя редовност на провеждане на часа
              </p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Section 3: Additional Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Допълнително
            </h3>
            
            {!isMakeup && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="control_form" className="font-semibold">
                    Форма на контрол
                  </Label>
                  <Select
                    value={formData.control_form}
                    onValueChange={(value) => setFormData({ ...formData, control_form: value as typeof formData.control_form })}
                  >
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Няма</SelectItem>
                      <SelectItem value="exam">Изпит</SelectItem>
                      <SelectItem value="continuous">Текуща оценка</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Показва се за лекции</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project_type" className="font-semibold">
                    Проект/Задание
                  </Label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(value) => setFormData({ ...formData, project_type: value as typeof formData.project_type })}
                  >
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Няма</SelectItem>
                      <SelectItem value="course-project">Курсов проект</SelectItem>
                      <SelectItem value="coursework">Курсова работа</SelectItem>
                      <SelectItem value="thesis">Дипломна работа</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Показва се за лекции</p>
                </div>
              </div>
            )}

            {isMakeup ? (
              <div className="space-y-2">
                <Label htmlFor="group_number" className="font-semibold">
                  Номер на група
                </Label>
                <Input
                  id="group_number"
                  value={formData.group_number}
                  onChange={(e) => setFormData({ ...formData, group_number: e.target.value })}
                  placeholder="Напр. 1, 2, 3"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">Групата, която посещавате за отработване</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="subgroup" className="font-semibold">
                  Подгрупа
                </Label>
                <Select
                  value={formData.subgroup}
                  onValueChange={(value) => setFormData({ ...formData, subgroup: value as typeof formData.subgroup })}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Няма</SelectItem>
                    <SelectItem value="A">Група А</SelectItem>
                    <SelectItem value="B">Група Б</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Показва се за семинари и лаборатории</p>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-emerald-100 border-l-4 border-emerald-500 rounded-lg text-sm text-emerald-800 font-medium">
            <strong>Съвет:</strong> Системата автоматично обработва сложни комбинации - диагонално разделяне за нечетни/четни седмици и четириъгълници за множество събития.
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Save className="w-4 h-4 mr-2" />
              Запази събитие
            </Button>
            
            {event && (
              <Button 
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Изтрий
              </Button>
            )}
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="p-6 bg-destructive/10 rounded-xl border-2 border-destructive/30 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <p className="text-destructive font-bold">Изтриване на събитие</p>
                  <p className="text-sm text-destructive/80">
                    Сигурни ли сте, че искате да изтриете това събитие? Това действие е необратимо.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Да, изтрий окончателно
                </Button>
                <Button 
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Отказ
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
