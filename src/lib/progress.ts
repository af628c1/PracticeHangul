import type {
  ItemStat,
  PracticeMode,
  PracticePrefs,
  Progress,
  QuestionCount,
  SessionRecord,
} from '../types'
import { allCategories } from '../data/letters'

const RECENT_LIMIT = 20
const MASTERED_MIN_CORRECT = 3
const MASTERED_ACCURACY = 0.8
const TRICKY_MIN_SEEN = 3
const TRICKY_ACCURACY = 0.6

export const defaultPrefs: PracticePrefs = {
  updatedAt: 0,
  letterCategories: ['basic-consonant', 'basic-vowel'],
  letterCount: 10,
  wordDifficulty: 2,
  wordCount: 10,
}

export function emptyProgress(): Progress {
  return {
    answered: 0,
    correct: 0,
    sessions: 0,
    bestStreak: 0,
    activity: {},
    letters: {},
    words: {},
    recent: [],
    prefs: defaultPrefs,
  }
}

export function hasProgress(p: Progress): boolean {
  return (
    p.answered > 0 ||
    p.sessions > 0 ||
    p.bestStreak > 0 ||
    Object.keys(p.letters).length > 0 ||
    Object.keys(p.words).length > 0
  )
}

// ---------- Days & streaks ----------

export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Consecutive practice days ending today, or yesterday if today isn't done yet. */
export function currentDayStreak(
  activity: Record<string, number>,
  today: Date = new Date(),
): number {
  let day = activity[dayKey(today)] ? today : addDays(today, -1)
  let streak = 0
  while (activity[dayKey(day)]) {
    streak++
    day = addDays(day, -1)
  }
  return streak
}

export function longestDayStreak(activity: Record<string, number>): number {
  let best = 0
  let run = 0
  let expected = ''
  for (const key of Object.keys(activity).sort()) {
    if (!activity[key]) continue
    run = key === expected ? run + 1 : 1
    best = Math.max(best, run)
    const [y, m, d] = key.split('-').map(Number)
    expected = dayKey(new Date(y, m - 1, d + 1))
  }
  return best
}

// ---------- Item mastery ----------

export type ItemStatus = 'new' | 'learning' | 'tricky' | 'mastered'

export function itemStatus(stat: ItemStat | undefined): ItemStatus {
  if (!stat) return 'new'
  const accuracy = stat.seen > 0 ? stat.correct / stat.seen : 0
  if (stat.correct >= MASTERED_MIN_CORRECT && accuracy >= MASTERED_ACCURACY) {
    return 'mastered'
  }
  if (stat.seen >= TRICKY_MIN_SEEN && accuracy < TRICKY_ACCURACY) return 'tricky'
  return 'learning'
}

export interface ProgressSummary {
  dayStreak: number
  longestDayStreak: number
  practicedToday: boolean
  /** 0–100, or null before any answers */
  accuracy: number | null
  lettersPracticed: number
  wordsPracticed: number
  lettersMastered: number
  wordsMastered: number
}

export function summarize(p: Progress, today: Date = new Date()): ProgressSummary {
  const countMastered = (items: Record<string, ItemStat>) =>
    Object.values(items).filter((s) => itemStatus(s) === 'mastered').length
  return {
    dayStreak: currentDayStreak(p.activity, today),
    longestDayStreak: longestDayStreak(p.activity),
    practicedToday: Boolean(p.activity[dayKey(today)]),
    accuracy: p.answered > 0 ? Math.round((p.correct / p.answered) * 100) : null,
    lettersPracticed: Object.keys(p.letters).length,
    wordsPracticed: Object.keys(p.words).length,
    lettersMastered: countMastered(p.letters),
    wordsMastered: countMastered(p.words),
  }
}

// ---------- Recording ----------

export function withAnswer(
  p: Progress,
  mode: PracticeMode,
  item: string,
  correct: boolean,
  now: Date = new Date(),
): Progress {
  const items = mode === 'letters' ? p.letters : p.words
  const prev = items[item] ?? { seen: 0, correct: 0 }
  const nextItems = {
    ...items,
    [item]: { seen: prev.seen + 1, correct: prev.correct + (correct ? 1 : 0) },
  }
  const today = dayKey(now)
  return {
    ...p,
    answered: p.answered + 1,
    correct: p.correct + (correct ? 1 : 0),
    activity: { ...p.activity, [today]: (p.activity[today] ?? 0) + 1 },
    letters: mode === 'letters' ? nextItems : p.letters,
    words: mode === 'words' ? nextItems : p.words,
  }
}

export function withBestStreak(p: Progress, streak: number): Progress {
  return streak > p.bestStreak ? { ...p, bestStreak: streak } : p
}

export function withSession(
  p: Progress,
  session: Omit<SessionRecord, 'id' | 'at'>,
  now: number = Date.now(),
): Progress {
  const record: SessionRecord = { id: newId(), at: now, ...session }
  return {
    ...p,
    sessions: p.sessions + 1,
    bestStreak: Math.max(p.bestStreak, session.bestStreak),
    recent: [record, ...p.recent].slice(0, RECENT_LIMIT),
  }
}

