import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, Role, TimeBlock, DailyReadiness, Mission, BraindumpItem, Goal } from '../types'

// ─── Today's date helpers ────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0]
const currentWeek = () => {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
}

// ─── Roles ───────────────────────────────────────────────────
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('roles')
      .select('*')
      .eq('active', true)
      .order('order_index')
    setRoles(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const createRole = async (name: string, color: string, emoji?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('roles').insert({
      user_id: user.id,
      name,
      color,
      emoji: emoji ?? null,
      order_index: roles.length,
    })
    fetch()
  }

  return { roles, loading, refetch: fetch, createRole }
}

// ─── Mission ─────────────────────────────────────────────────
export function useMission() {
  const [mission, setMission] = useState<Mission | null>(null)

  useEffect(() => {
    supabase
      .from('missions')
      .select('*')
      .single()
      .then(({ data }) => setMission(data))
  }, [])

  const saveMission = async (text: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (mission) {
      const { data } = await supabase.from('missions').update({ text }).eq('id', mission.id).select().single()
      setMission(data)
    } else {
      const { data } = await supabase.from('missions').insert({ user_id: user.id, text }).select().single()
      setMission(data)
    }
  }

  return { mission, saveMission }
}

// ─── Tasks (MITs first) ───────────────────────────────────────
export function useTasks(date?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const targetDate = date ?? today()

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('scheduled_date', targetDate)
      .not('status', 'in', '("done","archived")')
      .order('is_mit', { ascending: false })
      .order('mit_order', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: true })
    setTasks(data ?? [])
    setLoading(false)
  }, [targetDate])

  useEffect(() => { fetch() }, [fetch])

  const createTask = async (title: string, isMit = false, roleId?: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const mitCount = tasks.filter(t => t.is_mit).length
    if (isMit && mitCount >= 3) return // Hard limit: 3 MITs
    await supabase.from('tasks').insert({
      user_id: user.id,
      title,
      role_id: roleId ?? null,
      is_mit: isMit,
      mit_order: isMit ? mitCount + 1 : null,
      scheduled_date: targetDate,
      status: 'todo',
    })
    fetch()
  }

  const completeTask = async (id: string) => {
    await supabase
      .from('tasks')
      .update({ status: 'done', completed_at: new Date().toISOString() })
      .eq('id', id)
    fetch()
  }

  const mits = tasks.filter(t => t.is_mit)
  const other = tasks.filter(t => !t.is_mit)

  return { tasks, mits, other, loading, refetch: fetch, createTask, completeTask }
}

// ─── Time Blocks ─────────────────────────────────────────────
export function useTimeBlocks(date?: string) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const targetDate = date ?? today()

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('date', targetDate)
      .order('start_time')
    setBlocks(data ?? [])
    setLoading(false)
  }, [targetDate])

  useEffect(() => { fetch() }, [fetch])

  return { blocks, loading, refetch: fetch }
}

// ─── Wearable Readiness ──────────────────────────────────────
export function useTodayReadiness() {
  const [readiness, setReadiness] = useState<DailyReadiness | null>(null)

  useEffect(() => {
    supabase
      .from('daily_readiness')
      .select('*')
      .eq('date', today())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setReadiness(data))
  }, [])

  return { readiness }
}

// ─── Goals (this week) ───────────────────────────────────────
export function useWeekGoals() {
  const [goals, setGoals] = useState<Goal[]>([])

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('timeframe', 'this_week')
      .eq('week_number', currentWeek())
      .eq('year', new Date().getFullYear())
    setGoals(data ?? [])
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const toggleGoal = async (id: string, done: boolean) => {
    await supabase.from('goals').update({ done: !done }).eq('id', id)
    fetch()
  }

  return { goals, toggleGoal, refetch: fetch }
}

// ─── Braindump ───────────────────────────────────────────────
export function useBraindump() {
  const [items, setItems] = useState<BraindumpItem[]>([])

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('braindump_items')
      .select('*')
      .is('processed_at', null)
      .order('created_at', { ascending: false })
      .limit(20)
    setItems(data ?? [])
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const capture = async (body: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('braindump_items').insert({
      user_id: user.id,
      body,
      type: 'unprocessed',
      source: 'web',
    })
    fetch()
  }

  return { items, capture, refetch: fetch }
}
