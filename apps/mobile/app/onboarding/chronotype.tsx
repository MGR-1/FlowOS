// apps/mobile/app/onboarding/chronotype.tsx
// Onboarding step: Chronotype Assessment (Section 4.2)
// Position: after profile template selection (step 2), before mission editor (step 3)
// Skippable: NO — required for auto-pilot scheduling

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
  OptionCard,
  RingCard,
  Button,
} from "@flowos/ui-shared";
import {
  CHRONOTYPE_QUESTIONS,
  CHRONOTYPE_PROFILES,
  detectChronotype,
  type ChronotypeName,
} from "@flowos/core";

const CHRONOTYPE_ACCENT: Record<ChronotypeName, string> = {
  lion: "#F5A623",
  bear: colors.accent.primary,
  wolf: "#9B59B6",
  dolphin: colors.accent.success,
};

export default function ChronotypeScreen() {
  const [answers, setAnswers] = useState<(ChronotypeName | null)[]>(
    Array(CHRONOTYPE_QUESTIONS.length).fill(null)
  );
  const [result, setResult] = useState<ChronotypeName | null>(null);

  const allAnswered = answers.every((a) => a !== null);

  function handleAnswer(questionIndex: number, value: ChronotypeName) {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  }

  function handleCalculate() {
    const detected = detectChronotype(answers as ChronotypeName[]);
    setResult(detected);
    // TODO: store to chronotype_profiles.assessed_type via Supabase
    console.log("Chronotype assessed:", detected);
  }

  function handleContinue() {
    // Navigate to next onboarding step (mission editor — step 3)
    // TODO: replace with actual next step route once full wizard is wired
    router.push("/onboarding/planning-day");
  }

  if (result) {
    const profile = CHRONOTYPE_PROFILES[result];
    const accent = CHRONOTYPE_ACCENT[result];
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Your chronotype</Text>
        <RingCard
          title={profile.label}
          subtitle={profile.peakWindow}
          description={profile.description}
          tip={profile.planningTip}
          accentColor={accent}
        />
        <Button label="Continue" onPress={handleContinue} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 3 of 8</Text>
        <Text style={styles.heading}>When do you do your best work?</Text>
        <Text style={styles.subheading}>
          Answer honestly — FlowOS uses this to schedule your most demanding
          tasks in your peak window from day one.
        </Text>
      </View>

      {CHRONOTYPE_QUESTIONS.map((question, qi) => (
        <View key={question.id} style={styles.questionBlock}>
          <Text style={styles.questionText}>
            {qi + 1}. {question.text}
          </Text>
          <View style={styles.options}>
            {question.options.map((option) => (
              <OptionCard
                key={option.value}
                label={option.label}
                selected={answers[qi] === option.value}
                onPress={() => handleAnswer(qi, option.value)}
              />
            ))}
          </View>
        </View>
      ))}

      <Button
        label="See my chronotype"
        onPress={handleCalculate}
        variant={allAnswered ? "primary" : "secondary"}
      />
      {!allAnswered && (
        <Text style={styles.hint}>Answer all 4 questions to continue</Text>
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
  questionBlock: {
    gap: spacing.md,
  },
  questionText: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as any,
    lineHeight: typography.size.base * 1.5,
  },
  options: {
    gap: spacing.sm,
  },
  hint: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    textAlign: "center",
  },
});
