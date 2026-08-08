import { useState } from 'react'
import { useTasks, useTimeBlocks, useTodayReadiness, useMission, useBraindump } from '../hooks/useFlowOS'
import { HeroRing, SatelliteRings } from '../components/Rings'
import { FocusRhythmCard } from '../features/focusRhythm/FocusRhythmCard'
import { colors, font, radius, spacing, blockTypeColor } from '../lib/tokens'
import type { Task, TimeBlock } from '../types'

export function Today() {
  const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const { mits, other, loading: tasksLoading, createTask, completeTask } = useTasks()
  const { blocks, loading: blocksLoading } = useTimeBlocks()
  const { readiness } = useTodayReadiness()
  const { mission } = useMission()
  const { items: braindump, capture } = useBraindump()

  const [newMit, setNewMit] = useState('')
  const [newTask, setNewTask] = useState('')
  const [braindumpInput, setBraindumpInput] = useState('')
  const [showCapture, setShowCapture] = useState(false)

  // Derived stats
  const mitsCompleted = mits.filter(t => t.status === 'done').length
  const energyPct = readiness?.score ?? 70
  const investmentScore = 64 // derived from focus_sessions — placeholder until sessions exist

  const morning = blocks.filter(b => b.start_time < '13:00')
  const afternoon = blocks.filter(b => b.start_time >= '13:00')

  const handleAddMit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMit.trim() || mits.length >= 3) return
    await createTask(newMit.trim(), true)
    setNewMit('')
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    await createTask(newTask.trim(), false)
    setNewTask('')
  }

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!braindumpInput.trim()) return
    await capture(braindumpInput.trim())
    setBraindumpInput('')
    setShowCapture(false)
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      background: colors.bg, fontFamily: font.family,
      padding: spacing.xl,
    }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.xl }}>
        <p style={{
          color: colors.textMuted, fontSize: font.size.sm,
          margin: '0 0 4px', textTransform: 'uppercase',
          letterSpacing: '0.06em', fontWeight: font.weight.medium,
        }}>{dateLabel}</p>
        {mission?.text && (
          <p style={{
            color: colors.textSecondary, fontSize: font.size.sm,
            fontStyle: 'italic', margin: 0,
          }}>"{mission.text}"</p>
        )}
      </div>

      {/* Hero ring + satellites */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: spacing.xxl, marginBottom: spacing.xl,
        padding: spacing.xl,
        background: colors.surface1,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
      }}>
        <HeroRing score={investmentScore} />
        <div style={{ width: '1px', height: '80px', background: colors.border }} />
        <SatelliteRings data={{
          mitsCompleted,
          timeTrackedPct: 42,
          streakDays: 5,
          energyPct,
        }} />
        {readiness?.score && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ color: colors.textMuted, fontSize: font.size.xs, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Readiness
            </p>
            <p style={{ color: colors.teal, fontSize: font.size.xl, fontWeight: font.weight.bold, margin: 0 }}>
              {readiness.score}
            </p>
            <p style={{ color: colors.textMuted, fontSize: font.size.xs, margin: '2px 0 0' }}>
              {readiness.provider}
            </p>
          </div>
        )}
      </div>

      <FocusRhythmCard />

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
        {/* Left: MITs + Tasks */}
        <div>
          {/* MIT Section */}
          <SectionCard title="Most Important Tasks" badge={`${mitsCompleted}/3`} badgeColor={colors.blue}>
            {tasksLoading ? (
              <LoadingRows n={3} />
            ) : (
              <>
                {mits.map(task => (
                  <TaskRow
                    key={task.id} task={task}
                    onComplete={() => completeTask(task.id)}
                    highlight
                  />
                ))}
                {mits.length < 3 && (
                  <form onSubmit={handleAddMit} style={{ marginTop: mits.length > 0 ? spacing.sm : 0 }}>
                    <input
                      value={newMit}
                      onChange={e => setNewMit(e.target.value)}
                      placeholder={mits.length === 0 ? 'Add your first MIT…' : 'Add MIT…'}
                      style={inlineInputStyle}
                    />
                  </form>
                )}
                {mits.length === 0 && (
                  <p style={{ color: colors.textMuted, fontSize: font.size.sm, margin: '4px 0 0' }}>
                    Select 3 tasks that matter most today.
                  </p>
                )}
              </>
            )}
          </SectionCard>

          {/* Other tasks */}
          <SectionCard title="Today's Tasks" style={{ marginTop: spacing.md }}>
            {other.slice(0, 8).map(task => (
              <TaskRow key={task.id} task={task} onComplete={() => completeTask(task.id)} />
            ))}
            <form onSubmit={handleAddTask} style={{ marginTop: spacing.sm }}>
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Add task…"
                style={inlineInputStyle}
              />
            </form>
          </SectionCard>
        </div>

        {/* Right: Time blocks + Braindump */}
        <div>
          <SectionCard title="Morning">
            {blocksLoading ? <LoadingRows n={3} /> : morning.length > 0
              ? morning.map(b => <BlockRow key={b.id} block={b} />)
              : <EmptyState text="No blocks planned" />
            }
          </SectionCard>

          <SectionCard title="Afternoon" style={{ marginTop: spacing.md }}>
            {blocksLoading ? <LoadingRows n={2} /> : afternoon.length > 0
              ? afternoon.map(b => <BlockRow key={b.id} block={b} />)
              : <EmptyState text="Afternoon is open" />
            }
          </SectionCard>

          {/* Braindump */}
          <SectionCard title="Braindump" style={{ marginTop: spacing.md }}
            action={
              <button onClick={() => setShowCapture(v => !v)} style={ghostBtnStyle}>
                {showCapture ? 'Cancel' : '+ Capture'}
              </button>
            }
          >
            {showCapture && (
              <form onSubmit={handleCapture} style={{ marginBottom: spacing.sm }}>
                <input
                  autoFocus
                  value={braindumpInput}
                  onChange={e => setBraindumpInput(e.target.value)}
                  placeholder="Thought, idea, or task…"
                  style={{ ...inlineInputStyle, marginBottom: '6px' }}
                />
                <button type="submit" style={smallPrimaryBtn}>Capture</button>
              </form>
            )}
            {braindump.length > 0
              ? braindump.slice(0, 5).map(item => (
                  <div key={item.id} style={{
                    padding: '8px 0', borderBottom: `1px solid ${colors.border}`,
                    color: colors.textSecondary, fontSize: font.size.sm,
                  }}>
                    {item.body}
                  </div>
                ))
              : !showCapture && <EmptyState text="Inbox clear" />
            }
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────

