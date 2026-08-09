// apps/mobile/app/sign-in.tsx
// Email + password sign-in. No deep linking, which keeps the team's Expo Go
// QR workflow working — magic links and OAuth redirects behave differently in
// Expo Go than in a dev build (design spec §3).

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";
import { useAuth } from "../context/AuthContext";

const MIN_PASSWORD_LENGTH = 8;

type Mode = "signIn" | "signUp";

export default function SignInScreen() {
  const { t } = useTranslation();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!email.trim() || !password) {
      setError(t("auth.errorEmptyFields"));
      return;
    }
    if (mode === "signUp" && password.length < MIN_PASSWORD_LENGTH) {
      setError(t("auth.errorPasswordTooShort"));
      return;
    }

    setBusy(true);
    const result =
      mode === "signIn"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.replace("/");
  }

  function toggleMode() {
    setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
    setError(null);
  }

  const submitLabel = busy
    ? t("auth.working")
    : mode === "signIn"
      ? t("auth.signInCta")
      : t("auth.signUpCta");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.body}>
          <Text style={styles.heading}>{t("auth.heading")}</Text>
          <Text style={styles.subheading}>
            {mode === "signIn"
              ? t("auth.subheadingSignIn")
              : t("auth.subheadingSignUp")}
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t("auth.emailLabel")}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t("auth.emailPlaceholder")}
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!busy}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t("auth.passwordLabel")}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t("auth.passwordPlaceholder")}
              placeholderTextColor={colors.text.muted}
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              editable={!busy}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.actions}>
          <Button label={submitLabel} onPress={handleSubmit} disabled={busy} />
          <Pressable onPress={toggleMode} style={styles.toggle} disabled={busy}>
            <Text style={styles.toggleText}>
              {mode === "signIn"
                ? t("auth.toggleToSignUp")
                : t("auth.toggleToSignIn")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "space-between",
    gap: spacing.xl,
  },
  body: { gap: spacing.md, paddingTop: spacing.xxl },
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as never,
  },
  subheading: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.5,
    marginBottom: spacing.md,
  },
  field: { gap: spacing.xs },
  label: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as never,
  },
  input: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontSize: typography.size.base,
  },
  error: {
    color: colors.accent.danger,
    fontSize: typography.size.sm,
  },
  actions: { gap: spacing.sm },
  toggle: { alignItems: "center", paddingVertical: spacing.sm },
  toggleText: {
    color: colors.accent.primary,
    fontSize: typography.size.sm,
  },
});
