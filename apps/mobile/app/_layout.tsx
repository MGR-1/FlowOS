import { View, Text, StyleSheet, Pressable } from "react-native";
import { Stack } from "expo-router";
import { colors, spacing, typography } from "@flowos/ui-shared";
import { I18nextProvider, useTranslation } from "react-i18next";
import { i18next } from "@flowos/core";

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18next}>
      <RootStack />
      <DevLocaleToggle />
    </I18nextProvider>
  );
}

function RootStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background.primary },
        headerTintColor: colors.text.primary,
        contentStyle: { backgroundColor: colors.background.primary },
      }}
    >
      <Stack.Screen name="index" options={{ title: "FlowOS" }} />
    </Stack>
  );
}

// TODO(dev-only): global language switcher for verifying EN/NL translations
// during Sprint 1. Lives at the root (not a single screen) so it stays
// reachable even when resume-on-relaunch skips past the Welcome screen.
// Remove once a real Settings > Language screen exists.
const DEV_LOCALES: { code: "en" | "nl"; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "nl", label: "NL" },
];

function DevLocaleToggle() {
  const { i18n } = useTranslation();
  if (!__DEV__) return null;

  return (
    <View style={styles.devLocaleRow} pointerEvents="box-none">
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
  );
}

const styles = StyleSheet.create({
  devLocaleRow: {
    position: "absolute",
    top: 56,
    right: spacing.lg,
    flexDirection: "row",
    gap: spacing.xs,
    zIndex: 999,
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
});
