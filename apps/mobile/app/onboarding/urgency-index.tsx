// apps/mobile/app/onboarding/urgency-index.tsx
// Onboarding step: Urgency Index (US-059, Section 4.2)
// Position: after planning day selection — final onboarding step
// Skippable: YES — user can complete later in Settings > Performance > Urgency Profile

import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import {
  colors,
  spacing,
  typography,
  RingCard,
  Button,
} from "@flowos/ui-shared";
import { URGENCY_QUESTIONS, scoreUrgencyIndex } from "@flowos/core";

const SCORE_OPTIONS: { label: string; value: number }[] = [
  { label: "Never", value: 0 },
  { label: "Sometimes", value: 2 },
  { label: "Always", value: 4 },
];

const URGENCY_ACCENT: Record<string, string> = {
  prioritizer: colors.accent.success,
  strong_urgency_mindset: colors.accent.warning,
  urgency_addiction: colors.accent.danger,
};

export default function UrgencyIndexScreen() {
  const [scores, setScores] = useState<(number | null)[]>(
    Array(URGENCY_QUESTIONS.length).fill(null)
  );
  const [result, setResult] = useState<ReturnType<
    typeof scoreUrgencyIndex
  > | null>(null);

  const allAnswered = scores.every((s) => s !== null);
  const answeredCount = scores.filter((s) => s !== null).length;

  function handleScore(questionIndex: number, value: number) {
    setScores((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  }

  function handleCalculate() {
    const finalScores = scores.map((s) => s ?? 0);
    const res = scoreUrgencyIndex(finalScores);
    setResult(res);
    // TODO: store all 16 scores + total + profile_type to urgency_index_assessments
    console.log("Urgency Index result:", res);
  }

  function handleSkip() {
    // Skippable — nudge shown on Day 3 morning protocol per spec
    console.log("Urgency Index skipped at onboarding");
    // TODO: navigate to actual next step / complete onboarding
    router.push("/");
  }

  function handleFinish() {
    // TODO: navigate to home / complete onboarding
    router.push("/");
  }

  if (result) {
    const accent = URGENCY_ACCENT[result.profile];
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Your urgency profile</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Total score</Text>
          <Text style={[styles.scoreValue, { color: accent }]}>
            {result.totalScore} / 64
          </Text>
        </View>
        <RingCard
          title={result.profileLabel}
          subtitle={
            result.secondaryLabel
              ? result.secondaryLabel
                  .replace("_", " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
              : `Score: ${result.totalScore}`
          }
          description={result.description}
          tip={result.recommendation}
          accentColor={accent}
        />
        <Button label="Finish setup" onPress={handleFinish} />
        <Text style={styles.retakeNote}>
          You can retake this assessment anytime in Settings → Performance →
          Urgency Profile.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Final step · Optional</Text>
        <Text style={styles.heading}>Your urgency profile</Text>
        <Text style={styles.subheading}>
          16 questions based on Covey's First Things First. Takes about 2
          minutes. FlowOS uses this to personalise your planning from day one.
        </Text>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {answeredCount} of {URGENCY_QUESTIONS.length} answered
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(answeredCount / URGENCY_QUESTIONS.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {URGENCY_QUESTIONS.map((question, qi) => (
        <View key={qi} style={styles.questionBlock}>
          <Text style={styles.questionText}>
            {qi + 1}. {question}
          </Text>
          <View style={styles.scoreOptions}>
            {SCORE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => handleScore(qi, opt.value)}
                style={[
                  styles.scoreButton,
                  scores[qi] === opt.value && styles.scoreButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.scoreButtonText,
                    scores[qi] === opt.value &&
                      styles.scoreButtonTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Button
        label="See my profile"
        onPress={handleCalculate}
        variant={allAnswered ? "primary" : "secondary"}
      />
      <Pressable onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip for now — complete later</Text>
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
  progressRow: {
    gap: spacing.xs,
  },
  progressText: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
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
  questionBlock: {
    gap: spacing.md,
  },
  questionText: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.5,
  },
  scoreOptions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  scoreButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
  },
  scoreButtonSelected: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  scoreButtonText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  scoreButtonTextSelected: {
    color: colors.text.primary,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  skipText: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
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
  retakeNote: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
});
