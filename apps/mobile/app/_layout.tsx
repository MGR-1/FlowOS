import { Stack } from "expo-router";
import { colors } from "@flowos/ui-shared";
import { I18nextProvider } from "react-i18next";
import { i18next } from "@flowos/core";

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18next}>
      <RootStack />
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
