import { ScrollView, View, Text, StyleSheet } from "react-native";
import { colors, spacing, typography, Badge } from "@flowos/ui-shared";
import { mockDayPlan, BlockType } from "@flowos/core";

const BLOCK_TONE: Record<BlockType, "neutral" | "success" | "warning" | "danger"> = {
  investment: "success",
  task: "neutral",
  nsdr: "warning",
  shutdown: "danger",
  break: "neutral",
};

const BLOCK_LABEL: Record<BlockType, string> = {
  investment: "Investment Block",
  task: "Task",
  nsdr: "NSDR",
  shutdown: "Shutdown",
  break: "Break",
};

export default function TimelineScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Today</Text>
      {mockDayPlan.map((block) => (
        <View key={block.id} style={styles.blockCard}>
          <View style={styles.blockHeader}>
            <Text style={styles.time}>
              {block.start_time} – {block.end_time}
            </Text>
            <Badge label={BLOCK_LABEL[block.type]} tone={BLOCK_TONE[block.type]} />
          </View>
          <Text style={styles.title}>{block.title}</Text>
          {block.cognitive_load != null && (
            <Text style={styles.meta}>
              Cognitive load: {block.cognitive_load}/5
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold as any,
    marginBottom: spacing.sm,
  },
  blockCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.xs,
  },
  blockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  time: {
    color: colors.text.secondary,
    fontSize: typography.size.sm,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as any,
  },
  meta: {
    color: colors.text.muted,
    fontSize: typography.size.xs,
  },
});
