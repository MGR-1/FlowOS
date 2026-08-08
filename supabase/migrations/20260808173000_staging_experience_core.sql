-- FlowOS staging experience core
-- Additive persistence for recovery, homepage, dictation and Mac settings.

CREATE TABLE recovery_logs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid REFERENCES auth.users NOT NULL,
  log_date              date NOT NULL,
  sleep_hours           numeric(4,2) NOT NULL CHECK (sleep_hours BETWEEN 0 AND 24),
  alcohol_last_night    bool NOT NULL,
  movement_today        bool NOT NULL,
  wearable_readiness    int CHECK (wearable_readiness BETWEEN 0 AND 100),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE recovery_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recovery logs" ON recovery_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own recovery logs" ON recovery_logs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own recovery logs" ON recovery_logs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own recovery logs" ON recovery_logs FOR DELETE USING (user_id = auth.uid());

CREATE TABLE homepage_layouts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL UNIQUE,
  version     int NOT NULL DEFAULT 1 CHECK (version > 0),
  widgets_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE homepage_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own homepage layout" ON homepage_layouts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own homepage layout" ON homepage_layouts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own homepage layout" ON homepage_layouts FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own homepage layout" ON homepage_layouts FOR DELETE USING (user_id = auth.uid());

CREATE TABLE dictation_preferences (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users NOT NULL UNIQUE,
  enabled             bool NOT NULL DEFAULT true,
  ai_post_processing  bool NOT NULL DEFAULT true,
  model               text NOT NULL DEFAULT 'medium' CHECK (model IN ('small', 'medium', 'large-v3')),
  shortcut            text NOT NULL DEFAULT 'Option+Space',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE dictation_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own dictation preferences" ON dictation_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own dictation preferences" ON dictation_preferences FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own dictation preferences" ON dictation_preferences FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own dictation preferences" ON dictation_preferences FOR DELETE USING (user_id = auth.uid());

CREATE TABLE mac_experience_settings (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid REFERENCES auth.users NOT NULL UNIQUE,
  distraction_shield_enabled  bool NOT NULL DEFAULT true,
  distraction_nudge_minutes   int NOT NULL DEFAULT 10 CHECK (distraction_nudge_minutes BETWEEN 1 AND 60),
  expected_bundle_ids_json    jsonb NOT NULL DEFAULT '[]'::jsonb,
  minimalist_shortcut         text NOT NULL DEFAULT 'Cmd+Shift+M',
  cursor_glow_enabled         bool NOT NULL DEFAULT true,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mac_experience_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own Mac settings" ON mac_experience_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own Mac settings" ON mac_experience_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own Mac settings" ON mac_experience_settings FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own Mac settings" ON mac_experience_settings FOR DELETE USING (user_id = auth.uid());

-- Dictation history and active-app observations remain local-only by design.
-- They must not be synced to Supabase.
