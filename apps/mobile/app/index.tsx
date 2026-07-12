import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Link } from "expo-router";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>FlowOS</Text>
      <Text style={styles.subtitle}>Dev build — tap any screen to preview.</Text>

      <Text style={styles.sectionLabel}>MAIN SCREENS</Text>
      <Link href="/timeline" asChild>
        <Button label="Day Timeline" />
      </Link>

      <Text style={styles.sectionLabel}>ONBOARDING WIZARD</Text>
      <Link href="/onboarding" asChild>
        <Button label="▶ Start full wizard (Step 1)" />
      </Link>

      <Text style={styles.sectionLabel}>INDIVIDUAL STEPS</Text>
      {[
        { href: "/onboarding/profile-template", label: "Step 2 — Profile Template" },
        { href: "/onboarding/chronotype", label: "Step 3 — Chronotype" },
        { href: "/onboarding/mission-editor", label: "Step 4 — Mission Editor" },
        { href: "/onboarding/first-week-goal", label: "Step 5 — First Week Goal" },
        { href: "/onboarding/calendar-connection", label: "Step 6 — Calendar Connection" },
        { href: "/onboarding/planning-day", label: "Step 7 — Planning Day" },
        { href: "/onboarding/import", label: "Step 8 — Import Tasks" },
        { href: "/onboarding/urgency-index", label: "Step 9 — Urgency Index" },
      ].map((item) => (
        <Link key={item.href} href={item.href as any} asChild>
          <Button label={item.label} variant="secondary" />
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
});
