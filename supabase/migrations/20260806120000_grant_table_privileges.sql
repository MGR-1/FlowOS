-- =============================================================
-- Grant table privileges to the authenticated role
-- 20260806120000_grant_table_privileges.sql
--
-- WHY THIS EXISTS
-- Every table in public has RLS enabled and four policies, but none of
-- them had been granted to a client role. RLS narrows what a role may
-- see; it does not grant access in the first place. Without a GRANT,
-- PostgREST rejects the request with "permission denied for table X"
-- before any policy is evaluated.
--
-- Verified before writing this: 0 of 32 tables granted SELECT to
-- `authenticated`. Every read and write from the app failed, including
-- writing onboarding results.
--
-- Additive only — no table, column, policy or constraint is altered.
--
-- NOTE FOR DEV C: this is infrastructure sitting under your schema
-- rather than a change to it. Flagging rather than assuming: if the
-- hosted project already carries these grants, this migration is a
-- harmless no-op there, but local `supabase db reset` needs it.
-- =============================================================


-- The role must be able to see the schema before it can see anything in it.
GRANT USAGE ON SCHEMA public TO authenticated;

-- Row access is still governed entirely by the existing RLS policies,
-- every one of which requires user_id = auth.uid().
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public
  TO authenticated;

-- Applies the same grants to tables added by future migrations, so a new
-- table does not silently arrive unreachable the way these 32 did.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES
  TO authenticated;


-- `anon` is deliberately NOT granted table access.
--
-- Sign-up and sign-in run through GoTrue, not PostgREST, so an anonymous
-- client never needs to reach these tables. Every policy also requires
-- user_id = auth.uid(), which is null for anon — so any grant here would
-- return zero rows while widening the surface area for nothing.
