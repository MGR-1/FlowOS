// apps/mobile/app/onboarding/urgency-index.tsx
// Step 9 of 9 — Urgency Index (US-059, skippable, final step)
// One question at a time. Answering advances automatically.
// Never=0 · Sometimes=2 · Always=4

import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography, RingCard, Button } from "@flowos/ui-shared";
import { URGENCY_QUESTIONS, scoreUrgencyIndex, type UrgencyProfile } from "@flowos/core";
import { useWizard } from "./WizardContext";

const SCORE_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Sometimes", value: 2 },
  { label: "Always", value: 4 },
];

const URGENCY_ACCENT: Record<UrgencyProfile, string> = {
  prioritizer: colors.accent.success,
  urgency_mindset: colors.accent.warning,
  urgency_addiction: colors.accent.danger,
};

export default function UrgencyIndexScreen() {
  const { updateWizardState } = useWizard();
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [result, setResult] = useState<ReturnType<typeof scoreUrgencyIndex> | null>(null);

  const total = URGENCY_QUESTIONS.length;

  function handleAnswer(value: number) {
    const newScores = [...scores, value];
    if (currentQ < total - 1) {
      setScores(newScores);
      setCurrentQ((q) => q + 1);
    } else {
      const res = scoreUrgencyIndex(newScores);
      setScores(newScores);
      setResult(res);
      // TODO: store all 16 scores + total + profile to urgency_index_assessments
      updateWizardState({ urgencyResult: res });
      console.log("Urgency Index result:", res);
    }
  }

  function handleBack() {
    setScores((prev) => prev.slice(0, -1));
    setCurrentQ((q) => Math.max(0, q - 1));
  }

  function handleSkip() {
    // Skippable — nudge shown on Day 3 morning protocol per spec
    console.log("Urgency Index skipped at onboarding");
    router.replace("/");
  }

  function handleFinish() {
    // TODO: mark onboarding complete in Supabase
    router.replace("/");
  }

  // Result card
  if (result) {
    const accent = URGENCY_ACCENT[result.profile];
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.stepLabel}>Step 9 of 9</Text>
        <Text style={styles.heading}>Your urgency profile</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Total score</Text>
          <Text style={[styles.scoreValue, { color: accent }]}>
            {result.totalScore} / 64
          </Text>
        </View>
        <RingCard
          title={result.profileLabel}
          subtitle={`Score: ${result.totalScore}`}
          description={result.description}
          tip="You can retake this anytime in Settings → Performance → Urgency Profile."
          accentColor={accent}
        />
        <Button label="Finish setup" onPress={handleFinish} />
      </ScrollView>
    );
  }

  // One question at a time
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              {currentQ > 0 && (
                <Pressable onPress={handleBack} hitSlop={8}>
                  <Text style={styles.backText}>Back</Text>
                </Pressable>
              )}
              <Text style={styles.stepLabel}>Step 9 of 9 · Optional</Text>
            </View>
            <Pressable onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
          <Text style={styles.progressText}>
            {currentQ + 1} of {total}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentQ + 1) / total) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.heading}>Your urgency profile</Text>
        <Text style={styles.questionText}>
          {URGENCY_QUESTIONS[currentQ]}
        </Text>

        <View style={styles.options}>
          {SCORE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => handleAnswer(opt.value)}
              style={({ pressed }) => [
                styles.optionButton,
                pressed && styles.optionButtonPressed,
              ]}
            >
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.hint}>
          Tap an answer to advance — based on Covey's First Things First.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    flex: 1,
  },
  header: {
    gap: spacing.xs,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backText: {
    color: colors.accent.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  stepLabel: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  skipText: {
    color: colors.accent.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  progressText: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.elevated,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.accent.primary,
    borderRadius: 2,
  },
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
  },
  questionText: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    lineHeight: typography.size.lg * 1.5,
    fontWeight: typography.weight.medium as any,
  },
  options: {
    gap: spacing.sm,
  },
  optionButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
  },
  optionButtonPressed: {
    backgroundColor: colors.background.elevated,
    borderColor: colors.accent.primary,
  },
  optionLabel: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as any,
  },
  hint: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
  },
  scoreValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
  },
});
