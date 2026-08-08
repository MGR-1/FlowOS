import { useEffect, useReducer, useRef, useState } from 'react'
import { colors, font, radius, spacing } from '../../lib/tokens'
import {
  FOCUS_DURATION_OPTIONS,
  createRhythmState,
  focusRhythmReducer,
  formatRemainingTime,
  recommendedFocusDuration,
  type CompletedFocusSession,
  type FocusDuration,
  type RhythmState,
} from '../../../packages/core/src/performance/focusRhythm'

const STATE_KEY = 'flowos.focusRhythm.state.v1'
const HISTORY_KEY = 'flowos.focusRhythm.history.v1'

function loadState(): RhythmState {
  try {
    const stored = localStorage.getItem(STATE_KEY)
    return stored ? { ...createRhythmState(), ...JSON.parse(stored) } : createRhythmState()
  } catch {
    return createRhythmState()
  }
}

function loadHistory(): CompletedFocusSession[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function FocusRhythmCard() {
  const [state, dispatch] = useReducer(focusRhythmReducer, undefined, loadState)
  const [history, setHistory] = useState<CompletedFocusSession[]>(loadHistory)
  const previousCompleted = useRef(state.completedFocusSessions)
  const recommendation = recommendedFocusDuration(history)
  const activePhase = state.phase === 'paused' ? state.resumePhase : state.phase
  const isRunning = state.phase === 'focus' || state.phase === 'break'

  useEffect(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!isRunning) return
    const timer = window.setInterval(() => dispatch({ type: 'tick' }), 1000)
    return () => window.clearInterval(timer)
  }, [isRunning])

  useEffect(() => {
    if (state.completedFocusSessions <= previousCompleted.current) return
    previousCompleted.current = state.completedFocusSessions
    const completed: CompletedFocusSession = {
      plannedMinutes: state.focusMinutes,
      completedAt: new Date().toISOString(),
    }
    setHistory(current => {
      const next = [...current, completed].slice(-50)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      return next
    })
  }, [state.completedFocusSessions, state.focusMinutes])

  const phaseLabel = activePhase === 'focus'
    ? 'Deep work'
    : activePhase === 'break'
      ? 'Recovery break'
      : 'Ready for focus'
  const accent = activePhase === 'break' ? colors.teal : colors.blue

  return (
    <div style={{
      marginBottom: spacing.lg,
      background: colors.surface1,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      padding: spacing.lg,
      display: 'grid',
      gridTemplateColumns: 'minmax(180px, 0.8fr) minmax(260px, 1.2fr)',
      gap: spacing.lg,
      alignItems: 'center',
    }}>
      <div>
        <p style={{ color: accent, fontSize: font.size.xs, fontWeight: font.weight.semibold, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
          Focus Rhythm
        </p>
        <p aria-live="polite" style={{ color: colors.textPrimary, fontSize: '36px', fontWeight: font.weight.bold, fontVariantNumeric: 'tabular-nums', margin: 0 }}>
          {formatRemainingTime(state.secondsRemaining)}
        </p>
        <p style={{ color: colors.textSecondary, fontSize: font.size.sm, margin: '4px 0 0' }}>
          {phaseLabel}{state.phase === 'paused' ? ' · Paused' : ''}
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
          {FOCUS_DURATION_OPTIONS.map(minutes => (
            <button
              key={minutes}
              type="button"
              disabled={state.phase !== 'idle'}
              onClick={() => dispatch({ type: 'setFocusMinutes', minutes })}
              aria-pressed={state.focusMinutes === minutes}
              style={{
                border: `1px solid ${state.focusMinutes === minutes ? colors.blue : colors.border}`,
                background: state.focusMinutes === minutes ? colors.blueFill : colors.surface2,
                color: state.focusMinutes === minutes ? colors.blue : colors.textSecondary,
                borderRadius: radius.full,
                padding: '5px 10px',
                fontSize: font.size.xs,
                cursor: state.phase === 'idle' ? 'pointer' : 'not-allowed',
                opacity: state.phase === 'idle' ? 1 : 0.55,
              }}
            >
              {minutes} min
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
          {state.phase === 'idle' && (
            <button type="button" onClick={() => dispatch({ type: 'start', now: new Date().toISOString() })} style={primaryButton}>
              Start focus sprint
            </button>
          )}
          {isRunning && (
            <button type="button" onClick={() => dispatch({ type: 'pause' })} style={secondaryButton}>
              Pause
            </button>
          )}
          {state.phase === 'paused' && (
            <button type="button" onClick={() => dispatch({ type: 'resume' })} style={primaryButton}>
              Resume
            </button>
          )}
          {(activePhase === 'break') && (
            <button type="button" onClick={() => dispatch({ type: 'skipBreak' })} style={secondaryButton}>
              Skip break
            </button>
          )}
          {state.phase !== 'idle' && (
            <button type="button" onClick={() => dispatch({ type: 'reset' })} style={secondaryButton}>
              End session
            </button>
          )}
        </div>

        <p style={{ color: colors.textMuted, fontSize: font.size.xs, margin: `${spacing.sm} 0 0` }}>
          {recommendation && recommendation !== state.focusMinutes
            ? `Based on your last 10 sessions, try ${recommendation} minutes.`
            : `${history.length}/10 completed sessions before a personal rhythm suggestion.`}
        </p>
      </div>
    </div>
  )
}

const primaryButton: React.CSSProperties = {
  background: colors.teal,
  border: 'none',
  borderRadius: radius.sm,
  color: '#fff',
  cursor: 'pointer',
  fontFamily: font.family,
  fontSize: font.size.sm,
  fontWeight: font.weight.medium,
  padding: '8px 14px',
}

const secondaryButton: React.CSSProperties = {
  ...primaryButton,
  background: 'transparent',
  border: `1px solid ${colors.border}`,
  color: colors.textSecondary,
}
