// ─── FlowOS Types ────────────────────────────────────────────
// Mirror of the Supabase schema. Keep in sync with migrations.

export interface Workspace {
  id: string
  owner_id: string
  name: string
  plan: 'free' | 'pro' | 'team' | 'b2b_starter' | 'b2b_business' | 'b2b_enterprise'
  created_at: string
  updated_at: string
}

export interface Mission {
  id: string
  user_id: string
  workspace_id: string | null
  text: string
  updated_at: string
}

export interface Role {
  id: string
  user_id: string
  name: string
  color: string
  emoji: string | null
  order_index: number
  active: boolean
}

export interface Goal {
  id: string
  user_id: string
  role_id: string
  text: string
  timeframe: 'this_week' | 'this_month' | 'this_quarter' | 'one_to_three_years'
  done: boolean
  week_number: number | null
  year: number | null
}

export type TaskStatus =
  | 'inbox' | 'todo' | 'in_progress' | 'blocked'
  | 'decision_pending' | 'delegated' | 'done' | 'archived'

export type EnergyZone = 'investment' | 'maintenance' | 'reactive' | 'waste'

export interface Task {
  id: string
  user_id: string
  role_id: string | null
  title: string
  body: string | null
  priority: '1' | '2' | '3' | '4'
  status: TaskStatus
  due_date: string | null
  scheduled_date: string | null
  is_mit: boolean
  mit_order: number | null
  estimated_mins: number | null
  actual_mins: number | null
  cognitive_load: number | null
  energy_zone: EnergyZone | null
  billable: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type BlockType =
  | 'focus' | 'investment' | 'meeting' | 'nsdr'
  | 'shutdown' | 'buffer' | 'free' | 'habit'

export interface TimeBlock {
  id: string
  user_id: string
  role_id: string | null
  task_id: string | null
  date: string
  title: string
  start_time: string
  end_time: string
  type: BlockType
  is_investment_block: boolean
  calendar_event_id: string | null
}

export interface DailyReadiness {
  id: string
  user_id: string
  date: string
  score: number | null
  provider: string
  hrv: number | null
  resting_hr: number | null
  sleep_score: number | null
  sleep_hours: number | null
}

export interface FocusSession {
  id: string
  user_id: string
  task_id: string | null
  started_at: string
  ended_at: string | null
  planned_mins: number | null
  actual_mins: number | null
  completion_status: 'completed' | 'partial' | 'abandoned' | null
  focus_quality_score: number | null
  interrupt_count: number
}

export interface BraindumpItem {
  id: string
  user_id: string
  body: string
  type: 'task' | 'note' | 'event' | 'delegate' | 'idea' | 'unprocessed'
  processed_at: string | null
  created_at: string
}
