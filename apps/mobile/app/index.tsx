import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FlowOS</Text>
      <Text style={styles.subtitle}>
        If you can see this styled with the design tokens, @flowos/ui-shared
        is wired up correctly.
      </Text>
      <Button label="Rebuild day" onPress={() => console.log("tapped")} />
      <Link href="/timeline" asChild>
        <Button label="View Today's Timeline" />
      </Link>
      <Text style={styles.sectionLabel}>ONBOARDING SCREENS</Text>
      <Link href="/onboarding/chronotype" asChild>
        <Button label="Chronotype Assessment" variant="secondary" />
      </Link>
      <Link href="/onboarding/planning-day" asChild>
        <Button label="Planning Day Selection" variant="secondary" />
      </Link>
      <Link href="/onboarding/urgency-index" asChild>
        <Button label="Urgency Index" variant="secondary" />
      </Link>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    justifyContent: "center",
    gap: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
  },
  sectionLabel: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
});
