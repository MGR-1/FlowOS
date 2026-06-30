# FlowOS

Personal operating system for founders, lawyers, consultants, and elite performers. Native Mac desktop app (Tauri 2.0) and native iOS/iPadOS app (React Native + Expo). Data lives locally in SQLite, syncs across devices via Supabase + Automerge CRDT, and works fully offline.

Architecture, feature specs, and integration details: see `FlowOS_Developer_Handbook`.

## Repo structure

```
apps/
  desktop/      # Tauri 2.0 — Developer A owns src-tauri/, shared src/ React UI
  mobile/       # Expo Router — Developer B owns all screens
packages/
  core/         # Shared TS business logic — models, supabase, sync, ai, wearables, integrations
  ui-shared/    # Design tokens + shared components — never hardcode colors/spacing/type
supabase/
  migrations/   # One .sql file per change, sequential numbers
  functions/    # Deno Edge Functions
```

## Setup

```bash
git clone git@github.com:MGR-1/FlowOS.git
cd FlowOS
pnpm install
cp .env.example .env.local      # fill in values, never commit this file
pnpm --filter @flowos/ui-shared build
```

**Requires Node 20 LTS.** If you're on a different major version, installs will still run but you'll see `Unsupported engine` warnings — switch via nvm before continuing.

### Running mobile (Expo)

```bash
cd apps/mobile
npx expo start
```

Scan the QR with Expo Go (Android or iOS). If your installed Expo Go version doesn't match the SDK version in `apps/mobile/package.json`, run `npx expo install --fix` to auto-align dependency versions — don't hand-edit version numbers.

### Running desktop (Tauri)

```bash
pnpm --filter desktop tauri dev
```

### Supabase (local)

```bash
supabase start
supabase db reset
```

## Known issues / fixes already applied

- **Windows + pnpm + Metro watcher crash** (`ENOENT ... watch`): fixed via `node-linker=hoisted` in root `.npmrc`. Don't remove this — pnpm's default symlinked `node_modules` structure breaks Metro's file watcher on Windows.
- **Duplicate React Native resolution** (`PlatformConstants could not be found`): caused by `packages/ui-shared` resolving its own nested copy of `react-native` instead of sharing the app's. Fixed via `apps/mobile/metro.config.js` (`disableHierarchicalLookup: true`, explicit `watchFolders`/`nodeModulesPaths`) plus `pnpm.overrides` in root `package.json` pinning a single `react`/`react-native`/`@types/react` version across the workspace. If you add a new shared package with native dependencies, keep `react`/`react-native` as `peerDependencies` only — never as direct dependencies inside `packages/*`.
- If you hit either of the above again after a clean install, the fix is usually: delete all `node_modules` + `pnpm-lock.yaml`, reinstall fresh — overrides and linker settings need a clean install to fully take effect.

## Environment variables

See `.env.example` for the full list and Section 2.3 of the handbook for where to source each value. Never commit `.env.local` — the pre-commit hook rejects it.

## Contributing

- Feature branches only, PR review required — no force-push to `main`.
- Read Sections 9 (Security) and 10 (Definition of Done) in the handbook before opening any PR.