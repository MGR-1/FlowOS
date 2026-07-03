// apps/mobile/app/onboarding/first-week-goal.tsx
// Step 5 of 9 — First Week Goal (not skippable)
// One role selector + one text input

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";

// Placeholder roles — in production these come from the profile template selection
const PLACEHOLDER_ROLES = [
  { monogram: "B", name: "Build", color: "#7C3AED" },
  { monogram: "G", name: "Grow", color: "#2563EB" },
  { monogram: "P", name: "Partner", color: "#0D9488" },
  { monogram: "H", name: "Health", color: "#D97706" },
];

export default function FirstWeekGoalScreen() {
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [goal, setGoal] = useState("");

  const isValid = selectedRole !== null && goal.trim().length > 0;

  function handleContinue() {
    if (!isValid) return;
    // TODO: store first week goal + role to goals table via Supabase
    console.log("First week goal:", {
      role: PLACEHOLDER_ROLES[selectedRole!].name,
      goal: goal.trim(),
    });
    router.push("/onboarding/calendar-connection");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 5 of 9</Text>
        <Text style={styles.heading}>Your first week goal</Text>
        <Text style={styles.subheading}>
          What's the one result you want to achieve this week? Pick the role
          it belongs to, then name the outcome.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Which role does this belong to?</Text>
        <View style={styles.roleRow}>
          {PLACEHOLDER_ROLES.map((role, i) => (
            <Pressable
              key={role.monogram}
              onPress={() => setSelectedRole(i)}
              style={[
                styles.roleButton,
                selectedRole === i && {
                  borderColor: role.color,
                  backgroundColor: role.color + "22",
                },
              ]}
            >
              <Text
                style={[
                  styles.roleMonogram,
                  { color: selectedRole === i ? role.color : colors.text.muted },
                ]}
              >
                {role.monogram}
              </Text>
              <Text
                style={[
                  styles.roleName,
                  { color: selectedRole === i ? role.color : colors.text.muted },
                ]}
              >
                {role.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>What does winning this week look like?</Text>
        <TextInput
          style={styles.input}
          value={goal}
          onChangeText={setGoal}
          placeholder="e.g. Have the first draft of the investor deck done."
          placeholderTextColor={colors.text.muted}
          multiline
        />
      </View>

      <Button
        label="Set goal"
        onPress={handleContinue}
        variant={isValid ? "primary" : "secondary"}
      />
      {!isValid && (
        <Text style={styles.hint}>
          Select a role and describe your goal to continue
        </Text>
      )}
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
  section: {
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  roleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  roleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  roleMonogram: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as any,
  },
  roleName: {
    fontSize: typography.size.xs,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.focus,
    color: colors.text.primary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.6,
    minHeight: 80,
    textAlignVertical: "top",
  },
  hint: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
});
