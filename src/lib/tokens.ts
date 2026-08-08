// ─── FlowOS Design Tokens ────────────────────────────────────
// Source: Visual Design System v1.0
// These are the ONLY source of truth for colors and spacing.
// Never hardcode hex values in components.

export const colors = {
  // Backgrounds
  bg:        '#0F1117',   // app background
  surface1:  '#161B27',   // card, sidebar
  surface2:  '#1E2435',   // elevated card, input
  border:    '#2A3045',   // dividers

  // System palette (semantic — fixed)
  teal:      '#1D9E75',   // success, on-track, Investment Score 60%+
  tealFill:  '#E1F5EE',
  amber:     '#BA7517',   // attention, 40-59%
  amberFill: '#FAEEDA',
  red:       '#E24B4A',   // warning, <40%
  redFill:   '#FCEBEB',
  blue:      '#378ADD',   // MITs, time blocks
  blueFill:  '#E6F1FB',
  purple:    '#7F77DD',   // investment zone, time tracked
  purpleFill:'#EEEDFE',
  gray:      '#888780',   // void, empty states

  // Text
  textPrimary:   '#E8EDF3',
  textSecondary: '#8892A4',
  textMuted:     '#505A6E',

  // Role presets (12 options)
  rolePresets: [
    '#1D9E75', '#378ADD', '#7F77DD', '#E24B4A',
    '#BA7517', '#E07B54', '#5BAD8F', '#4A90D9',
    '#9B59B6', '#E67E22', '#27AE60', '#C0392B',
  ],
} as const

export const spacing = {
  xs:  '4px',
  sm:  '8px',
  md:  '16px',
  lg:  '24px',
  xl:  '32px',
  xxl: '48px',
} as const

export const radius = {
  sm:   '6px',
  md:   '10px',
  lg:   '16px',
  full: '9999px',
} as const

export const font = {
  family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  size: {
    xs:  '11px',
    sm:  '13px',
    md:  '15px',
    lg:  '18px',
    xl:  '24px',
    xxl: '32px',
  },
  weight: {
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
} as const

// Block type → color mapping
export const blockTypeColor: Record<string, string> = {
  focus:      colors.blue,
  investment: colors.purple,
  meeting:    '#4CAF50',
  nsdr:       colors.teal,
  shutdown:   '#6B7280',
  buffer:     '#374151',
  free:       '#374151',
  habit:      colors.amber,
}

// Investment score → color thresholds
export function investmentScoreColor(score: number): string {
  if (score >= 60) return colors.teal
  if (score >= 40) return colors.amber
  return colors.red
}
