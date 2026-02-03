export interface TimeSlot {
  start: string;
  end: string;
  lunch?: boolean;
}

export interface ScheduleEvent {
  id: string;
  subject_name: string;
  subject_type: 'lecture' | 'seminar' | 'lab';
  room: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
  start_time: string;
  end_time: string;
  control_form: 'none' | 'exam' | 'continuous';
  project_type: 'none' | 'course-project' | 'coursework' | 'thesis';
  subgroup: 'none' | 'A' | 'B';
  week_cycle: 'every' | 'odd' | 'even';
  event_type: 'regular' | 'makeup';
  group_number?: string;
}

export const TIME_SLOTS: TimeSlot[] = [
  { start: '07:30', end: '08:15' },
  { start: '08:30', end: '09:15' },
  { start: '09:30', end: '10:15' },
  { start: '10:30', end: '11:15' },
  { start: '11:30', end: '12:15' },
  { start: '12:30', end: '13:15' },
  { start: '13:15', end: '13:45', lunch: true },
  { start: '13:45', end: '14:30' },
  { start: '14:45', end: '15:30' },
  { start: '15:45', end: '16:30' },
  { start: '16:45', end: '17:30' },
  { start: '17:45', end: '18:30' },
  { start: '18:45', end: '19:30' }
];

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

export const DAY_NAMES: Record<string, string> = {
  monday: 'Понеделник',
  tuesday: 'Вторник',
  wednesday: 'Сряда',
  thursday: 'Четвъртък',
  friday: 'Петък'
};

export const CONTROL_FORMS: Record<string, string> = {
  none: '',
  exam: 'Изпит',
  continuous: 'Текуща оценка'
};

export const PROJECT_TYPES: Record<string, string> = {
  none: '',
  'course-project': 'Курсов проект',
  coursework: 'Курсова работа',
  thesis: 'Дипломна работа'
};

export const SUBGROUP_LABELS: Record<string, string> = {
  none: '',
  A: 'Група А',
  B: 'Група Б'
};

export const SUBJECT_TYPE_LABELS: Record<string, string> = {
  lecture: 'Лекция',
  seminar: 'Семинарно упражнение',
  lab: 'Лабораторно упражнение'
};

export const BULGARIAN_MONTHS = [
  'Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни',
  'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'
];



export function getSlotIndex(time: string): number {
  return TIME_SLOTS.findIndex(s => s.start === time);
}

export function getEndSlotIndex(time: string): number {
  // Find the slot where end_time matches the slot's end OR
  // find the last slot that starts before the end_time
  const exactMatch = TIME_SLOTS.findIndex(s => s.end === time);
  if (exactMatch !== -1) return exactMatch;
  
  // If no exact match, find the slot that contains this end time
  for (let i = TIME_SLOTS.length - 1; i >= 0; i--) {
    if (TIME_SLOTS[i].start < time && !TIME_SLOTS[i].lunch) {
      return i;
    }
  }
  return -1;
}

export function getSlotCountBetween(startTime: string, endTime: string): number {
  const startIdx = getSlotIndex(startTime);
  let count = 0;
  
  for (let i = startIdx; i < TIME_SLOTS.length; i++) {
    if (TIME_SLOTS[i].lunch) continue;
    if (TIME_SLOTS[i].end <= endTime) {
      count++;
    } else {
      break;
    }
  }
  
  return Math.max(1, count);
}

export function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
