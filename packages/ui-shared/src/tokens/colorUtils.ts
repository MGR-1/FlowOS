// packages/ui-shared/src/tokens/colorUtils.ts

// Appends an alpha channel to a 6-digit hex color, e.g. withAlpha("#5B8DEF", "22").
export function withAlpha(hex: string, alpha: string): string {
  return `${hex}${alpha}`;
}
