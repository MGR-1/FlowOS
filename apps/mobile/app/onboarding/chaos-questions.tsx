// apps/mobile/app/onboarding/chaos-questions.tsx
// Step 4c — Chaos-mode 5 questions (replaces standard steps 4, 5, 8)
// Source of truth: FlowOS Onboarding Wizard Spec v1.0 §5

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
import { colors, spacing, typography, Button } from "@flowos/ui-shared";
import {
  CHAOS_AREA_OPTIONS,
  CHAOS_FRICTION_OPTIONS,
  isChaosAnswersValid,
  INITIAL_CHAOS_ANSWERS,
  type ChaosAnswers,
  type ChaosAreaKey,
  type ChaosFrictionKey,
} from "@flowos/core";
import { useWizard } from "./_WizardContext";

const STRUCTURE_LEVELS = [1, 2, 3, 4, 5];

export default function ChaosQuestionsScreen() {
  const { t } = useTranslation();
  const { updateWizardState } = useWizard();
  const [answers, setAnswers] = useState<ChaosAnswers>(INITIAL_CHAOS_ANSWERS);

  const isValid = isChaosAnswersValid(answers);

  function toggleArea(area: ChaosAreaKey) {
    setAnswers((prev) => {
      const has = prev.lifeAreas.includes(area);
      if (has) {
        return { ...prev, lifeAreas: prev.lifeAreas.filter((a) => a !== area) };
      }
      if (prev.lifeAreas.length >= 5) return prev; // spec: 3-5 areas max
      return { ...prev, lifeAreas: [...prev.lifeAreas, area] };
    });
  }

  function toggleFriction(item: ChaosFrictionKey) {
    setAnswers((prev) => ({
      ...prev,
      frictionPoints: prev.frictionPoints.includes(item)
        ? prev.frictionPoints.filter((f) => f !== item)
        : [...prev.frictionPoints, item],
    }));
  }

  function handleContinue() {
    if (!isValid) return;
    updateWizardState({ chaosAnswers: answers });
    router.push("/onboarding/chaos-build");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>{t("onboarding.chaos.questionsStepLabel")}</Text>
        <Text style={styles.heading}>{t("onboarding.chaos.questionsHeading")}</Text>
        <Text style={styles.subheading}>{t("onboarding.chaos.questionsSubheading")}</Text>
      </View>

      {/* Q1 — current focus */}
      <View style={styles.section}>
        <Text style={styles.questionLabel}>{t("onboarding.chaos.q1.label")}</Text>
        <TextInput
          style={styles.input}
          value={answers.currentFocus}
          onChangeText={(v) => setAnswers((p) => ({ ...p, currentFocus: v }))}
          placeholder={t("onboarding.chaos.q1.placeholder")}
          placeholderTextColor={colors.text.muted}
          maxLength={200}
        />
      </View>

      {/* Q2 — life areas (multi-select 3-5) */}
      <View style={styles.section}>
        <Text style={styles.questionLabel}>{t("onboarding.chaos.q2.label")}</Text>
        <View style={styles.chipRow}>
          {CHAOS_AREA_OPTIONS.map((area) => {
            const selected = answers.lifeAreas.includes(area);
            return (
              <Pressable
                key={area}
                onPress={() => toggleArea(area)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {t(`onboarding.chaos.q2.options.${area}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.chipHint}>{answers.lifeAreas.length}/5</Text>
      </View>

      {/* Q3 — week priority */}
      <View style={styles.section}>
        <Text style={styles.questionLabel}>{t("onboarding.chaos.q3.label")}</Text>
        <TextInput
          style={styles.input}
          value={answers.weekPriority}
          onChangeText={(v) => setAnswers((p) => ({ ...p, weekPriority: v }))}
          placeholder={t("onboarding.chaos.q3.placeholder")}
          placeholderTextColor={colors.text.muted}
          maxLength={200}
        />
      </View>

      {/* Q4 — friction points (multi-select) */}
      <View style={styles.section}>
        <Text style={styles.questionLabel}>{t("onboarding.chaos.q4.label")}</Text>
        <View style={styles.chipRow}>
          {CHAOS_FRICTION_OPTIONS.map((item) => {
            const selected = answers.frictionPoints.includes(item);
            return (
              <Pressable
                key={item}
                onPress={() => toggleFriction(item)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {t(`onboarding.chaos.q4.options.${item}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Q5 — structure level slider (discrete 1-5 buttons) */}
      <View style={styles.section}>
        <Text style={styles.questionLabel}>{t("onboarding.chaos.q5.label")}</Text>
        <View style={styles.sliderRow}>
          {STRUCTURE_LEVELS.map((level) => (
            <Pressable
              key={level}
              onPress={() => setAnswers((p) => ({ ...p, structureLevel: level }))}
              style={[
                styles.sliderDot,
                answers.structureLevel === level && styles.sliderDotSelected,
              ]}
            >
              <Text
                style={[
                  styles.sliderDotText,
                  answers.structureLevel === level && styles.sliderDotTextSelected,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabelText}>{t("onboarding.chaos.q5.low")}</Text>
          <Text style={styles.sliderLabelText}>{t("onboarding.chaos.q5.high")}</Text>
        </View>
      </View>

      <Button
        label={t("onboarding.chaos.continueCta")}
        onPress={handleContinue}
        variant={isValid ? "primary" : "secondary"}
      />
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
    gap: spacing.sm,
  },
  questionLabel: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as any,
    lineHeight: typography.size.base * 1.4,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.focus,
    color: colors.text.primary,
    fontSize: typography.size.base,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  chipSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
  },
  chipTextSelected: {
    color: colors.text.primary,
    fontWeight: typography.weight.medium as any,
  },
  chipHint: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    textAlign: "right",
  },
  sliderRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  sliderDot: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
  },
  sliderDotSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  sliderDotText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  sliderDotTextSelected: {
    color: colors.text.primary,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelText: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
});
