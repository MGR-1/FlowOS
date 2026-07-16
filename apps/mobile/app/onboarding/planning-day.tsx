// apps/mobile/app/onboarding/planning-day.tsx
// Step 7 of 9 — Planning Day Selection (not skippable)
// Horizontal radio row: Mon Tue Wed Thu Fri Sat Sun, default Friday

import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";
import {
  PLANNING_DAY_LABELS,
  DEFAULT_PLANNING_DAY,
  type PlanningDay,
} from "@flowos/core";
import { useWizard } from "./_WizardContext";

const DAY_ORDER: PlanningDay[] = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun

export default function PlanningDayScreen() {
  const { t } = useTranslation();
  const { wizardState, updateWizardState } = useWizard();
  const [selected, setSelected] = useState<PlanningDay>(DEFAULT_PLANNING_DAY);

  function handleContinue() {
    // TODO: store to users.planning_day via Supabase
    updateWizardState({ planningDay: selected });
    console.log("Planning day selected:", PLANNING_DAY_LABELS[selected]);
    // Chaos-mode skips Import (step 8) — modified step order per spec §5
    if (wizardState.profileTemplate === "chaos") {
      router.push("/onboarding/urgency-index");
    } else {
      router.push("/onboarding/import");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>{t("onboarding.planningDay.stepLabel")}</Text>
        <Text style={styles.heading}>{t("onboarding.planningDay.heading")}</Text>
        <Text style={styles.subheading}>{t("onboarding.planningDay.subheading")}</Text>
      </View>

      {/* Horizontal day selector */}
      <View style={styles.dayRow}>
        {DAY_ORDER.map((day) => (
          <Pressable
            key={day}
            onPress={() => setSelected(day)}
            style={[
              styles.dayButton,
              selected === day && styles.dayButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.dayLabel,
                selected === day && styles.dayLabelSelected,
              ]}
            >
              {t(`onboarding.planningDay.days.${day}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Live confirmation sentence */}
      <View style={styles.confirmBox}>
        <Text style={styles.confirmText}>
          {t("onboarding.planningDay.confirmPrefix")}{" "}
          <Text style={styles.confirmHighlight}>
            {t(`onboarding.planningDay.days.${selected}`)}
          </Text>
          {t("onboarding.planningDay.confirmSuffix")}
        </Text>
      </View>

      <Button label={t("onboarding.planningDay.cta")} onPress={handleContinue} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  stepLabel: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
  },
  subheading: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.6,
  },
  dayRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  dayButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
  },
  dayButtonSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  dayLabel: {
    color: colors.text.secondary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
  },
  dayLabelSelected: {
    color: colors.text.primary,
  },
  confirmBox: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  confirmText: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.6,
  },
  confirmHighlight: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold as any,
  },
});
