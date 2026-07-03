// apps/mobile/app/onboarding/planning-day.tsx
// Step 7 of 9 — Planning Day Selection (not skippable)
// Horizontal radio row: Mon Tue Wed Thu Fri Sat Sun, default Friday

import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";
import {
  PLANNING_DAY_LABELS,
  DEFAULT_PLANNING_DAY,
  type PlanningDay,
} from "@flowos/core";

const DAY_ORDER: PlanningDay[] = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun

export default function PlanningDayScreen() {
  const [selected, setSelected] = useState<PlanningDay>(DEFAULT_PLANNING_DAY);

  function handleContinue() {
    // TODO: store to users.planning_day via Supabase
    console.log("Planning day selected:", PLANNING_DAY_LABELS[selected]);
    router.push("/onboarding/urgency-index");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 7 of 9</Text>
        <Text style={styles.heading}>Your planning day</Text>
        <Text style={styles.subheading}>
          FlowOS will prompt your weekly review and generate your Performance
          Report on this day. Friday is the default — most people plan the
          new week before the weekend.
        </Text>
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
              {PLANNING_DAY_LABELS[day]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Live confirmation sentence */}
      <View style={styles.confirmBox}>
        <Text style={styles.confirmText}>
          Every{" "}
          <Text style={styles.confirmHighlight}>
            {Object.entries(PLANNING_DAY_LABELS).find(
              ([k]) => Number(k) === selected
            )?.[1] ?? "Friday"}
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
