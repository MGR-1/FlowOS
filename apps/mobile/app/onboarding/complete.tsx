// apps/mobile/app/onboarding/complete.tsx
// Wizard end state — spec §6 "Post-Wizard: Progressive Disclosure Setup"
//
// NOTE: The spec's secondary "Show me around first" tooltip tour (US-070) is
// listed as an open question in the spec itself (§8 — not yet confirmed for
// Sprint 1 vs Sprint 2), so it's intentionally not built here.

import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";
import { useWizard } from "../../context/WizardContext";

export default function OnboardingCompleteScreen() {
  const { t } = useTranslation();
  const { updateWizardState, clearProgress } = useWizard();

  useEffect(() => {
    // Mark complete so resume-on-relaunch stops offering to resume, and drop
    // the persisted in-progress record now that the wizard is finished.
    updateWizardState({ completedAt: new Date().toISOString() });
    clearProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleContinue() {
    // "Today" screen doesn't exist as a real destination yet — timeline.tsx
    // is the closest current shell (tracker: "UI shell with mock data, not
    // wired to real data"). Route there until the real Today screen lands.
    router.replace("/timeline");
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoRing}>
          <Text style={styles.logoText}>F</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.heading}>{t("onboarding.complete.heading")}</Text>
        <Text style={styles.subheading}>{t("onboarding.complete.subheading")}</Text>
      </View>
      <Button label={t("onboarding.complete.primaryCta")} onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  logoArea: {
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.accent.success,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.accent.success,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
  },
  body: {
    gap: spacing.lg,
  },
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
    textAlign: "center",
  },
  subheading: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.6,
    textAlign: "center",
  },
});
