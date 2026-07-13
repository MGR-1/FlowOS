// apps/mobile/app/onboarding/index.tsx
// Step 1 of 9 — Welcome screen

import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const bullets = [
    t("onboarding.welcome.bullet1"),
    t("onboarding.welcome.bullet2"),
    t("onboarding.welcome.bullet3"),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoRing}>
          <Text style={styles.logoText}>F</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.heading}>{t("onboarding.welcome.heading")}</Text>
        <Text style={styles.subheading}>{t("onboarding.welcome.subheading")}</Text>
        <View style={styles.bullets}>
          {bullets.map((line) => (
            <View key={line} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>
      </View>
      <Button
        label={t("onboarding.welcome.cta")}
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