function SectionCard({ title, badge, badgeColor, children, style, action }: {
  title: string
  badge?: string
  badgeColor?: string
  children: React.ReactNode
  style?: React.CSSProperties
  action?: React.ReactNode
}) {
  return (
    <div style={{
      background: colors.surface1,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      padding: spacing.lg,
      ...style,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: spacing.md,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <h2 style={{
            color: colors.textPrimary, fontSize: font.size.sm,
            fontWeight: font.weight.semibold, margin: 0,
            letterSpacing: '0.02em',
          }}>{title}</h2>
          {badge && (
            <span style={{
              background: `${badgeColor ?? colors.teal}20`,
              color: badgeColor ?? colors.teal,
              fontSize: '10px', fontWeight: font.weight.semibold,
              padding: '2px 7px', borderRadius: radius.full,
            }}>{badge}</span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function TaskRow({ task, onComplete, highlight }: {
  task: Task
  onComplete: () => void
  highlight?: boolean
}) {
  const done = task.status === 'done'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: spacing.sm,
      padding: '8px 0',
      borderBottom: `1px solid ${colors.border}`,
      opacity: done ? 0.4 : 1,
    }}>
      <button
        onClick={onComplete}
        style={{
          width: '18px', height: '18px', flexShrink: 0,
          borderRadius: radius.full,
          border: `1.5px solid ${highlight ? colors.blue : colors.border}`,
          background: done ? (highlight ? colors.blue : colors.teal) : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {done && <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}>✓</span>}
      </button>
      <span style={{
        color: done ? colors.textMuted : colors.textPrimary,
        fontSize: font.size.sm,
        textDecoration: done ? 'line-through' : 'none',
        flex: 1,
      }}>
        {task.title}
      </span>
      {task.estimated_mins && !done && (
        <span style={{ color: colors.textMuted, fontSize: '11px' }}>
          {task.estimated_mins}m
        </span>
      )}
    </div>
  )
}

function BlockRow({ block }: { block: TimeBlock }) {
  const color = blockTypeColor[block.type] ?? colors.gray
  const start = block.start_time.slice(0, 5)
  const end = block.end_time.slice(0, 5)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: spacing.sm,
      padding: '8px 0', borderBottom: `1px solid ${colors.border}`,
    }}>
      <div style={{
        width: '3px', height: '32px', borderRadius: '2px',
        background: color, flexShrink: 0,
      }} />
      <div style={{ flex: 1 }}>
        <p style={{ color: colors.textPrimary, fontSize: font.size.sm, margin: 0, fontWeight: font.weight.medium }}>
          {block.title}
        </p>
        <p style={{ color: colors.textMuted, fontSize: '11px', margin: '2px 0 0' }}>
          {start} – {end}
        </p>
      </div>
      <span style={{
        fontSize: '10px', fontWeight: font.weight.semibold,
        color, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>{block.type}</span>
    </div>
  )
}

function LoadingRows({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          height: '36px', borderRadius: radius.sm,
          background: colors.surface2,
          marginBottom: '6px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p style={{ color: colors.textMuted, fontSize: font.size.sm, margin: '4px 0', textAlign: 'center' }}>
      {text}
    </p>
  )
}

// ─── Inline styles ────────────────────────────────────────────
const inlineInputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px',
  background: colors.surface2, border: `1px solid ${colors.border}`,
  borderRadius: radius.sm, color: colors.textPrimary,
  fontSize: font.size.sm, fontFamily: font.family,
  outline: 'none', boxSizing: 'border-box',
}

const ghostBtnStyle: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${colors.border}`,
  borderRadius: radius.sm, color: colors.textSecondary,
  fontSize: font.size.xs, padding: '4px 10px',
  cursor: 'pointer', fontFamily: font.family,
}

const smallPrimaryBtn: React.CSSProperties = {
  background: colors.teal, border: 'none',
  borderRadius: radius.sm, color: '#fff',
  fontSize: font.size.xs, padding: '6px 14px',
  cursor: 'pointer', fontFamily: font.family,
  fontWeight: font.weight.medium,
}
