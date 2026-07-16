// apps/mobile/context/WizardContext.tsx
// Shared in-memory state across the 9 onboarding steps, so a selection made in
// an earlier step (e.g. profile template roles) is available in later steps
// (e.g. first-week-goal) instead of being lost between screens.
//
// Also persists progress to AsyncStorage so that closing the app mid-wizard
// resumes from the last completed step on next launch (spec: "Global wizard
// behaviour — Exit behaviour"). This is purely local/device state — it does
// NOT touch Supabase, since the onboarding data writes are still blocked on
// the auth session + DB migrations landing (see packages/core/src/supabase/).

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { INITIAL_WIZARD_STATE, type WizardState } from "@flowos/core";

const STORAGE_KEY = "flowos.onboarding.wizardProgress";

interface StoredProgress {
  wizardState: WizardState;
  lastRoute: string;
}

interface WizardContextValue {
  wizardState: WizardState;
  updateWizardState: (patch: Partial<WizardState>) => void;
  hydrated: boolean;
  resumeRoute: string | null;
  clearProgress: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [wizardState, setWizardState] = useState<WizardState>(INITIAL_WIZARD_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [resumeRoute, setResumeRoute] = useState<string | null>(null);
  const pathname = usePathname();
  const skipNextPersist = useRef(true);

  // Hydrate once on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const stored: StoredProgress = JSON.parse(raw);
          // Only offer to resume an in-progress (not yet completed) wizard,
          // and only if it's not still sitting on the Welcome screen.
          if (!stored.wizardState.completedAt && stored.lastRoute !== "/onboarding") {
            setWizardState(stored.wizardState);
            setResumeRoute(stored.lastRoute);
          }
        }
      })
      .catch(() => {
        // Corrupt or unavailable storage — fall back to a fresh wizard.
      })
      .finally(() => setHydrated(true));
  }, []);

  // Persist on every state or route change, once hydration has completed.
  useEffect(() => {
    if (!hydrated) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    const payload: StoredProgress = { wizardState, lastRoute: pathname };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
      // Best-effort — losing resume state is not fatal.
    });
  }, [wizardState, pathname, hydrated]);

  function updateWizardState(patch: Partial<WizardState>) {
    setWizardState((prev) => ({ ...prev, ...patch }));
  }

  function clearProgress() {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }

  const value = useMemo(
    () => ({ wizardState, updateWizardState, hydrated, resumeRoute, clearProgress }),
    [wizardState, hydrated, resumeRoute]
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return ctx;
}