export function withPrefs(
  p: Progress,
  prefs: Partial<Omit<PracticePrefs, 'updatedAt'>>,
  now: number = Date.now(),
): Progress {
  const next = { ...p.prefs, ...prefs }
  const unchanged = (Object.keys(prefs) as (keyof typeof prefs)[]).every(
    (key) => stableStringify(next[key]) === stableStringify(p.prefs[key]),
  )
  return unchanged ? p : { ...p, prefs: { ...next, updatedAt: now } }
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// ---------- Merging ----------

type Combine = (a: number, b: number) => number

function keysOf(a: object, b: object): string[] {
  return [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()
}

function mergeCounts(
  a: Record<string, number>,
  b: Record<string, number>,
  combine: Combine,
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const key of keysOf(a, b)) out[key] = combine(a[key] ?? 0, b[key] ?? 0)
  return out
}

function mergeItems(
  a: Record<string, ItemStat>,
  b: Record<string, ItemStat>,
  combine: Combine,
): Record<string, ItemStat> {
  const out: Record<string, ItemStat> = {}
  for (const key of keysOf(a, b)) {
    const x = a[key] ?? { seen: 0, correct: 0 }
    const y = b[key] ?? { seen: 0, correct: 0 }
    out[key] = { seen: combine(x.seen, y.seen), correct: combine(x.correct, y.correct) }
  }
  return out
}

function sortRecent(sessions: SessionRecord[]): SessionRecord[] {
  return sessions
    .sort((x, y) => y.at - x.at || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0))
    .slice(0, RECENT_LIMIT)
}

function mergeRecent(a: SessionRecord[], b: SessionRecord[]): SessionRecord[] {
  const byId = new Map<string, SessionRecord>()
  for (const s of [...a, ...b]) byId.set(s.id, s)
  return sortRecent([...byId.values()])
}

function newerPrefs(a: PracticePrefs, b: PracticePrefs): PracticePrefs {
  if (a.updatedAt !== b.updatedAt) return a.updatedAt > b.updatedAt ? a : b
  // Deterministic tie-break so every device settles on the same value
  return stableStringify(a) >= stableStringify(b) ? a : b
}

function merge(a: Progress, b: Progress, combine: Combine): Progress {
  return {
    answered: combine(a.answered, b.answered),
    correct: combine(a.correct, b.correct),
    sessions: combine(a.sessions, b.sessions),
    bestStreak: Math.max(a.bestStreak, b.bestStreak),
    activity: mergeCounts(a.activity, b.activity, combine),
    letters: mergeItems(a.letters, b.letters, combine),
    words: mergeItems(a.words, b.words, combine),
    recent: mergeRecent(a.recent, b.recent),
    prefs: newerPrefs(a.prefs, b.prefs),
  }
}

/**
 * Reconciles two copies of the same learner's progress (e.g. this device vs
 * the cloud). Idempotent, so it's safe to apply repeatedly while syncing.
 */
export function joinProgress(a: Progress, b: Progress): Progress {
  return merge(a, b, Math.max)
}

/** Adds separate practice history (e.g. done as a guest) onto an account. */
export function addProgress(a: Progress, b: Progress): Progress {
  return merge(a, b, (x, y) => x + y)
}

export function sameProgress(a: Progress, b: Progress): boolean {
  return stableStringify(a) === stableStringify(b)
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    return `{${Object.keys(obj)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(obj[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

// ---------- Parsing stored data ----------

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const count = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0

const isQuestionCount = (v: unknown): v is QuestionCount =>
  v === 10 || v === 20 || v === 'infinite'

function parseCounts(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {}
  if (!isRecord(raw)) return out
  for (const [key, value] of Object.entries(raw)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key) && count(value)) out[key] = count(value)
  }
  return out
}

function parseItems(raw: unknown, legacySeen: unknown): Record<string, ItemStat> {
  const out: Record<string, ItemStat> = {}
  // Before accounts existed, only the set of items seen was stored
  if (Array.isArray(legacySeen)) {
    for (const key of legacySeen) {
      if (typeof key === 'string' && key) out[key] = { seen: 0, correct: 0 }
    }
  }
  if (isRecord(raw)) {
    for (const [key, value] of Object.entries(raw)) {
      if (!key || !isRecord(value)) continue
      const seen = count(value.seen)
      out[key] = { seen, correct: Math.min(count(value.correct), seen) }
    }
  }
  return out
}

function parseRecent(raw: unknown): SessionRecord[] {
  if (!Array.isArray(raw)) return []
  const sessions: SessionRecord[] = []
  for (const s of raw) {
    if (!isRecord(s) || typeof s.id !== 'string') continue
    if (s.mode !== 'letters' && s.mode !== 'words') continue
    sessions.push({
      id: s.id,
      mode: s.mode,
      at: count(s.at),
      score: count(s.score),
      total: count(s.total),
      bestStreak: count(s.bestStreak),
    })
  }
  return sortRecent(sessions)
}

function parsePrefs(raw: unknown): PracticePrefs {
  if (!isRecord(raw)) return defaultPrefs
  const categories = Array.isArray(raw.letterCategories)
    ? allCategories.filter((c) => (raw.letterCategories as unknown[]).includes(c))
    : []
  const difficulty = count(raw.wordDifficulty)
  return {
    updatedAt: count(raw.updatedAt),
    letterCategories: categories.length > 0 ? categories : defaultPrefs.letterCategories,
    letterCount: isQuestionCount(raw.letterCount) ? raw.letterCount : defaultPrefs.letterCount,
    wordDifficulty: difficulty >= 1 && difficulty <= 3 ? difficulty : defaultPrefs.wordDifficulty,
    wordCount: isQuestionCount(raw.wordCount) ? raw.wordCount : defaultPrefs.wordCount,
  }
}

/** Turns anything read from storage or the cloud into valid progress. */
export function parseProgress(raw: unknown): Progress {
  if (!isRecord(raw)) return emptyProgress()
  const answered = count(raw.answered)
  return {
    answered,
    correct: Math.min(count(raw.correct), answered),
    sessions: count(raw.sessions),
    bestStreak: count(raw.bestStreak),
    activity: parseCounts(raw.activity),
    letters: parseItems(raw.letters, raw.lettersSeen),
    words: parseItems(raw.words, raw.wordsSeen),
    recent: parseRecent(raw.recent),
    prefs: parsePrefs(raw.prefs),
  }
}
