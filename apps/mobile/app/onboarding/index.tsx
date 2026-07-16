// apps/mobile/app/onboarding/index.tsx
// Step 1 of 9 — Welcome screen

import { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";
import { useWizard } from "./_WizardContext";

// TODO(dev-only): temporary language switcher for verifying EN/NL translations
// during Sprint 1. Remove once a real Settings > Language screen exists.
const DEV_LOCALES: { code: "en" | "nl"; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "nl", label: "NL" },
];

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const { hydrated, resumeRoute } = useWizard();
  const bullets = [
    t("onboarding.welcome.bullet1"),
    t("onboarding.welcome.bullet2"),
    t("onboarding.welcome.bullet3"),
  ];

  // Resume-on-relaunch (spec §2, "Exit behaviour"): if AsyncStorage has an
  // incomplete wizard in progress, skip straight back to that step instead
  // of restarting from Welcome.
  useEffect(() => {
    if (hydrated && resumeRoute) {
      router.replace(resumeRoute as any);
    }
  }, [hydrated, resumeRoute]);

  return (
    <View style={styles.container}>
      {__DEV__ && (
        <View style={styles.devLocaleRow}>
          {DEV_LOCALES.map((locale) => (
            <Pressable
              key={locale.code}
              onPress={() => i18n.changeLanguage(locale.code)}
              style={[
                styles.devLocaleButton,
                i18n.language === locale.code && styles.devLocaleButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.devLocaleText,
                  i18n.language === locale.code && styles.devLocaleTextActive,
                ]}
              >
                {locale.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
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
  devLocaleRow: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    gap: spacing.xs,
    zIndex: 10,
  },
  devLocaleButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  devLocaleButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  devLocaleText: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
  },
  devLocaleTextActive: {
    color: colors.text.primary,
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
