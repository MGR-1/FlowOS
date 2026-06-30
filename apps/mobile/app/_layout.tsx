import { Stack } from "expo-router";
import { colors } from "@flowos/ui-shared";

export default function RootLayout() {
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
