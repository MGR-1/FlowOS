// packages/core/src/supabase/client.ts
// Single Supabase client for the whole app.
//
// Storage is INJECTED rather than imported. AsyncStorage is a native module,
// and packages/* must stay free of native dependencies — see README "Duplicate
// React Native resolution". Injection also lets this be tested under plain Node.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseAuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface FlowOSClientConfig {
  url: string;
  anonKey: string;
  storage: SupabaseAuthStorage;
}

let client: SupabaseClient | null = null;

export function createFlowOSClient(config: FlowOSClientConfig): SupabaseClient {
  if (client) return client;

  if (!config.url) {
    throw new Error(
      "Supabase URL is empty. Set EXPO_PUBLIC_SUPABASE_URL in .env.local."
    );
  }
  if (!config.anonKey) {
    throw new Error(
      "Supabase anon key is empty. Set EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  client = createClient(config.url, config.anonKey, {
    auth: {
      storage: config.storage,
      autoRefreshToken: true,
      persistSession: true,
      // React Native has no URL bar to parse a session out of.
      detectSessionInUrl: false,
    },
  });

  return client;
}

export function getFlowOSClient(): SupabaseClient {
  if (!client) {
    throw new Error(
      "Supabase client not initialised. Call createFlowOSClient() at app start."
    );
  }
  return client;
}

/** Test-only. Clears the singleton between test cases. */
export function resetFlowOSClient(): void {
  client = null;
}
