-- =============================================================
-- Extended Columns on Existing Tables
-- 20260703032100_addendum_new_columns.sql
-- Adds new columns to tables that already exist in v2.1
-- Rules: additive only — do not alter or remove existing columns
-- =============================================================


-- =============================================================
-- USER_PROFILES
-- Separate profile table for user-specific settings
-- Cannot ALTER auth.users directly — this is the Supabase-safe pattern
-- user_id as PK guarantees one profile per user
-- Both columns nullable so profile can exist before onboarding fills them in
-- chronotype: lion | bear | wolf | dolphin
-- planning_day: 0–6 (Sunday=0, default Friday=5)
-- =============================================================
CREATE TABLE public.user_profiles (
  user_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  chronotype   text CHECK (chronotype IN ('lion', 'bear', 'wolf', 'dolphin')),
  planning_day smallint CHECK (planning_day BETWEEN 0 AND 6), -- 0 = Sunday, 5 = Friday
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- RLS
-- No INSERT policy — creation handled by trigger below
-- Clients cannot create rows for other users
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
-- security definer required — trigger fires as auth system
-- which has no direct rights on public schema
-- This is Supabase's own documented pattern
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id) VALUES (new.id);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================
-- TASKS
-- energy_impact: -1 | 0 | +1
-- environment_tag: home | office | cafe | travel | other
-- =============================================================
ALTER TABLE tasks
  ADD COLUMN energy_impact   int CHECK (energy_impact IN (-1, 0, 1)),
  ADD COLUMN environment_tag text CHECK (environment_tag IN ('home', 'office', 'cafe', 'travel', 'other'));


-- =============================================================
-- FOCUS_SESSIONS
-- context_switches: total app switches this session (count)
-- sprint_number: which sprint of the day (1st, 2nd...)
-- sprint_quality_score: 0–100 composite
-- environment_tag: home | office | cafe | travel | other
-- =============================================================
ALTER TABLE focus_sessions
  ADD COLUMN context_switches     int NOT NULL DEFAULT 0,
  ADD COLUMN sprint_number        int,
  ADD COLUMN sprint_quality_score int CHECK (sprint_quality_score BETWEEN 0 AND 100),
  ADD COLUMN environment_tag      text CHECK (environment_tag IN ('home', 'office', 'cafe', 'travel', 'other'));


-- =============================================================
-- REFLECTIONS
-- sentiment_score: -1.0 to +1.0 from Claude Haiku analysis
-- stress_word_count: raw count of stress-indicator vocabulary
-- =============================================================
ALTER TABLE reflections
  ADD COLUMN sentiment_score   numeric CHECK (sentiment_score BETWEEN -1.0 AND 1.0),
  ADD COLUMN stress_word_count int;


-- =============================================================
-- MEETING_RECORDS
-- energy_impact: user rates meeting energy after action item capture
-- -1 | 0 | +1
-- =============================================================
ALTER TABLE meeting_records
  ADD COLUMN energy_impact int CHECK (energy_impact IN (-1, 0, 1));


-- =============================================================
-- ASSISTANT_PERMISSIONS
-- can_view_performance_report: false by default
-- User enables per PA account explicitly
-- =============================================================
ALTER TABLE assistant_permissions
  ADD COLUMN can_view_performance_report bool NOT NULL DEFAULT false;


-- =============================================================
-- DAILY_READINESS
-- chronotype_match_score: 0–100
-- Did today's actual task timing match the user's chronotype peak window?
-- =============================================================
ALTER TABLE daily_readiness
  ADD COLUMN chronotype_match_score int CHECK (chronotype_match_score BETWEEN 0 AND 100);