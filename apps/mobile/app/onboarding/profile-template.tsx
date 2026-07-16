// apps/mobile/app/onboarding/profile-template.tsx
// Step 2 of 9 — Profile Template Selection (not skippable)

import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button, withAlpha } from "@flowos/ui-shared";
import {
  PROFILE_TEMPLATES,
  type ProfileTemplate,
} from "@flowos/core";
import { useWizard } from "./_WizardContext";

export default function ProfileTemplateScreen() {
  const { t } = useTranslation();
  const { updateWizardState } = useWizard();
  const [selected, setSelected] = useState<ProfileTemplate | null>(null);

  function handleContinue() {
    if (!selected) return;
    const template = PROFILE_TEMPLATES.find((t) => t.value === selected);
    // TODO: store profile template + pre-populated roles to Supabase
    updateWizardState({ profileTemplate: selected, roles: template?.roles ?? [] });
    console.log("Profile template selected:", selected);
    router.push("/onboarding/chronotype");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>{t("onboarding.profileTemplate.stepLabel")}</Text>
        <Text style={styles.heading}>{t("onboarding.profileTemplate.heading")}</Text>
        <Text style={styles.subheading}>{t("onboarding.profileTemplate.subheading")}</Text>
      </View>

      <View style={styles.templates}>
        {PROFILE_TEMPLATES.map((template) => (
          <Pressable
            key={template.value}
            onPress={() => setSelected(template.value)}
            style={[
              styles.card,
              selected === template.value && styles.cardSelected,
              template.isChaos && styles.cardChaos,
            ]}
          >
            <View style={styles.cardTop}>
              <Text
                style={[
                  styles.cardLabel,
                  selected === template.value && styles.cardLabelSelected,
                ]}
              >
                {t(`onboarding.profileTemplate.templates.${template.value}.label`)}
              </Text>
              {selected === template.value && (
                <View style={styles.checkDot} />
              )}
            </View>
            <Text style={styles.cardDesc}>
              {t(`onboarding.profileTemplate.templates.${template.value}.description`)}
            </Text>
            {template.roles.length > 0 && (
              <View style={styles.roleRow}>
                {template.roles.map((role) => (
                  <View
                    key={role.monogram}
                    style={[
                      styles.rolePill,
                      { backgroundColor: withAlpha(role.color, "22") },
                    ]}
                  >
                    <Text
                      style={[styles.rolePillText, { color: role.color }]}
                    >
                      {role.monogram}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Button
        label={t("onboarding.profileTemplate.continueCta")}
        onPress={handleContinue}
        variant={selected ? "primary" : "secondary"}
      />
      {!selected && (
        <Text style={styles.hint}>{t("onboarding.profileTemplate.hint")}</Text>
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
  templates: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  cardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.background.elevated,
  },
  cardChaos: {
    borderStyle: "dashed",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold as any,
  },
  cardLabelSelected: {
    color: colors.text.primary,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent.primary,
  },
  cardDesc: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
  },
  roleRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  rolePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: spacing.xs,
  },
  rolePillText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold as any,
  },
  hint: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
});
