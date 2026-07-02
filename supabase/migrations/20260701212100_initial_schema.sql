-- =============================================================
-- FlowOS Initial Schema Migration 
-- July 1, 2026
-- 20260715000000_initial_schema.sql
-- Based on Section 3.2 of the FlowOS Handbook
-- =============================================================
-- NOTE: The `users` table is managed by Supabase Auth.
-- Do not create it manually. All tables reference auth.users.
-- =============================================================


-- =============================================================
-- WORKSPACES
-- =============================================================
CREATE TABLE workspaces (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid REFERENCES auth.users NOT NULL,
  name             text NOT NULL,
  plan             text NOT NULL,
  stripe_customer_id text,
  created_at       timestamptz DEFAULT now()
);

--===============================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace"
  ON workspaces FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own workspace"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own workspace"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own workspace"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());


-- =============================================================
-- WORKSPACE_MEMBERS
-- Complex RLS: users in the same workspace can see each other
-- See packages/core/src/supabase/workspace.ts for the pattern
-- =============================================================
CREATE TABLE workspace_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces NOT NULL,
  user_id      uuid REFERENCES auth.users NOT NULL,
  role         text NOT NULL CHECK (role IN ('owner', 'member', 'assistant')),
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view members in same workspace"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own membership"
  ON workspace_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own membership"
  ON workspace_members FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own membership"
  ON workspace_members FOR DELETE
  USING (user_id = auth.uid());


-- =============================================================
-- MISSIONS
-- One active mission per user — upsert pattern
-- =============================================================
CREATE TABLE missions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL,
  text       text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON missions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON missions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON missions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON missions FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- ROLES
-- Max 12 active per user — enforce in application layer
-- =============================================================
CREATE TABLE roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  name        text NOT NULL,
  color       text,
  emoji       text,
  order_index int NOT NULL DEFAULT 0,
  active      bool NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON roles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON roles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON roles FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- GOALS
-- week_number + year for weekly grouping
-- =============================================================
CREATE TABLE goals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id     uuid REFERENCES roles,
  user_id     uuid REFERENCES auth.users NOT NULL,
  text        text NOT NULL,
  timeframe   text NOT NULL CHECK (timeframe IN ('week', 'month', 'year', '3year', 'longterm')),
  done        bool NOT NULL DEFAULT false,
  week_number int,
  year        int,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON goals FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON goals FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- TASKS
