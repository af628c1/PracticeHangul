import type { PracticeMode, PracticePrefs, Progress } from '../types'
import {
  addProgress,
  hasProgress,
  joinProgress,
  parseProgress,
  sameProgress,
  withAnswer,
  withBestStreak,
  withLesson,
  withPrefs,
  withSession,
} from './progress'
import { progressKey, readJSON, removeKey, storedAccount, writeJSON } from './storage'
import { track } from './track'

/**
 * - device: guest, saved in this browser only
 * - syncing: signed in, waiting on the cloud
 * - synced: everything is saved to the account
 * - offline: no connection; progress is kept on this device and synced later
 * - error: the cloud refused the data (e.g. Firestore isn't set up)
 */
export type SyncStatus = 'device' | 'syncing' | 'synced' | 'offline' | 'error'

export interface ProgressSnapshot {
  progress: Progress
  sync: SyncStatus
}

type Cloud = typeof import('./cloud')

const SAVE_DELAY = 1500

const load = (uid: string | null) => parseProgress(readJSON(progressKey(uid)))

/**
 * Holds the learner's progress. Guests are saved to localStorage; signed-in
 * learners also get a local cache that is reconciled with their Firestore
 * document, so practice keeps working offline and across devices.
 */
class ProgressStore {
  private uid: string | null = null
  private account: Progress = load(null)
  /** Guest practice shown on top of the account until it has been merged in */
  private guest: Progress | null = null
  private sync: SyncStatus = 'device'
  private snapshot: ProgressSnapshot = { progress: this.account, sync: this.sync }
  private listeners = new Set<() => void>()

  private generation = 0
  private cloud: Cloud | null = null
  private remoteLoaded = false
  private offline = false
  private stopWatching: (() => void) | null = null
  private saveTimer: ReturnType<typeof setTimeout> | null = null
  private saving: Promise<void> | null = null

  constructor() {
    this.switchTo(storedAccount()?.uid ?? null)
    window.addEventListener('storage', this.onStorage)
    // Don't leave changes waiting if the tab is closed or put in the background
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') void this.flush()
    })
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = () => this.snapshot

  setUser = (uid: string | null) => {
    if (uid !== this.uid) this.switchTo(uid)
  }

  recordAnswer = (mode: PracticeMode, item: string, correct: boolean) => {
    this.commit(withAnswer(this.account, mode, item, correct))
  }

  recordStreak = (streak: number) => {
    this.commit(withBestStreak(this.account, streak))
  }

  recordSession = (
    mode: PracticeMode,
    session: { score: number; total: number; bestStreak: number },
  ) => {
    this.commit(withSession(this.account, { mode, ...session }))
    track('practice_complete', { mode, ...session })
  }

  completeLesson = (
    lessonId: string,
    result: { score: number; total: number; bestStreak: number },
  ) => {
    const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 100
    const next = withLesson(this.account, lessonId, percent)
    this.commit(withSession(next, { mode: 'learn', lesson: lessonId, ...result }))
    track('lesson_complete', { lesson: lessonId, percent })
  }

  savePrefs = (prefs: Partial<Omit<PracticePrefs, 'updatedAt'>>) => {
    this.commit(withPrefs(this.account, prefs))
  }

  /** Pushes any pending changes to the cloud (used before signing out). */
  flush = async () => {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
      this.saveTimer = null
      await this.save(this.generation)
    } else if (this.saving) {
      await this.saving.catch(() => {})
    }
  }

  private switchTo(uid: string | null) {
    this.stopCloud()
    this.generation++
    this.uid = uid
    this.remoteLoaded = false
    this.offline = false
    this.account = load(uid)
    if (uid) {
      const guest = load(null)
      this.guest = hasProgress(guest) ? guest : null
      this.sync = 'syncing'
      this.startCloud(uid, this.generation)
    } else {
      this.guest = null
      this.sync = 'device'
    }
    this.publish()
  }

  private commit(next: Progress) {
    if (next === this.account) return
    this.account = next
    writeJSON(progressKey(this.uid), next)
    // Never write before the saved copy has been merged in, or we'd clobber it
    if (this.uid && this.remoteLoaded) this.scheduleSave()
    this.publish()
  }

  private startCloud(uid: string, generation: number) {
    import('./cloud')
      .then((cloud) => {
        if (generation !== this.generation) return
        this.cloud = cloud
        this.stopWatching = cloud.watchProgress(
          uid,
          (data, fromCache) => this.receive(generation, data, fromCache),
          () => this.fail(generation),
        )
      })
      .catch(() => this.fail(generation))
  }

  private receive(generation: number, data: unknown, fromCache: boolean) {
    if (generation !== this.generation || !this.uid) return
    // A cached copy may be stale or empty. Only merge what the server confirms,
    // or the next save could overwrite newer progress from another device.
    const wasOffline = this.offline
    this.offline = fromCache
    if (fromCache) {
      if (!wasOffline) this.publish()
      return
    }
    const remote = parseProgress(data)
    let next = joinProgress(this.account, remote)
    // Practice done while signed out moves into the account, once
    const guest = load(null)
    if (hasProgress(guest)) {
      next = addProgress(next, guest)
      removeKey(progressKey(null))
    }
    this.guest = null
    this.remoteLoaded = true
    if (!sameProgress(next, this.account)) {
      this.account = next
      writeJSON(progressKey(this.uid), next)
    }
    // Upload anything the cloud is missing right away (e.g. just-merged guest practice)
    if (!sameProgress(next, remote)) this.scheduleSave(0)
    else if (!this.saveTimer && !this.saving) this.sync = 'synced'
    this.publish()
  }

  private scheduleSave(delay = SAVE_DELAY) {
    this.sync = 'syncing'
    if (this.saveTimer) return
    const generation = this.generation
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null
      void this.save(generation)
    }, delay)
  }

  private async save(generation: number) {
    if (generation !== this.generation || !this.uid || !this.cloud) return
    const pending = this.cloud.saveProgress(this.uid, this.account)
    this.saving = pending
    try {
      await pending
      if (generation !== this.generation || this.saving !== pending) return
      this.saving = null
      if (!this.saveTimer) this.setSync('synced')
    } catch {
      if (generation !== this.generation || this.saving !== pending) return
      this.saving = null
      this.setSync('error')
    }
  }

  private fail(generation: number) {
    if (generation === this.generation) this.setSync('error')
  }

  private stopCloud() {
    this.stopWatching?.()
    this.stopWatching = null
    if (this.saveTimer) clearTimeout(this.saveTimer)
    this.saveTimer = null
    this.saving = null
  }

  /** Keeps other open tabs in step */
  private onStorage = (event: StorageEvent) => {
    if (event.key !== progressKey(this.uid) || !event.newValue) return
    let other: unknown
    try {
      other = JSON.parse(event.newValue)
    } catch {
      return
    }
    const next = joinProgress(this.account, parseProgress(other))
    if (!sameProgress(next, this.account)) this.commit(next)
  }

  private setSync(sync: SyncStatus) {
    if (sync === this.sync) return
    this.sync = sync
    this.publish()
  }

  private publish() {
    const progress = this.guest ? addProgress(this.account, this.guest) : this.account
    const sync = this.offline && this.sync !== 'error' ? 'offline' : this.sync
    this.snapshot = { progress, sync }
    for (const listener of this.listeners) listener()
  }
}

export const progressStore = new ProgressStore()
