// apps/mobile/app/index.tsx
// Session routing gate. Nothing renders here — it decides where the user
// belongs and replaces the route:
//
//   hydrating          -> spinner
//   no session         -> /sign-in
//   session, no setup  -> /onboarding  (existing resume logic still applies)
//   session, setup done-> /dev-menu    (no Today screen exists yet)
//
// The dev navigation menu that used to live here now lives in dev-menu.tsx.

import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@flowos/ui-shared";
import { useAuth, WIZARD_STORAGE_KEY } from "../context/AuthContext";

export default function IndexScreen() {
  const { userId, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;

    if (!userId) {
      router.replace("/sign-in");
      return;
    }

    AsyncStorage.getItem(WIZARD_STORAGE_KEY)
      .then((raw) => {
        const completed = raw
          ? Boolean(JSON.parse(raw)?.wizardState?.completedAt)
          : false;
        router.replace(completed ? "/dev-menu" : "/onboarding");
      })
      .catch(() => router.replace("/onboarding"));
  }, [hydrated, userId]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
