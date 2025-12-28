export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  duration: number; // in minutes
  isCompleted: boolean;
  notes?: string;
}

export interface UserPreferences {
  startOfDay: string; // "09:00"
  endOfDay: string;   // "17:00"
  includeBreaks: boolean;
  focusPreference: string; // e.g., "Morning", "Afternoon"
}

export interface ScheduleItem {
  startTime: string;
  endTime: string;
  activity: string;
  reason: string;
  type: 'task' | 'break' | 'routine';
  durationMinutes: number;
}

export interface ScheduleResponse {
  schedule: ScheduleItem[];
  dailySummary: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  groundingUrls?: string[];
}

export type ImageSize = '1K' | '2K' | '4K';