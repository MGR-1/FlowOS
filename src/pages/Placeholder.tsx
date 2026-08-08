import { colors, font, spacing } from '../lib/tokens'

export function Placeholder({ title }: { title: string }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: colors.bg, fontFamily: font.family,
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: colors.textMuted, fontSize: font.size.sm, margin: `0 0 ${spacing.sm}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Coming in Sprint 2
        </p>
        <h1 style={{ color: colors.textPrimary, fontSize: font.size.xl, fontWeight: 700, margin: 0 }}>
          {title}
        </h1>
      </div>
    </div>
  )
}
