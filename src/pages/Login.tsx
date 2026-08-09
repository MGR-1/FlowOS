import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { colors, font, radius, spacing } from '../lib/tokens'

export function Login() {
  const { signInWithGoogle, signInWithApple, signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await signInWithMagicLink(email)
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: font.family,
    }}>
      {/* Cursor glow atmosphere */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(600px circle at 50% 40%, ${colors.teal}08, transparent 70%)`,
      }} />

      <div style={{ width: '100%', maxWidth: '400px', padding: spacing.xl }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: spacing.xxl }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: radius.md,
            background: `${colors.teal}20`, border: `1px solid ${colors.teal}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto', marginBottom: spacing.lg,
          }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke={colors.teal} strokeWidth="2" fill="none" />
              <circle cx="14" cy="14" r="5" fill={colors.teal} />
            </svg>
          </div>
          <h1 style={{
            color: colors.textPrimary, fontSize: font.size.xl,
            fontWeight: font.weight.bold, margin: 0, letterSpacing: '-0.5px',
          }}>FlowOS</h1>
          <p style={{
            color: colors.textSecondary, fontSize: font.size.sm,
            margin: `${spacing.xs} 0 0`,
          }}>Your personal operating system</p>
        </div>

        {/* Auth card */}
        <div style={{
          background: colors.surface1,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          padding: spacing.xl,
        }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: spacing.lg }}>
              <div style={{ fontSize: '32px', marginBottom: spacing.md }}>✉️</div>
              <p style={{ color: colors.textPrimary, fontWeight: font.weight.medium, margin: '0 0 8px' }}>
                Check your inbox
              </p>
              <p style={{ color: colors.textSecondary, fontSize: font.size.sm, margin: 0 }}>
                We sent a sign-in link to <strong style={{ color: colors.textPrimary }}>{email}</strong>
              </p>
            </div>
          ) : (
            <>
              {/* OAuth buttons */}
              <button onClick={signInWithGoogle} style={oauthBtnStyle}>
                <GoogleIcon />
                Continue with Google
              </button>

              <button onClick={signInWithApple} style={{ ...oauthBtnStyle, marginTop: spacing.sm }}>
                <AppleIcon />
                Continue with Apple
              </button>

              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: spacing.md, margin: `${spacing.lg} 0`,
              }}>
                <div style={{ flex: 1, height: '1px', background: colors.border }} />
                <span style={{ color: colors.textMuted, fontSize: font.size.xs }}>or</span>
                <div style={{ flex: 1, height: '1px', background: colors.border }} />
              </div>

              {/* Magic link */}
              <form onSubmit={handleMagicLink}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{
                    ...primaryBtnStyle,
                    opacity: loading || !email ? 0.5 : 1,
                    cursor: loading || !email ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Sending…' : 'Send sign-in link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{
          textAlign: 'center', color: colors.textMuted,
          fontSize: font.size.xs, marginTop: spacing.lg,
        }}>
          Data stored in EU-West Frankfurt · GDPR compliant
        </p>
      </div>
    </div>
  )
}

// ─── Inline styles ────────────────────────────────────────────
const oauthBtnStyle: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: spacing.sm,
  padding: '12px 16px', borderRadius: radius.md,
  background: colors.surface2, border: `1px solid ${colors.border}`,
  color: colors.textPrimary, fontSize: font.size.sm,
  fontWeight: font.weight.medium, cursor: 'pointer',
  fontFamily: font.family, transition: 'border-color 0.15s',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  background: colors.surface2, border: `1px solid ${colors.border}`,
  borderRadius: radius.md, color: colors.textPrimary,
  fontSize: font.size.sm, fontFamily: font.family,
  outline: 'none', boxSizing: 'border-box',
  marginBottom: spacing.sm,
}

const primaryBtnStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  background: colors.teal, border: 'none',
  borderRadius: radius.md, color: '#fff',
  fontSize: font.size.sm, fontWeight: font.weight.semibold,
  fontFamily: font.family, cursor: 'pointer',
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.6 2.41v2h2.58c1.51-1.39 2.4-3.44 2.4-5.87z" fill="#4285F4"/>
      <path d="M8 16c2.16 0 3.97-.71 5.3-1.94l-2.59-2a4.8 4.8 0 01-7.17-2.52H.96v2.07A8 8 0 008 16z" fill="#34A853"/>
      <path d="M3.54 9.54A4.8 4.8 0 013.28 8c0-.54.09-1.06.26-1.54V4.39H.96A8 8 0 000 8c0 1.29.31 2.51.96 3.61l2.58-2.07z" fill="#FBBC05"/>
      <path d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 00.96 4.39l2.58 2.07A4.77 4.77 0 018 3.18z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={colors.textPrimary}>
      <path d="M11.18 0c.07.9-.26 1.8-.79 2.46-.54.68-1.38 1.2-2.23 1.14-.09-.86.31-1.77.82-2.4C9.52.55 10.4.05 11.18 0zM14 11.18c-.38.84-.56 1.22-1.05 1.96-.68 1.03-1.64 2.3-2.84 2.31-1.06.01-1.33-.68-2.77-.68-1.44 0-1.74.7-2.86.7-1.18 0-2.09-1.2-2.78-2.23C.07 11.3-.22 8.97.23 6.72c.32-1.58 1.15-3.04 2.28-3.9.88-.66 2.12-1.1 3.19-.83.77.19 1.41.67 2 .67.57 0 1.64-.57 2.69-.57 1.12-.02 2.16.47 2.86 1.3-.3.19-2.03 1.18-2.01 3.17.02 2.37 2.08 3.17 2.76 3.62z"/>
    </svg>
  )
}
