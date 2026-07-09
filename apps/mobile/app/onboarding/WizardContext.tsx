// apps/mobile/app/onboarding/WizardContext.tsx
// Shared in-memory state across the 9 onboarding steps, so a selection made in
// an earlier step (e.g. profile template roles) is available in later steps
// (e.g. first-week-goal) instead of being lost between screens.

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { INITIAL_WIZARD_STATE, type WizardState } from "@flowos/core";

interface WizardContextValue {
  wizardState: WizardState;
  updateWizardState: (patch: Partial<WizardState>) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [wizardState, setWizardState] = useState<WizardState>(INITIAL_WIZARD_STATE);

  const updateWizardState = (patch: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...patch }));
  };

  const value = useMemo(
    () => ({ wizardState, updateWizardState }),
    [wizardState]
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
