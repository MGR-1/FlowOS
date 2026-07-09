// apps/mobile/app/onboarding/import.tsx
// Step 8 of 9 — Import existing tasks (skippable)
// Supports: paste from Notion, manual entry, or skip

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
import { colors, spacing, typography, Button, Badge, OptionCard } from "@flowos/ui-shared";

type ImportMode = "paste" | "manual" | null;

export default function ImportScreen() {
  const [mode, setMode] = useState<ImportMode>(null);
  const [pasteText, setPasteText] = useState("");
  const [manualTasks, setManualTasks] = useState<string[]>([""]);

  function handleAddTask() {
    setManualTasks((t) => [...t, ""]);
  }

  function handleTaskChange(index: number, value: string) {
    setManualTasks((tasks) => {
      const next = [...tasks];
      next[index] = value;
      return next;
    });
  }

  function handleContinue() {
    const tasks =
      mode === "manual"
        ? manualTasks.filter((t) => t.trim().length > 0)
        : mode === "paste"
        ? pasteText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : [];
    // TODO: bulk insert to braindump_items via Supabase
    console.log("Importing tasks:", tasks);
    router.push("/onboarding/urgency-index");
  }

  function handleSkip() {
    console.log("Import skipped");
    router.push("/onboarding/urgency-index");
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 8 of 9</Text>
        <Text style={styles.heading}>Bring in your existing tasks</Text>
        <Text style={styles.subheading}>
          Already have a list somewhere? Paste it in or add items manually.
          FlowOS will process them into your Braindump inbox. You can skip this
          and add tasks later.
        </Text>
      </View>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        <View style={styles.modeCard}>
          <OptionCard
            label="Paste from Notion"
            selected={mode === "paste"}
            onPress={() => setMode("paste")}
          />
        </View>
        <View style={styles.modeCard}>
          <OptionCard
            label="Type manually"
            selected={mode === "manual"}
            onPress={() => setMode("manual")}
          />
        </View>
      </View>

      {/* Paste mode */}
      {mode === "paste" && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Copy your task list and paste it below. One task per line.
          </Text>
          <TextInput
            style={styles.pasteInput}
            value={pasteText}
            onChangeText={setPasteText}
            placeholder={"Task 1\nTask 2\nTask 3"}
            placeholderTextColor={colors.text.muted}
            multiline
            autoFocus
          />
          {pasteText.trim().length > 0 && (
            <Badge
              label={`${pasteText.split("\n").filter((l) => l.trim()).length} tasks detected`}
              tone="success"
            />
          )}
        </View>
      )}

      {/* Manual mode */}
      {mode === "manual" && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Add one task per line.</Text>
          {manualTasks.map((task, i) => (
            <TextInput
              key={i}
              style={styles.taskInput}
              value={task}
              onChangeText={(val) => handleTaskChange(i, val)}
              placeholder={`Task ${i + 1}`}
              placeholderTextColor={colors.text.muted}
              autoFocus={i === manualTasks.length - 1}
            />
          ))}
          <Pressable onPress={handleAddTask} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add another task</Text>
          </Pressable>
        </View>
      )}

      <Button
        label={mode ? "Import and continue" : "Continue"}
        onPress={handleContinue}
        variant="primary"
      />
      <Pressable onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip — I'll add tasks later</Text>
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
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modeCard: {
    flex: 1,
  },
  section: {
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
  },
  pasteInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.focus,
    color: colors.text.primary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.6,
    minHeight: 160,
    textAlignVertical: "top",
  },
  taskInput: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    color: colors.text.primary,
    fontSize: typography.size.base,
  },
  addButton: {
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    color: colors.accent.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  skipText: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
  },
});
