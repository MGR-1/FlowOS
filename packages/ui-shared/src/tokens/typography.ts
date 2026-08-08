// packages/ui-shared/src/tokens/typography.ts

export const typography = {
  family: {
    base: "System",
  },
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weight: {
    regular: "400",
    medium: "500",
    bold: "700",
  },
} as const;

export type TypographyToken = typeof typography;
