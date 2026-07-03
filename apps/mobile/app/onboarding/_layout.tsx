// apps/mobile/app/onboarding/_layout.tsx
import { Stack } from "expo-router";
import { colors } from "@flowos/ui-shared";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background.primary },
        headerTintColor: colors.text.primary,
        contentStyle: { backgroundColor: colors.background.primary },
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Welcome", headerShown: false }} />
      <Stack.Screen name="profile-template" options={{ title: "Your Profile" }} />
      <Stack.Screen name="chronotype" options={{ title: "Chronotype" }} />
      <Stack.Screen name="mission-editor" options={{ title: "Your Mission" }} />
      <Stack.Screen name="first-week-goal" options={{ title: "First Week Goal" }} />
      <Stack.Screen name="calendar-connection" options={{ title: "Calendar" }} />
      <Stack.Screen name="planning-day" options={{ title: "Planning Day" }} />
      <Stack.Screen name="import" options={{ title: "Import Tasks" }} />
      <Stack.Screen name="urgency-index" options={{ title: "Urgency Profile" }} />
    </Stack>
  );
}
