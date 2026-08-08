import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { colors, spacing, typography } from "../tokens";

export interface OptionCardProps {
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({
  label,
  sublabel,
  selected,
  onPress,
}: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.row}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.label, selected && styles.labelSelected]}>
            {label}
          </Text>
          {sublabel ? (
            <Text style={styles.sublabel}>{sublabel}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.background.elevated,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioSelected: {
    borderColor: colors.accent.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent.primary,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as any,
  },
  labelSelected: {
    color: colors.text.primary,
  },
  sublabel: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
  },
});
