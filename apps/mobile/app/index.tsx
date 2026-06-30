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
});
