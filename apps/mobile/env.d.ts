// apps/mobile/env.d.ts
// Types for the environment variables Expo inlines at build time.
//
// Only EXPO_PUBLIC_* variables reach client code — the unprefixed
// SUPABASE_URL / SUPABASE_ANON_KEY in .env are for the Tauri desktop app and
// Edge Functions and are deliberately not declared here.
//
// Declared narrowly rather than pulling in @types/node, which would also make
// fs, path and other Node APIs look available inside a React Native app.

declare const process: {
  env: {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
  };
};
