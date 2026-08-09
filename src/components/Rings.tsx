import { colors, investmentScoreColor } from '../lib/tokens'

interface RingProps {
  size: number
  strokeWidth: number
  value: number       // 0-100
  color: string
  label: string
  sublabel?: string
  glow?: boolean
}

export function Ring({ size, strokeWidth, value, color, label, sublabel, glow }: RingProps) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const progress = Math.min(100, Math.max(0, value))
  const dashOffset = circumference - (progress / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={`${color}25`}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: glow ? `drop-shadow(0 0 6px ${color}66)` : undefined,
            }}
          />
        </svg>
        {/* Center label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            color, fontWeight: 700,
            fontSize: size >= 140 ? '28px' : size >= 80 ? '16px' : '13px',
            lineHeight: 1,
          }}>
            {Math.round(progress)}
          </span>
          {size >= 80 && (
            <span style={{
              color: colors.textMuted, fontSize: '10px',
              marginTop: '2px', letterSpacing: '0.02em',
            }}>
              {sublabel ?? '%'}
            </span>
          )}
        </div>
      </div>
      <span style={{
        color: colors.textSecondary, fontSize: '11px',
        fontWeight: 500, letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>{label}</span>
    </div>
  )
}

// ─── Hero Ring (Investment Score) ─────────────────────────────
export function HeroRing({ score }: { score: number }) {
  const color = investmentScoreColor(score)
  return (
    <Ring
      size={160} strokeWidth={8}
      value={score} color={color}
      label="Investment" sublabel="%"
      glow
    />
  )
}

// ─── Satellite Rings row ──────────────────────────────────────
interface SatelliteData {
  mitsCompleted: number   // 0-3
  timeTrackedPct: number  // 0-100
  streakDays: number      // raw number, shown as-is
  energyPct: number       // 0-100
}

export function SatelliteRings({ data }: { data: SatelliteData }) {
  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      <Ring
        size={72} strokeWidth={5}
        value={(data.mitsCompleted / 3) * 100}
        color={colors.blue}
        label="MITs"
        sublabel={`${data.mitsCompleted}/3`}
      />
      <Ring
        size={72} strokeWidth={5}
        value={data.timeTrackedPct}
        color={colors.purple}
        label="Time"
      />
      <Ring
        size={72} strokeWidth={5}
        value={Math.min(100, data.streakDays * 10)}
        color={colors.amber}
        label="Streak"
        sublabel={`${data.streakDays}d`}
      />
      <Ring
        size={72} strokeWidth={5}
        value={data.energyPct}
        color={colors.teal}
        label="Energy"
      />
    </div>
  )
}
