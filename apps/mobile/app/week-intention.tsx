// apps/mobile/app/week-intention.tsx
// US-061 — Week Intention capture. Shown on the user's planning day, before
// the weekly planning grid.
//
// SCOPE: this is the capture half of US-061 only. The "Intention vs Reality"
// gap and the 4-week revised-target suggestion both render inside the Weekly
// Performance Report, which is a Sprint 3 deliverable. Voice input on the
// intention field is also deferred — the speech infrastructure arrives with
// the Morning Protocol. Do not close US-061 on this screen alone.

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors, spacing, typography, Button } from "@flowos/ui-shared";
import {
  saveWeekIntention,
  getWeekIntention,
  listRoles,
  Q2_TARGET_MIN,
  Q2_TARGET_MAX,
  Q2_TARGET_DEFAULT,
  MAX_INTENTION_ROLES,
  type RoleOption,
} from "@flowos/core";
import { useAuth } from "../context/AuthContext";

const Q2_STEP = 5;

export default function WeekIntentionScreen() {
  const { t } = useTranslation();
  const { userId } = useAuth();

  const [q2Target, setQ2Target] = useState(Q2_TARGET_DEFAULT);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [intention, setIntention] = useState("");
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    listRoles(userId).then((result) => {
      if (result.ok) setRoles(result.data);
    });

    // Pre-fill if this ISO week already has an intention, so reopening the
    // screen edits it rather than silently starting over.
    getWeekIntention(userId).then((result) => {
      if (result.ok && result.data) {
        setQ2Target(Number(result.data.q2_target_pct));
        setSelectedRoles(result.data.role_intentions_json ?? []);
        setIntention(result.data.one_sentence_intention ?? "");
      }
    });
  }, [userId]);

  function toggleRole(id: string) {
    setSelectedRoles((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= MAX_INTENTION_ROLES) return prev;
      return [...prev, id];
    });
  }

  async function handleSave() {
    if (!userId || busy) return;

    setBusy(true);
    setError(null);

    const result = await saveWeekIntention(userId, {
      q2TargetPct: q2Target,
      roleIds: selectedRoles,
      intention,
    });
    setBusy(false);

    if (!result.ok) {
      setError(t("weekIntention.errorGeneric"));
      return;
    }

    router.replace("/timeline");
  }

  const fillPercent =
    ((q2Target - Q2_TARGET_MIN) / (Q2_TARGET_MAX - Q2_TARGET_MIN)) * 100;
  const roleLimitReached = selectedRoles.length >= MAX_INTENTION_ROLES;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.heading}>{t("weekIntention.heading")}</Text>
        <Text style={styles.subheading}>{t("weekIntention.subheading")}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.label}>{t("weekIntention.q2Label")}</Text>
          <Text style={styles.value}>{q2Target}%</Text>
        </View>
        <Text style={styles.hint}>{t("weekIntention.q2Hint")}</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepButton}
            onPress={() =>
              setQ2Target((v) => Math.max(Q2_TARGET_MIN, v - Q2_STEP))
            }
            accessibilityRole="button"
            accessibilityLabel={`Decrease Q2 target to ${Math.max(
              Q2_TARGET_MIN,
              q2Target - Q2_STEP
            )} percent`}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${fillPercent}%` }]} />
          </View>
          <Pressable
            style={styles.stepButton}
            onPress={() =>
              setQ2Target((v) => Math.min(Q2_TARGET_MAX, v + Q2_STEP))
            }
            accessibilityRole="button"
            accessibilityLabel={`Increase Q2 target to ${Math.min(
              Q2_TARGET_MAX,
              q2Target + Q2_STEP
            )} percent`}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("weekIntention.rolesLabel")}</Text>
        <Text style={styles.hint}>{t("weekIntention.rolesHint")}</Text>
        {roles.length === 0 ? (
          <Text style={styles.empty}>{t("weekIntention.rolesEmpty")}</Text>
        ) : (
          <View style={styles.chips}>
            {roles.map((role) => {
              const active = selectedRoles.includes(role.id);
              const disabled = !active && roleLimitReached;
              return (
                <Pressable
                  key={role.id}
                  onPress={() => toggleRole(role.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active, disabled }}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                    disabled && styles.chipDisabled,
                  ]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {role.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t("weekIntention.intentionLabel")}</Text>
        <TextInput
          style={styles.textArea}
          value={intention}
          onChangeText={setIntention}
          placeholder={t("weekIntention.intentionPlaceholder")}
          placeholderTextColor={colors.text.muted}
          multiline
          numberOfLines={3}
          editable={!busy}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={busy ? t("weekIntention.saving") : t("weekIntention.saveCta")}
        onPress={handleSave}
        disabled={busy}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: { gap: spacing.sm },
  heading: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as never,
  },
  subheading: {
    color: colors.text.secondary,
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.5,
  },
  section: { gap: spacing.sm },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium as never,
  },
  value: {
    color: colors.accent.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as never,
  },
  hint: { color: colors.text.muted, fontSize: typography.size.sm },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: spacing.xs,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: colors.text.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as never,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background.elevated,
    overflow: "hidden",
  },
  trackFill: { height: "100%", backgroundColor: colors.accent.primary },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  chipActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  chipDisabled: { opacity: 0.4 },
  chipText: { color: colors.text.secondary, fontSize: typography.size.sm },
  chipTextActive: {
    color: colors.text.primary,
    fontWeight: typography.weight.medium as never,
  },
  empty: { color: colors.text.muted, fontSize: typography.size.sm },
  textArea: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: spacing.xs,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: typography.size.base,
    minHeight: 88,
    textAlignVertical: "top",
  },
  error: { color: colors.accent.danger, fontSize: typography.size.sm },
});
