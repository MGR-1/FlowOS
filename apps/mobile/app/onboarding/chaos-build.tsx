// apps/mobile/app/onboarding/chaos-build.tsx
// Step 5c — "Claude is building your workspace" loading state, then a review
// screen the user can accept or override. Source of truth: Onboarding Wizard
// Spec v1.0 §5.

import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button, withAlpha } from "@flowos/ui-shared";
import {
  generateChaosWorkspace,
  INITIAL_CHAOS_ANSWERS,
  type ChaosGeneratedWorkspace,
} from "@flowos/core";
import { useWizard } from "./_WizardContext";

export default function ChaosBuildScreen() {
  const { t } = useTranslation();
  const { wizardState, updateWizardState } = useWizard();
  const answers = wizardState.chaosAnswers ?? INITIAL_CHAOS_ANSWERS;

  const [workspace, setWorkspace] = useState<ChaosGeneratedWorkspace | null>(null);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const buildPhrases = t("onboarding.chaos.buildPhrases", {
    returnObjects: true,
  }) as string[];

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 3200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const phraseTimer = setInterval(() => {
      setPhraseIndex((i) => Math.min(i + 1, buildPhrases.length - 1));
    }, 1100);

    generateChaosWorkspace(answers).then((result) => {
      clearInterval(phraseTimer);
      setWorkspace(result);
      // TODO: replace mock generateChaosWorkspace with a real Claude Haiku
      // call (see packages/core/src/models/chaosMode.ts)
      // TODO: store mission/roles/goals to Supabase with source='chaos_mode'
      updateWizardState({
        mission: result.missionStatement,
        roles: result.roles,
        firstWeekGoal:
          result.firstWeekGoals.length > 0
            ? { roleIndex: result.firstWeekGoals[0].roleIndex, text: result.firstWeekGoals[0].text }
            : { roleIndex: null, text: "" },
      });
    });

    return () => clearInterval(phraseTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAccept() {
    router.push("/onboarding/calendar-connection");
  }

  function handleEditMyself() {
    // Revert to the standard step order (steps 4-9 all run normally,
    // including Import) instead of the collapsed Chaos-mode path.
    updateWizardState({ profileTemplate: "custom" });
    router.push("/onboarding/mission-editor");
  }

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // Loading state
  if (!workspace) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.ringWrap}>
          <View style={styles.ringTrack} />
          <Animated.View style={[styles.ringFillBase, { width: widthInterpolated }]} />
        </View>
        <Text style={styles.buildHeading}>{t("onboarding.chaos.buildHeading")}</Text>
        <Text style={styles.buildPhrase}>{buildPhrases[phraseIndex]}</Text>
      </View>
    );
  }

  // Review state
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>{t("onboarding.chaos.reviewHeading")}</Text>
      <Text style={styles.subheading}>{t("onboarding.chaos.reviewSubheading")}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t("onboarding.missionEditor.heading")}
        </Text>
        <View style={styles.missionCard}>
          <Text style={styles.missionText}>{workspace.missionStatement}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {t("onboarding.profileTemplate.templates.custom.label")}
        </Text>
        <View style={styles.roleRow}>
          {workspace.roles.map((role) => (
            <View
              key={role.monogram}
              style={[styles.rolePill, { backgroundColor: withAlpha(role.color, "22") }]}
            >
              <Text style={[styles.rolePillMonogram, { color: role.color }]}>
                {role.monogram}
              </Text>
              <Text style={[styles.rolePillName, { color: role.color }]}>{role.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {workspace.firstWeekGoals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t("onboarding.firstWeekGoal.heading")}
          </Text>
          {workspace.firstWeekGoals.map((goal, i) => (
            <View key={i} style={styles.missionCard}>
              <Text style={styles.missionText}>{goal.text}</Text>
            </View>
          ))}
        </View>
      )}

      <Button label={t("onboarding.chaos.acceptCta")} onPress={handleAccept} />
      <Pressable onPress={handleEditMyself} style={styles.editLink}>
        <Text style={styles.editLinkText}>{t("onboarding.chaos.editMyselfCta")}</Text>
      </Pressable>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  ringWrap: {
    width: 120,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.background.elevated,
  },
  ringTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.elevated,
  },
  ringFillBase: {
    height: 8,
    backgroundColor: colors.accent.primary,
    borderRadius: 4,
  },
  buildHeading: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
  },
  buildPhrase: {
    color: colors.text.muted,
    fontSize: typography.size.base,
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
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  missionCard: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  missionText: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.5,
  },
  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
  },
  rolePillMonogram: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold as any,
  },
  rolePillName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  editLink: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  editLinkText: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
  },
});
