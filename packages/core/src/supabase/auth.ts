// packages/core/src/supabase/auth.ts
// Thin typed wrappers over Supabase Auth. Email + password: no deep linking,
// which keeps the team's Expo Go QR workflow working (design spec §3).
//
// Nothing here throws. Screens get a Result and render the error string.

import { getFlowOSClient } from "./client";
import { ok, err, errorMessage, type Result } from "./result";

export async function signUp(
  email: string,
  password: string
): Promise<Result<{ userId: string }>> {
  try {
    const { data, error } = await getFlowOSClient().auth.signUp({
      email,
      password,
    });
    if (error) return err(errorMessage(error, "Could not create the account."));
    if (!data.user) {
      return err(
        "Account created but no session returned. Check your email to confirm, then sign in."
      );
    }
    return ok({ userId: data.user.id });
  } catch (e) {
    return err(errorMessage(e, "Could not create the account."));
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<Result<{ userId: string }>> {
  try {
    const { data, error } = await getFlowOSClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) return err(errorMessage(error, "Could not sign in."));
    if (!data.user) return err("Could not sign in.");
    return ok({ userId: data.user.id });
  } catch (e) {
    return err(errorMessage(e, "Could not sign in."));
  }
}

export async function signOut(): Promise<Result> {
  try {
    const { error } = await getFlowOSClient().auth.signOut();
    if (error) return err(errorMessage(error, "Could not sign out."));
    return ok();
  } catch (e) {
    return err(errorMessage(e, "Could not sign out."));
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await getFlowOSClient().auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
