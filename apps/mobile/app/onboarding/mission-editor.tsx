// apps/mobile/app/onboarding/mission-editor.tsx
// Step 4 of 9 — Mission Editor (not skippable, 180 char max)

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
import { useWizard } from "../../context/WizardContext";

const MAX_CHARS = 180;

export default function MissionEditorScreen() {
  const { t } = useTranslation();
  const missionPrompts = t("onboarding.missionEditor.prompts", {
    returnObjects: true,
  }) as string[];
  const { updateWizardState } = useWizard();
  const [mission, setMission] = useState("");

  const charCount = mission.trim().length;
  const isValid = charCount > 0 && charCount <= MAX_CHARS;

  function handleContinue() {
    if (!isValid) return;
    // TODO: store to missions table via Supabase
    updateWizardState({ mission: mission.trim() });
    console.log("Mission set:", mission.trim());
    router.push("/onboarding/first-week-goal");
  }

  function handlePrompt(prompt: string) {
    setMission(prompt);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>{t("onboarding.missionEditor.stepLabel")}</Text>
        <Text style={styles.heading}>{t("onboarding.missionEditor.heading")}</Text>
        <Text style={styles.subheading}>{t("onboarding.missionEditor.subheading")}</Text>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={mission}
          onChangeText={setMission}
          placeholder={t("onboarding.missionEditor.placeholder")}
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
        <Text style={styles.promptLabel}>{t("onboarding.missionEditor.promptLabel")}</Text>
        <View style={styles.prompts}>
          {missionPrompts.map((prompt) => (
            <Pressable
              key={prompt}
              onPress={() => handlePrompt(prompt)}
              style={({ pressed }) => [
                styles.promptChip,
                pressed && styles.promptChipPressed,
              ]}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button
        label={t("onboarding.missionEditor.cta")}
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
  promptChipPressed: {
    borderColor: colors.accent.primary,
  },
  promptText: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontStyle: "italic",
  },
});