-- crdt_doc stores Automerge binary for per-task CRDT
-- =============================================================
CREATE TABLE tasks (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES auth.users NOT NULL,
  workspace_id       uuid REFERENCES workspaces,
  title              text NOT NULL,
  body               text,
  role_id            uuid REFERENCES roles,
  priority           int CHECK (priority BETWEEN 1 AND 3),
  status             text NOT NULL DEFAULT 'todo'
                       CHECK (status IN ('todo', 'inprogress', 'done', 'archived')),
  due_date           date,
  is_mit             bool NOT NULL DEFAULT false,
  estimated_mins     int,
  actual_mins        int,
  cognitive_load     int CHECK (cognitive_load BETWEEN 1 AND 5),
  energy_zone        text CHECK (energy_zone IN ('investment', 'crisis', 'noise', 'void')),
  expected_apps_json jsonb,
  billable           bool NOT NULL DEFAULT false,
  billable_rate      numeric,
  depends_on_task_id uuid REFERENCES tasks,
  external_source    text,
  external_id        text,
  crdt_doc           bytea,
  created_at         timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON tasks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON tasks FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- TIME_BLOCKS
-- type drives UI colour and auto-behaviours
-- =============================================================
CREATE TABLE time_blocks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  date              date NOT NULL,
  title             text NOT NULL,
  start_time        time NOT NULL,
  end_time          time NOT NULL,
  type              text NOT NULL
                      CHECK (type IN ('focus', 'meeting', 'investment', 'nsdr', 'shutdown', 'buffer', 'free')),
  role_id           uuid REFERENCES roles,
  calendar_event_id text,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON time_blocks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON time_blocks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON time_blocks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON time_blocks FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- HABITS
-- is_flexible_block: enables calendar block mode
-- =============================================================
CREATE TABLE habits (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users NOT NULL,
  quadrant         text NOT NULL CHECK (quadrant IN ('physical', 'mental', 'spiritual', 'social')),
  title            text NOT NULL,
  frequency        text NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  order_index      int NOT NULL DEFAULT 0,
  is_flexible_block bool NOT NULL DEFAULT false,
  block_start_time time,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON habits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON habits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON habits FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON habits FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- HABIT_COMPLETIONS
-- One row per day per habit — unique constraint on (habit_id, completed_date)
-- =============================================================
CREATE TABLE habit_completions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id       uuid REFERENCES habits NOT NULL,
  user_id        uuid REFERENCES auth.users NOT NULL,
  completed_date date NOT NULL,
  created_at     timestamptz DEFAULT now(),
  UNIQUE (habit_id, completed_date)
);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON habit_completions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON habit_completions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON habit_completions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON habit_completions FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- REFLECTIONS
-- mood_emoji: one of energised|focused|neutral|tired|stressed
-- =============================================================
CREATE TABLE reflections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  type        text NOT NULL CHECK (type IN ('daily', 'weekly', 'quarterly')),
  body        text,
  ai_summary  text,
  week_number int,
  year        int,
  date        date,
  mood_emoji  text CHECK (mood_emoji IN ('energised', 'focused', 'neutral', 'tired', 'stressed')),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON reflections FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON reflections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON reflections FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON reflections FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- BRAINDUMP_ITEMS
-- processed_at null = unprocessed
-- =============================================================
CREATE TABLE braindump_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  body         text NOT NULL,
  source       text NOT NULL
                 CHECK (source IN ('manual', 'voice', 'whatsapp', 'email', 'extension', 'watch')),
  processed_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE braindump_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON braindump_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON braindump_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON braindump_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON braindump_items FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- NOTES
-- Full-text search index on title + body
-- =============================================================
CREATE TABLE notes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  workspace_id uuid REFERENCES workspaces,
  title        text NOT NULL,
  body         text,
  role_id      uuid REFERENCES roles,
  tags_json    jsonb,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX notes_fts_idx
  ON notes USING gin(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  );

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON notes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON notes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON notes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON notes FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- MEMOS
-- exported_url: Google Docs URL after export
-- =============================================================
CREATE TABLE memos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  workspace_id uuid REFERENCES workspaces,
  title        text NOT NULL,
  situation    text,
  options      text,
  decision     text,
  next_steps   text,
  exported_url text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON memos FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON memos FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON memos FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON memos FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- DAILY_READINESS
-- unique constraint on (user_id, date)
-- =============================================================
CREATE TABLE daily_readiness (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  date              date NOT NULL,
  score             int CHECK (score BETWEEN 0 AND 100),
  provider          text NOT NULL
                      CHECK (provider IN ('oura', 'whoop', 'garmin', 'apple', 'manual')),
  hrv               numeric,
  resting_hr        int,
  sleep_score       int,
  contributors_json jsonb,
  day_rescheduled   bool NOT NULL DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE daily_readiness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON daily_readiness FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON daily_readiness FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON daily_readiness FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON daily_readiness FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- MEETING_RECORDS
-- Created before focus_sessions (focus_sessions references this table)
-- source_tool: screencapturekit|iphone|tldv|fireflies|meetgeek|teams|google
-- =============================================================
CREATE TABLE meeting_records (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  calendar_event_id text,
  title             text NOT NULL,
  date              date,
  duration_mins     int,
  participants_json jsonb,
  transcript_text   text,
  summary_text      text,
  action_items_json jsonb,
  source_tool       text,
  lenses_json       jsonb,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE meeting_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON meeting_records FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON meeting_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON meeting_records FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON meeting_records FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- FOCUS_SESSIONS
-- active_apps_json: [{app, url, seconds}]
-- =============================================================
CREATE TABLE focus_sessions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  task_id           uuid REFERENCES tasks,
  started_at        timestamptz NOT NULL,
  ended_at          timestamptz,
  planned_mins      int,
  actual_mins       int,
  active_apps_json  jsonb,
  distraction_count int NOT NULL DEFAULT 0,
  completion_status text NOT NULL DEFAULT 'inprogress'
                      CHECK (completion_status IN ('done', 'inprogress', 'abandoned')),
  meeting_id        uuid REFERENCES meeting_records,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON focus_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON focus_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON focus_sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON focus_sessions FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- MORNING_PROTOCOL_LOGS
-- steps_completed_json: [{step_id, completed_at}]
-- =============================================================
CREATE TABLE morning_protocol_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users NOT NULL,
  date                date NOT NULL,
  steps_completed_json jsonb,
  completed_at        timestamptz,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE morning_protocol_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON morning_protocol_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON morning_protocol_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON morning_protocol_logs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON morning_protocol_logs FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- PERFORMANCE_INSIGHTS
-- Generated by Claude Haiku weekly and quarterly
-- =============================================================
CREATE TABLE performance_insights (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  week_number  int,
  year         int,
  type         text NOT NULL CHECK (type IN ('pattern_card', 'quarterly')),
  insight_text text,
  data_json    jsonb,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE performance_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON performance_insights FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON performance_insights FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON performance_insights FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON performance_insights FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- INTEGRATIONS
-- Tokens encrypted with AES-256 using SUPABASE_SERVICE_ROLE_KEY-derived key
-- =============================================================
CREATE TABLE integrations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  provider          text NOT NULL,
  access_token_enc  text,
  refresh_token_enc text,
  expires_at        timestamptz,
  metadata_json     jsonb,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON integrations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON integrations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON integrations FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON integrations FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- ASSISTANT_PERMISSIONS
-- No direct user_id — RLS via workspace ownership
-- permissions_json: {read_calendar, write_calendar, cancel_calendar,
--                    create_tasks, send_drafts, see_mits, see_roles}
-- =============================================================
CREATE TABLE assistant_permissions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id      uuid REFERENCES workspaces NOT NULL,
  assistant_user_id uuid REFERENCES auth.users NOT NULL,
  permissions_json  jsonb,
  granted_by        uuid REFERENCES auth.users NOT NULL,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE assistant_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace owners can view assistant permissions"
  ON assistant_permissions FOR SELECT
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Workspace owners can insert assistant permissions"
  ON assistant_permissions FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Workspace owners can update assistant permissions"
  ON assistant_permissions FOR UPDATE
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Workspace owners can delete assistant permissions"
  ON assistant_permissions FOR DELETE
  USING (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));


-- =============================================================
-- SCHEDULING_LINKS
-- config_json: {blocked_days, buffer_before, buffer_after, max_per_day}
-- =============================================================
CREATE TABLE scheduling_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  slug        text NOT NULL UNIQUE,
  config_json jsonb,
  active      bool NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE scheduling_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON scheduling_links FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON scheduling_links FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON scheduling_links FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON scheduling_links FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- NOTIFICATIONS_LOG
-- Enforce prikkel-budget (max 3/day) by checking count before sending
-- =============================================================
CREATE TABLE notifications_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users NOT NULL,
  type       text NOT NULL,
  sent_at    timestamptz NOT NULL DEFAULT now(),
  channel    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON notifications_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON notifications_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON notifications_log FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON notifications_log FOR DELETE USING (user_id = auth.uid());
