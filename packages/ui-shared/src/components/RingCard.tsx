import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography } from "../tokens";

export interface RingCardProps {
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  accentColor?: string;
}

export function RingCard({
  title,
  subtitle,
  description,
  tip,
  accentColor = colors.accent.primary,
}: RingCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.ringRow}>
        <View style={[styles.ring, { borderColor: accentColor }]}>
          <Text style={[styles.ringLabel, { color: accentColor }]}>
            {title.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.subtitle, { color: accentColor }]}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={[styles.tipBox, { borderLeftColor: accentColor }]}>
        <Text style={styles.tipLabel}>How FlowOS will use this</Text>
        <Text style={styles.tip}>{tip}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  ringRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  ringLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as any,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
  },
  subtitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  description: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.6,
  },
  tipBox: {
    borderLeftWidth: 3,
    paddingLeft: spacing.md,
    gap: spacing.xs / 2,
  },
  tipLabel: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tip: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * 1.6,
  },
});
