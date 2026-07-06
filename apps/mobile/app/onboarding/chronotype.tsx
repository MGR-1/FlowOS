// apps/mobile/app/onboarding/chronotype.tsx
// Step 3 of 9 — Chronotype Assessment (not skippable)
// One question at a time — answering advances immediately

import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography, RingCard, Button } from "@flowos/ui-shared";
import {
  CHRONOTYPE_QUESTIONS,
  CHRONOTYPE_PROFILES,
  detectChronotype,
  type ChronotypeName,
} from "@flowos/core";
import { useWizard } from "./WizardContext";

const CHRONOTYPE_ACCENT: Record<ChronotypeName, string> = {
  lion: colors.accent.warning,
  bear: colors.accent.primary,
  wolf: colors.accent.purple,
  dolphin: colors.accent.success,
};

export default function ChronotypeScreen() {
  const { updateWizardState } = useWizard();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<ChronotypeName[]>([]);
  const [result, setResult] = useState<ChronotypeName | null>(null);

  const total = CHRONOTYPE_QUESTIONS.length;
  const question = CHRONOTYPE_QUESTIONS[currentQ];

  function handleAnswer(value: ChronotypeName) {
    const newAnswers = [...answers, value];
    if (currentQ < total - 1) {
      setAnswers(newAnswers);
      setCurrentQ((q) => q + 1);
    } else {
      const detected = detectChronotype(newAnswers);
      setAnswers(newAnswers);
      setResult(detected);
      // TODO: store to chronotype_profiles.assessed_type via Supabase
      updateWizardState({ chronotype: detected });
      console.log("Chronotype assessed:", detected);
    }
  }

  function handleContinue() {
    router.push("/onboarding/mission-editor");
  }

  function handleBack() {
    setAnswers((prev) => prev.slice(0, -1));
    setCurrentQ((q) => Math.max(0, q - 1));
  }

  // Result card
  if (result) {
    const profile = CHRONOTYPE_PROFILES[result];
    const accent = CHRONOTYPE_ACCENT[result];
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.stepLabel}>Step 3 of 9</Text>
        <Text style={styles.heading}>Your chronotype</Text>
        <RingCard
          title={profile.label}
          subtitle={profile.peakWindow}
          description={profile.description}
          tip="FlowOS will use this to schedule your Investment Blocks in your peak window from day one."
          accentColor={accent}
        />
        <Button label="Continue" onPress={handleContinue} />
      </ScrollView>
    );
  }

  // One question at a time
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {currentQ > 0 && (
              <Pressable onPress={handleBack} hitSlop={8}>
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            )}
            <Text style={styles.stepLabel}>Step 3 of 9</Text>
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

        <Text style={styles.heading}>When do you do your best work?</Text>
        <Text style={styles.questionText}>{question.text}</Text>

        <View style={styles.options}>
          {question.options.map((opt) => (
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
          Tap an answer to continue — answering advances automatically.
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
});
