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
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button, withAlpha } from "@flowos/ui-shared";
import { PROFILE_TEMPLATES } from "@flowos/core";
import { useWizard } from "./_WizardContext";

// Fallback roles — used if the user reaches this step without the wizard state
// having a profile-template selection (e.g. deep-linked directly to this screen).
const FOUNDER_ROLES =
  PROFILE_TEMPLATES.find((tmpl) => tmpl.value === "founder")?.roles ?? [];

export default function FirstWeekGoalScreen() {
  const { t } = useTranslation();
  const { wizardState, updateWizardState } = useWizard();
  const roles = wizardState.roles.length > 0 ? wizardState.roles : FOUNDER_ROLES;
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [goal, setGoal] = useState("");

  const isValid = selectedRole !== null && goal.trim().length > 0;

  function handleContinue() {
    if (!isValid) return;
    // TODO: store first week goal + role to goals table via Supabase
    updateWizardState({
      firstWeekGoal: { roleIndex: selectedRole, text: goal.trim() },
    });
    console.log("First week goal:", {
      role: roles[selectedRole!].name,
      goal: goal.trim(),
    });
    router.push("/onboarding/calendar-connection");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>{t("onboarding.firstWeekGoal.stepLabel")}</Text>
        <Text style={styles.heading}>{t("onboarding.firstWeekGoal.heading")}</Text>
        <Text style={styles.subheading}>{t("onboarding.firstWeekGoal.subheading")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t("onboarding.firstWeekGoal.roleSectionLabel")}
        </Text>
        <View style={styles.roleRow}>
          {roles.map((role, i) => (
            <Pressable
              key={role.monogram}
              onPress={() => setSelectedRole(i)}
              style={[
                styles.roleButton,
                selectedRole === i && {
                  borderColor: role.color,
                  backgroundColor: withAlpha(role.color, "22"),
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
        <Text style={styles.sectionLabel}>
          {t("onboarding.firstWeekGoal.goalSectionLabel")}
        </Text>
        <TextInput
          style={styles.input}
          value={goal}
          onChangeText={setGoal}
          placeholder={t("onboarding.firstWeekGoal.placeholder")}
          placeholderTextColor={colors.text.muted}
          multiline
        />
      </View>

      <Button
        label={t("onboarding.firstWeekGoal.cta")}
        onPress={handleContinue}
        variant={isValid ? "primary" : "secondary"}
      />
      {!isValid && (
        <Text style={styles.hint}>{t("onboarding.firstWeekGoal.hint")}</Text>
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
