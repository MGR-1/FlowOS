// packages/core/src/models/planner.ts
// Types matching Section 7.1 (Autoplanning) — buildDayPlan() returns TimeBlock[]

export type BlockType =
  | "investment"
  | "task"
  | "nsdr"
  | "shutdown"
  | "break";

export interface TimeBlock {
  id: string;
  type: BlockType;
  title: string;
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
  cognitive_load?: number; // 1-5, only present on task blocks
  task_id?: string;
}

export interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  cognitive_load: number; // 1-5
  estimated_mins?: number;
}

export interface CalendarEvent {
  id: string;
  type: "investment" | "meeting" | "other";
  title: string;
  start_time: string;
  end_time: string;
}

export interface DayPlanInput {
  tasks: Task[];
  readinessScore: number; // 0-100
  calendarEvents: CalendarEvent[];
  workHours: { start: string; end: string };
  settings: { shutdownTime: string };
}
