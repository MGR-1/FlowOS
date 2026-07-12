// apps/mobile/app/onboarding/index.tsx
// Step 1 of 9 — Welcome screen

import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoRing}>
          <Text style={styles.logoText}>F</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.heading}>Welcome to FlowOS</Text>
        <Text style={styles.subheading}>
          Your personal operating system for elite performance. Takes about 3
          minutes to set up. Everything can be changed later.
        </Text>
        <View style={styles.bullets}>
          {[
            "Plan your week in under 5 minutes",
            "Know your Most Important Task every morning",
            "Close every day with a clean shutdown",
          ].map((line) => (
            <View key={line} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
      </View>
      <Button
        label="Let's build your workspace"
        onPress={() => router.push("/onboarding/profile-template")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  logoArea: {
    alignItems: "center",
    paddingTop: spacing.xxl,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.accent.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
  },
  body: {
    gap: spacing.lg,
  },
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
    textAlign: "center",
  },
  subheading: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.6,
    textAlign: "center",
  },
  bullets: {
    gap: spacing.md,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.primary,
    marginTop: 7,
  },
  bulletText: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    flex: 1,
    lineHeight: typography.size.base * 1.5,
  },
});
