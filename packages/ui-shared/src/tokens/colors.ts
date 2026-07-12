// packages/ui-shared/src/tokens/colors.ts
// NEVER hardcode hex values in components — always import from here.

export const colors = {
  background: {
    primary: "#0B0B0F",
    secondary: "#16161D",
    elevated: "#1F1F29",
  },
  text: {
    primary: "#F5F5F7",
    secondary: "#A0A0AC",
    muted: "#6B6B76",
  },
  accent: {
    primary: "#5B8DEF",
    success: "#3DD68C",
    warning: "#F5A623",
    danger: "#E5484D",
    purple: "#9B59B6",
  },
  role: {
    violet: "#7C3AED",
    blue: "#2563EB",
    teal: "#0D9488",
    amber: "#D97706",
    gray: "#6B7280",
  },
  border: {
    default: "#2A2A34",
    focus: "#5B8DEF",
  },
} as const;

export type ColorToken = typeof colors;
