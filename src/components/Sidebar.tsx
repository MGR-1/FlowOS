import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRoles } from '../hooks/useFlowOS'
import { colors, font, radius, spacing } from '../lib/tokens'

const NAV = [
  { path: '/today',    icon: '◎', label: 'Today'    },
  { path: '/planning', icon: '⊞', label: 'Planning'  },
  { path: '/capture',  icon: '⊕', label: 'Capture'   },
  { path: '/meetings', icon: '◈', label: 'Meetings'  },
  { path: '/insights', icon: '◉', label: 'Insights'  },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { roles } = useRoles()

  return (
    <nav style={{
      width: '220px', minWidth: '220px',
      height: '100vh', background: colors.surface1,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex', flexDirection: 'column',
      padding: `${spacing.lg} 0`,
      fontFamily: font.family,
    }}>
      {/* Logo */}
      <div style={{
        padding: `0 ${spacing.lg}`,
        marginBottom: spacing.xl,
        display: 'flex', alignItems: 'center', gap: spacing.sm,
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: radius.sm,
          background: `${colors.teal}20`, border: `1px solid ${colors.teal}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke={colors.teal} strokeWidth="1.5" fill="none"/>
            <circle cx="7" cy="7" r="2.5" fill={colors.teal}/>
          </svg>
        </div>
        <span style={{
          color: colors.textPrimary, fontWeight: font.weight.bold,
          fontSize: font.size.md, letterSpacing: '-0.3px',
        }}>FlowOS</span>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, padding: `0 ${spacing.sm}` }}>
        {NAV.map(({ path, icon, label }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: spacing.sm, padding: `9px ${spacing.md}`,
                borderRadius: radius.md,
                background: active ? `${colors.teal}15` : 'transparent',
                border: 'none', cursor: 'pointer',
                color: active ? colors.teal : colors.textSecondary,
                fontSize: font.size.sm, fontWeight: active ? font.weight.semibold : font.weight.normal,
                fontFamily: font.family, textAlign: 'left',
                transition: 'all 0.15s',
                marginBottom: '2px',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>{icon}</span>
              {label}
              {active && (
                <div style={{
                  marginLeft: 'auto', width: '4px', height: '4px',
                  borderRadius: radius.full, background: colors.teal,
                }} />
              )}
            </button>
          )
        })}

        {/* Role divider */}
        {roles.length > 0 && (
          <>
            <div style={{
              height: '1px', background: colors.border,
              margin: `${spacing.md} ${spacing.sm}`,
            }} />
            <p style={{
              color: colors.textMuted, fontSize: font.size.xs,
              fontWeight: font.weight.semibold, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: `0 ${spacing.sm}`,
              margin: `0 0 ${spacing.xs}`,
            }}>Roles</p>
            {roles.slice(0, 6).map(role => (
              <div key={role.id} style={{
                display: 'flex', alignItems: 'center', gap: spacing.sm,
                padding: `6px ${spacing.md}`, borderRadius: radius.md,
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: radius.full,
                  background: role.color, flexShrink: 0,
                }} />
                <span style={{
                  color: colors.textSecondary, fontSize: font.size.sm,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {role.emoji ? `${role.emoji} ` : ''}{role.name}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Settings / Sign out */}
      <div style={{ padding: `0 ${spacing.sm}`, borderTop: `1px solid ${colors.border}`, paddingTop: spacing.md }}>
        <button
          onClick={() => navigate('/settings')}
          style={bottomBtnStyle}
        >
          <span>⚙</span> Settings
        </button>
        <button onClick={signOut} style={bottomBtnStyle}>
          <span>↪</span> Sign out
        </button>
      </div>
    </nav>
  )
}

const bottomBtnStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center',
  gap: spacing.sm, padding: `8px ${spacing.md}`,
  borderRadius: radius.md, background: 'transparent',
  border: 'none', cursor: 'pointer',
  color: colors.textMuted, fontSize: font.size.sm,
  fontFamily: font.family, textAlign: 'left',
  marginBottom: '2px',
}
