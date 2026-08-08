import { describe, expect, it } from 'vitest'
import {
  createRhythmState,
  focusRhythmReducer,
  formatRemainingTime,
  recommendedFocusDuration,
  type CompletedFocusSession,
} from './engine'

describe('focus rhythm engine', () => {
  it('starts a configured focus sprint', () => {
    const state = focusRhythmReducer(createRhythmState(60), { type: 'start', now: '2026-08-08T12:00:00Z' })
    expect(state.phase).toBe('focus')
    expect(state.secondsRemaining).toBe(3600)
    expect(state.sessionStartedAt).toBe('2026-08-08T12:00:00Z')
  })

  it('moves from focus to recovery and then back to idle', () => {
    const focusEnding = { ...createRhythmState(45, 20), phase: 'focus' as const, secondsRemaining: 1 }
    const recovery = focusRhythmReducer(focusEnding, { type: 'tick' })
    expect(recovery.phase).toBe('break')
    expect(recovery.secondsRemaining).toBe(1200)
    expect(recovery.completedFocusSessions).toBe(1)

    const idle = focusRhythmReducer({ ...recovery, secondsRemaining: 1 }, { type: 'tick' })
    expect(idle.phase).toBe('idle')
    expect(idle.secondsRemaining).toBe(2700)
  })

  it('does not consume time while paused', () => {
    const paused = { ...createRhythmState(), phase: 'paused' as const, resumePhase: 'focus' as const }
    expect(focusRhythmReducer(paused, { type: 'tick' })).toEqual(paused)
    expect(focusRhythmReducer(paused, { type: 'resume' }).phase).toBe('focus')
  })

  it('suggests a duration only after ten completed sessions', () => {
    const session = (plannedMinutes: 45 | 60 | 75 | 90 | 120): CompletedFocusSession => ({
      plannedMinutes,
      completedAt: '2026-08-08T12:00:00Z',
    })
    expect(recommendedFocusDuration(Array.from({ length: 9 }, () => session(60)))).toBeNull()
    expect(recommendedFocusDuration([
      session(60), session(60), session(60), session(60), session(60), session(60),
      session(90), session(90), session(90), session(90),
    ])).toBe(60)
  })

  it('formats remaining time safely', () => {
    expect(formatRemainingTime(90)).toBe('01:30')
    expect(formatRemainingTime(-1)).toBe('00:00')
  })
})
