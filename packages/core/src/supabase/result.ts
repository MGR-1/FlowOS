// packages/core/src/supabase/result.ts
// Every data-layer call returns a Result instead of throwing, so screens never
// need try/catch and an unhandled rejection can't take down the UI.

export type Result<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function ok(): Result<void>;
export function ok<T>(data: T): Result<T>;
export function ok<T>(data?: T): Result<T | void> {
  return { ok: true, data: data as T };
}

export function err(error: string): Result<never> {
  return { ok: false, error };
}

/** Pulls a readable message off an unknown thrown value or Supabase error. */
export function errorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return fallback;
}
