// apps/mobile/context/AuthContext.tsx
// Session state for the app. Every Supabase call is delegated to @flowos/core
// (Definition of Done: "Supabase queries only in packages/core/src/supabase/").
// This file holds React state and nothing else.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createFlowOSClient,
  getCurrentUserId,
  signIn as coreSignIn,
  signUp as coreSignUp,
  signOut as coreSignOut,
  syncOnboarding,
  type Result,
  type WizardState,
} from "@flowos/core";

// AsyncStorage is a native module, so it is injected here rather than imported
// inside packages/core — importing it there would reintroduce the duplicate
// react-native resolution documented in the README.
createFlowOSClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  storage: AsyncStorage,
});

export const WIZARD_STORAGE_KEY = "flowos.onboarding.wizardProgress";
export const PENDING_SYNC_KEY = "flowos.onboarding.pendingSync";

interface AuthContextValue {
  userId: string | null;
  hydrated: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<Result<{ userId: string }>>;
  signUp: (
    email: string,
    password: string
  ) => Promise<Result<{ userId: string }>>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * One retry per launch. If the onboarding write failed — offline, or the
 * session hadn't landed yet — replay it from the wizard state still held in
 * AsyncStorage. syncOnboarding is idempotent, so replaying is safe.
 */
async function retryPendingSync(userId: string): Promise<void> {
  try {
    const pending = await AsyncStorage.getItem(PENDING_SYNC_KEY);
    if (!pending) return;

    const raw = await AsyncStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) {
      // Nothing left to replay — clear the flag so we stop trying.
      await AsyncStorage.removeItem(PENDING_SYNC_KEY);
      return;
    }

    const state = JSON.parse(raw)?.wizardState as WizardState | undefined;
    if (!state) {
      await AsyncStorage.removeItem(PENDING_SYNC_KEY);
      return;
    }

    const result = await syncOnboarding(userId, state);
    if (result.ok) {
      await AsyncStorage.multiRemove([PENDING_SYNC_KEY, WIZARD_STORAGE_KEY]);
    }
  } catch {
    // Leave the flag set and try again on the next launch.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    getCurrentUserId()
      .then(async (id) => {
        setUserId(id);
        if (id) await retryPendingSync(id);
      })
      .catch(() => setUserId(null))
      .finally(() => setHydrated(true));
  }, []);

  async function signIn(email: string, password: string) {
    const result = await coreSignIn(email, password);
    if (result.ok) setUserId(result.data.userId);
    return result;
  }

  async function signUp(email: string, password: string) {
    const result = await coreSignUp(email, password);
    if (result.ok) setUserId(result.data.userId);
    return result;
  }

  async function signOut() {
    await coreSignOut();
    setUserId(null);
    // The wizard progress key is device-global, so without this a second user
    // on the same device would resume the first user's half-finished wizard.
    await AsyncStorage.multiRemove([
      WIZARD_STORAGE_KEY,
      PENDING_SYNC_KEY,
    ]).catch(() => {});
  }

  const value = useMemo(
    () => ({ userId, hydrated, signIn, signUp, signOut }),
    [userId, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
