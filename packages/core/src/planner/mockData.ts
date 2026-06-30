// packages/core/src/planner/mockData.ts
// Stand-in for buildDayPlan() output (Section 7.1) until the real
// scheduling engine + Supabase wiring exists. Swap mockDayPlan for
// buildDayPlan(input) once packages/core/src/planner/autopilot.ts lands.

import type { TimeBlock } from "../models/planner";

export const mockDayPlan: TimeBlock[] = [
  {
    id: "block-1",
    type: "investment",
    title: "Deep Work — Q3 Strategy Doc",
    start_time: "08:00",
    end_time: "09:30",
  },
  {
    id: "block-2",
    type: "task",
    title: "Review contract redlines",
    start_time: "09:50",
    end_time: "10:50",
    cognitive_load: 4,
    task_id: "task-101",
  },
  {
    id: "block-3",
    type: "break",
    title: "Break",
    start_time: "10:50",
    end_time: "11:10",
  },
  {
    id: "block-4",
    type: "task",
    title: "Client follow-up emails",
    start_time: "11:10",
    end_time: "12:00",
    cognitive_load: 2,
    task_id: "task-102",
  },
  {
    id: "block-5",
    type: "nsdr",
    title: "NSDR",
    start_time: "12:30",
    end_time: "12:50",
  },
  {
    id: "block-6",
    type: "task",
    title: "Prep board meeting slides",
    start_time: "13:00",
    end_time: "14:30",
    cognitive_load: 5,
    task_id: "task-103",
  },
  {
    id: "block-7",
    type: "shutdown",
    title: "Shutdown ritual",
    start_time: "17:30",
    end_time: "17:50",
  },
];
