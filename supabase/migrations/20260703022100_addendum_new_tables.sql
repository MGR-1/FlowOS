-- =============================================================
-- New Tables Migration
-- 20260703022100_addendum_new_tables.sql
-- Adds 9 new tables alongside the 23 tables in v2.1
-- Rules: RLS on all tables, user_id on all tables, additive only
-- =============================================================


-- =============================================================
-- NUTRITION_LOGS
-- Daily nutrition + lifestyle check-in
-- source: manual | wearable | voice
-- =============================================================
CREATE TABLE nutrition_logs (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid REFERENCES auth.users NOT NULL,
  date                     date NOT NULL,
  caffeine_before_cutoff   bool,
  caffeine_count           int,
  last_meal_time           time,
  protein_goal_met         bool,
  hydration_500ml_morning  bool,
  notes_voice_raw          text,
  source                   text CHECK (source IN ('manual', 'wearable', 'voice')),
  created_at               timestamptz DEFAULT now()
);

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON nutrition_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON nutrition_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON nutrition_logs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON nutrition_logs FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- BIOMARKERS
-- Blood test results and biomarker history
-- provider: apple_health | manual
-- Local-only by default
-- =============================================================
CREATE TABLE biomarkers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  test_date   date NOT NULL,
  provider    text CHECK (provider IN ('apple_health', 'manual')),
  marker_name text NOT NULL,
  value       numeric,
  unit        text,
  notes       text,
  source_app  text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON biomarkers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON biomarkers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON biomarkers FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON biomarkers FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- SUPPLEMENT_LOGS
-- Daily supplement intake
-- Correlated with HRV and Investment Score after 60 days
-- Local-only by default
-- =============================================================
CREATE TABLE supplement_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  date            date NOT NULL,
  supplement_name text NOT NULL,
  dose_mg         numeric,
  timing          text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON supplement_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON supplement_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON supplement_logs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON supplement_logs FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- CHRONOTYPE_PROFILES
-- Self-report at onboarding (assessed_type) and behavioural
-- detection after 30 days (detected_type)
-- data_source: self_report | behaviour
-- Sync enabled
-- =============================================================
CREATE TABLE chronotype_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users NOT NULL,
  assessed_type     text CHECK (assessed_type IN ('lion', 'bear', 'wolf', 'dolphin')),
  detected_type     text CHECK (detected_type IN ('lion', 'bear', 'wolf', 'dolphin')),
  peak_window_start time,
  peak_window_end   time,
  last_assessed_at  timestamptz,
  data_source       text CHECK (data_source IN ('self_report', 'behaviour')),
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE chronotype_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON chronotype_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON chronotype_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON chronotype_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON chronotype_profiles FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- CIRCADIAN_EVENTS
-- Daily circadian data
-- Screen/Mac timestamps as sleep proxy when wearable unavailable
-- Nap detection from wearable or NSDR session
-- Local-only by default
-- =============================================================
CREATE TABLE circadian_events (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid REFERENCES auth.users NOT NULL,
  date                   date NOT NULL,
  last_screen_touch_time timestamptz,
  last_mac_activity_time timestamptz,
  detected_sleep_start   timestamptz,
  wearable_sleep_start   timestamptz,
  morning_light_mins     int,
  nap_detected           bool,
  nap_start              timestamptz,
  nap_duration_mins      int,
  created_at             timestamptz DEFAULT now()
);

ALTER TABLE circadian_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON circadian_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON circadian_events FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON circadian_events FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON circadian_events FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- WEEKLY_PERFORMANCE_REPORTS
-- Full weekly report
-- data_json: all ring values, correlations, concept week
-- html_content: rendered email HTML — purged after 90 days
-- shared_with_pa: boolean per report
-- Sync enabled
-- =============================================================
CREATE TABLE weekly_performance_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  week_number  int NOT NULL,
  year         int NOT NULL,
  generated_at timestamptz,
  data_json    jsonb,
  html_content text,
  planning_day int CHECK (planning_day BETWEEN 0 AND 6),
  email_sent_at timestamptz,
  shared_with_pa bool NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE weekly_performance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON weekly_performance_reports FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON weekly_performance_reports FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON weekly_performance_reports FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON weekly_performance_reports FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- URGENCY_INDEX_ASSESSMENTS
-- Urgency Index baseline (onboarding) and weekly drift score
-- profile_type: prioritizer | procrastinator | yes_man | slacker
-- Sync enabled
-- =============================================================
CREATE TABLE urgency_index_assessments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  assessed_at  timestamptz NOT NULL,
  q1_score     int,
  q2_score     int,
  q3_score     int,
  q4_score     int,
  q5_score     int,
  q6_score     int,
  q7_score     int,
  q8_score     int,
  q9_score     int,
  q10_score    int,
  q11_score    int,
  q12_score    int,
  q13_score    int,
  q14_score    int,
  q15_score    int,
  q16_score    int,
  total_score  int,
  profile_type text CHECK (profile_type IN ('prioritizer', 'procrastinator', 'yes_man', 'slacker')),
  drift_score  numeric,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE urgency_index_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON urgency_index_assessments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON urgency_index_assessments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON urgency_index_assessments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON urgency_index_assessments FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- CONTEXT_SWITCHES
-- One row per app switch during a focus session
-- minutes_lost_estimate defaults to 23, personalised after 30 days
-- Local-only (NSWorkspace data — not transmitted without consent)
-- =============================================================
CREATE TABLE context_switches (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES auth.users NOT NULL,
  focus_session_id     uuid REFERENCES focus_sessions,
  switched_at          timestamptz NOT NULL,
  from_app             text,
  to_app               text,
  minutes_lost_estimate int NOT NULL DEFAULT 23,
  created_at           timestamptz DEFAULT now()
);

ALTER TABLE context_switches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON context_switches FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON context_switches FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON context_switches FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON context_switches FOR DELETE USING (user_id = auth.uid());


-- =============================================================
-- WEEK_INTENTIONS
-- Monday intention-setting panel
-- Compared against actual Investment Score and role time on planning day
-- Sync enabled
-- =============================================================
CREATE TABLE week_intentions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid REFERENCES auth.users NOT NULL,
  week_number            int NOT NULL,
  year                   int NOT NULL,
  q2_target_pct          numeric,
  role_intentions_json   jsonb,
  one_sentence_intention text,
  created_at             timestamptz DEFAULT now()
);

ALTER TABLE week_intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rows"
  ON week_intentions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rows"
  ON week_intentions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rows"
  ON week_intentions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own rows"
  ON week_intentions FOR DELETE USING (user_id = auth.uid());
