// apps/mobile/app/onboarding/mission-editor.tsx
// Step 4 of 9 — Mission Editor (not skippable, 180 char max)

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";

const MAX_CHARS = 180;

const MISSION_PROMPTS = [
  "Build a firm that survives without me.",
  "Reach the partnership track without burning out.",
  "Ship something people pay for before July.",
  "Be present for my family and still grow the business.",
];

export default function MissionEditorScreen() {
  const [mission, setMission] = useState("");

  const charCount = mission.trim().length;
  const isValid = charCount > 0 && charCount <= MAX_CHARS;

  function handleContinue() {
    if (!isValid) return;
    // TODO: store to missions table via Supabase
    console.log("Mission set:", mission.trim());
    router.push("/onboarding/first-week-goal");
  }

  function handlePrompt(prompt: string) {
    setMission(prompt);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 4 of 9</Text>
        <Text style={styles.heading}>What are you building?</Text>
        <Text style={styles.subheading}>
          Write your mission in one sentence. This appears at the top of every
          week — it's your filter for what matters and what doesn't.
        </Text>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={mission}
          onChangeText={setMission}
          placeholder="e.g. Build a firm that survives without me."
          placeholderTextColor={colors.text.muted}
          multiline
          maxLength={MAX_CHARS}
          autoFocus
        />
        <Text
          style={[
            styles.charCount,
            charCount > MAX_CHARS * 0.9 && styles.charCountWarning,
          ]}
        >
          {charCount}/{MAX_CHARS}
        </Text>
      </View>

      <View style={styles.promptSection}>
        <Text style={styles.promptLabel}>Not sure? Start with one of these:</Text>
        <View style={styles.prompts}>
          {MISSION_PROMPTS.map((prompt) => (
            <View key={prompt} style={styles.promptChip}>
              <Text
                style={styles.promptText}
                onPress={() => handlePrompt(prompt)}
              >
                {prompt}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Button
        label="Set my mission"
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
  inputArea: {
    gap: spacing.xs,
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    textAlign: "right",
  },
  charCountWarning: {
    color: colors.accent.warning,
  },
  promptSection: {
    gap: spacing.md,
  },
  promptLabel: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
  },
  prompts: {
    gap: spacing.sm,
  },
  promptChip: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing.xs,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  promptText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontStyle: "italic",
  },
});
