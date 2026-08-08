export const HOMEPAGE_WIDGET_TYPES = [
  "mits_today",
  "today_agenda",
  "investment_score",
  "deep_work_streak",
  "wearable_readiness",
  "open_braindump",
  "active_timer",
  "week_goals_by_role",
  "billable_hours_month",
  "energy_indicator",
] as const;

export type HomepageWidgetType = (typeof HOMEPAGE_WIDGET_TYPES)[number];
export type WidgetSize = "small" | "medium" | "large";

export interface HomepageWidget {
  id: string;
  type: HomepageWidgetType;
  enabled: boolean;
  order: number;
  size: WidgetSize;
}

export interface HomepageLayout {
  version: 1;
  widgets: HomepageWidget[];
  updatedAt: string;
}

export const DEFAULT_HOMEPAGE_WIDGETS: HomepageWidget[] = [
  widget("mits_today", 1, "large"),
  widget("today_agenda", 2, "large"),
  widget("investment_score", 3, "medium"),
  widget("active_timer", 4, "medium"),
  widget("deep_work_streak", 5, "small"),
  widget("energy_indicator", 6, "small"),
  widget("open_braindump", 7, "medium"),
  widget("week_goals_by_role", 8, "large"),
  widget("wearable_readiness", 9, "small", false),
  widget("billable_hours_month", 10, "small", false),
];

export function createHomepageLayout(now: string): HomepageLayout {
  return { version: 1, widgets: DEFAULT_HOMEPAGE_WIDGETS.map((item) => ({ ...item })), updatedAt: now };
}

export function toggleWidget(layout: HomepageLayout, id: string, enabled: boolean, now: string): HomepageLayout {
  return {
    ...layout,
    updatedAt: now,
    widgets: layout.widgets.map((item) => item.id === id ? { ...item, enabled } : item),
  };
}

export function reorderWidget(layout: HomepageLayout, id: string, targetIndex: number, now: string): HomepageLayout {
  const ordered = [...layout.widgets].sort((a, b) => a.order - b.order);
  const sourceIndex = ordered.findIndex((item) => item.id === id);
  if (sourceIndex < 0) return layout;
  const [moved] = ordered.splice(sourceIndex, 1);
  ordered.splice(Math.max(0, Math.min(targetIndex, ordered.length)), 0, moved);
  return { ...layout, updatedAt: now, widgets: ordered.map((item, index) => ({ ...item, order: index + 1 })) };
}

export function validateHomepageLayout(layout: HomepageLayout): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const types = new Set<HomepageWidgetType>();
  for (const item of layout.widgets) {
    if (ids.has(item.id)) errors.push(`Duplicate widget id: ${item.id}.`);
    if (types.has(item.type)) errors.push(`Duplicate widget type: ${item.type}.`);
    if (!HOMEPAGE_WIDGET_TYPES.includes(item.type)) errors.push(`Unsupported widget type: ${item.type}.`);
    ids.add(item.id);
    types.add(item.type);
  }
  return errors;
}

function widget(type: HomepageWidgetType, order: number, size: WidgetSize, enabled = true): HomepageWidget {
  return { id: type, type, enabled, order, size };
}
