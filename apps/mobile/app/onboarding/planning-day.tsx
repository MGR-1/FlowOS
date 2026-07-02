// apps/mobile/app/onboarding/planning-day.tsx
// Onboarding step: Planning Day Selection (Section 4.2)
// Position: after calendar connection (step 5), before import step (step 6)
// Skippable: NO — needed for report scheduling. Default pre-selected (Friday).

import { useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import {
  colors,
  spacing,
  typography,
  OptionCard,
  Button,
} from "@flowos/ui-shared";
import {
  PLANNING_DAY_LABELS,
  DEFAULT_PLANNING_DAY,
  type PlanningDay,
} from "@flowos/core";

export default function PlanningDayScreen() {
  const [selected, setSelected] = useState<PlanningDay>(DEFAULT_PLANNING_DAY);

  function handleContinue() {
    // TODO: store to users.planning_day via Supabase
    console.log("Planning day selected:", PLANNING_DAY_LABELS[selected]);
    // Navigate to Urgency Index (next step)
    router.push("/onboarding/urgency-index");
  }

  const days = Object.entries(PLANNING_DAY_LABELS) as [
    string,
    string
  ][];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 6 of 8</Text>
        <Text style={styles.heading}>Choose your planning day</Text>
        <Text style={styles.subheading}>
          On this day FlowOS will guide you through your weekly review and
          generate your Performance Report. Friday is the default — most people
          prefer to plan the new week before the weekend.
        </Text>
      </View>

      <View style={styles.options}>
        {days.map(([dayNum, label]) => (
          <OptionCard
            key={dayNum}
            label={label}
            sublabel={
              Number(dayNum) === DEFAULT_PLANNING_DAY ? "Recommended" : undefined
            }
            selected={selected === Number(dayNum)}
            onPress={() => setSelected(Number(dayNum) as PlanningDay)}
          />
        ))}
      </View>

      <View style={styles.confirmBox}>
        <Text style={styles.confirmText}>
          Every{" "}
          <Text style={styles.confirmHighlight}>
            {PLANNING_DAY_LABELS[selected]}
          </Text>
          , FlowOS will prompt your weekly reflection and generate your
          Performance Report.
        </Text>
      </View>

      <Button label="Confirm" onPress={handleContinue} />
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
  options: {
    gap: spacing.sm,
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
