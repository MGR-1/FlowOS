import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../tokens";

export type BadgeTone = "neutral" | "success" | "warning" | "danger";

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const bg =
    tone === "success"
      ? colors.accent.success
      : tone === "warning"
      ? colors.accent.warning
      : tone === "danger"
      ? colors.accent.danger
      : colors.background.elevated;

  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.xs,
    alignSelf: "flex-start",
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
  },
});
