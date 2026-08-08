-- FlowOS performance core
-- Additive-only migration for approval-independent Sprint 2 features.

CREATE TABLE performance_protocol_configs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  protocol_type   text NOT NULL CHECK (protocol_type IN ('morning', 'shutdown')),
  enabled         bool NOT NULL DEFAULT true,
  local_time      time,
  allow_override  bool NOT NULL DEFAULT true,
  lock_mits       bool NOT NULL DEFAULT false,
  steps_json      jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, protocol_type)
);

ALTER TABLE performance_protocol_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own protocol configs" ON performance_protocol_configs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own protocol configs" ON performance_protocol_configs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own protocol configs" ON performance_protocol_configs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own protocol configs" ON performance_protocol_configs FOR DELETE USING (user_id = auth.uid());

CREATE TABLE performance_protocol_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  protocol_type   text NOT NULL CHECK (protocol_type IN ('morning', 'shutdown')),
  run_date        date NOT NULL,
  status          text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'overridden')),
  progress_json   jsonb NOT NULL DEFAULT '[]'::jsonb,
  day_summary     text,
  started_at      timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, protocol_type, run_date)
);

ALTER TABLE performance_protocol_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own protocol runs" ON performance_protocol_runs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own protocol runs" ON performance_protocol_runs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own protocol runs" ON performance_protocol_runs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own protocol runs" ON performance_protocol_runs FOR DELETE USING (user_id = auth.uid());

CREATE TABLE nsdr_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  duration_minutes  int NOT NULL CHECK (duration_minutes IN (10, 15, 20)),
  status            text NOT NULL CHECK (status IN ('running', 'paused', 'completed', 'abandoned')),
  started_at        timestamptz NOT NULL,
  completed_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE nsdr_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own nsdr sessions" ON nsdr_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own nsdr sessions" ON nsdr_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own nsdr sessions" ON nsdr_sessions FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own nsdr sessions" ON nsdr_sessions FOR DELETE USING (user_id = auth.uid());

CREATE TABLE tracked_intervals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  task_id     uuid REFERENCES tasks,
  zone        text NOT NULL CHECK (zone IN ('investment', 'maintenance', 'reactive', 'waste')),
  started_at  timestamptz NOT NULL,
  ended_at    timestamptz NOT NULL,
  source      text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'timer', 'automatic')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (ended_at > started_at)
);

CREATE INDEX tracked_intervals_user_started_idx ON tracked_intervals (user_id, started_at DESC);
ALTER TABLE tracked_intervals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tracked intervals" ON tracked_intervals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own tracked intervals" ON tracked_intervals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tracked intervals" ON tracked_intervals FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own tracked intervals" ON tracked_intervals FOR DELETE USING (user_id = auth.uid());

CREATE TABLE reflection_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users NOT NULL,
  cadence       text NOT NULL CHECK (cadence IN ('daily', 'weekly', 'monthly')),
  period_start  date NOT NULL,
  period_end    date NOT NULL,
  answers_json  jsonb NOT NULL DEFAULT '[]'::jsonb,
  mood_emoji    text CHECK (mood_emoji IN ('energised', 'focused', 'neutral', 'tired', 'stressed')),
  ai_summary    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (period_end >= period_start),
  UNIQUE (user_id, cadence, period_start)
);

CREATE INDEX reflection_entries_user_period_idx ON reflection_entries (user_id, period_start DESC);
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reflection entries" ON reflection_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own reflection entries" ON reflection_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reflection entries" ON reflection_entries FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own reflection entries" ON reflection_entries FOR DELETE USING (user_id = auth.uid());
