// apps/mobile/app/onboarding/calendar-connection.tsx
// Step 6 of 9 — Calendar Connection (skippable)

import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography, Button, Badge } from "@flowos/ui-shared";

type CalendarProvider = "google" | "microsoft";
type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

interface CalendarOption {
  provider: CalendarProvider;
  label: string;
  sublabel: string;
}

const CALENDAR_OPTIONS: CalendarOption[] = [
  {
    provider: "google",
    label: "Google Calendar",
    sublabel: "Gmail, Google Workspace",
  },
  {
    provider: "microsoft",
    label: "Microsoft / Outlook",
    sublabel: "Outlook, Microsoft 365",
  },
];

export default function CalendarConnectionScreen() {
  const [status, setStatus] = useState<
    Record<CalendarProvider, ConnectionStatus>
  >({
    google: "idle",
    microsoft: "idle",
  });

  function handleConnect(provider: CalendarProvider) {
    setStatus((s) => ({ ...s, [provider]: "connecting" }));
    // TODO: trigger OAuth flow via expo-auth-session + Supabase
    // For now, simulate success after a short delay
    setTimeout(() => {
      setStatus((s) => ({ ...s, [provider]: "connected" }));
    }, 1000);
    console.log("Calendar connect:", provider);
  }

  function handleContinue() {
    router.push("/onboarding/planning-day");
  }

  function handleSkip() {
    console.log("Calendar connection skipped");
    router.push("/onboarding/planning-day");
  }

  const anyConnected = Object.values(status).some((s) => s === "connected");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 6 of 9</Text>
        <Text style={styles.heading}>Connect your calendar</Text>
        <Text style={styles.subheading}>
          FlowOS reads your events to build an accurate day plan — meetings
          block time automatically. You can connect later in Settings.
        </Text>
      </View>

      <View style={styles.options}>
        {CALENDAR_OPTIONS.map((option) => {
          const s = status[option.provider];
          const isConnected = s === "connected";
          const isConnecting = s === "connecting";
          return (
            <View key={option.provider} style={styles.optionCard}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionSublabel}>{option.sublabel}</Text>
              </View>
              {isConnected ? (
                <Badge label="Connected" tone="success" />
              ) : (
                <Pressable
                  onPress={() => handleConnect(option.provider)}
                  disabled={isConnecting}
                  style={[
                    styles.connectButton,
                    isConnecting && styles.connectButtonDisabled,
                  ]}
                >
                  <Text style={styles.connectButtonText}>
                    {isConnecting ? "Connecting…" : "Connect"}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.permissionNote}>
        <Text style={styles.permissionText}>
          FlowOS requests read-only access to event titles, times, and
          attendees. It never reads email content or contacts.
        </Text>
      </View>

      {anyConnected ? (
        <Button label="Continue" onPress={handleContinue} />
      ) : (
        <>
          <Button label="Continue" onPress={handleContinue} variant="secondary" />
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now — connect later</Text>
          </Pressable>
        </>
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
  options: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  optionInfo: {
    gap: spacing.xs / 2,
  },
  optionLabel: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as any,
  },
  optionSublabel: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
  },
  connectButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  permissionNote: {
    backgroundColor: colors.background.elevated,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  permissionText: {
    color: colors.text.muted,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * 1.6,
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
