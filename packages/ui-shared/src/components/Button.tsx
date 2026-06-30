import React from "react";
import { Pressable, Text, StyleSheet, PressableProps } from "react-native";
import { colors, spacing, typography } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "danger";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: ButtonVariant;
}

export function Button({ label, variant = "primary", ...rest }: ButtonProps) {
  const bg =
    variant === "primary"
      ? colors.accent.primary
      : variant === "danger"
      ? colors.accent.danger
      : colors.background.elevated;

  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as any,
  },
});
