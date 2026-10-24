import { useMemo, useSyncExternalStore } from 'react'
import { summarize } from '../lib/progress'
import { progressStore } from '../lib/progressStore'

export function useProgress() {
  const { progress, sync } = useSyncExternalStore(
    progressStore.subscribe,
    progressStore.getSnapshot,
  )
  const summary = useMemo(() => summarize(progress), [progress])

  return {
    progress,
    summary,
    sync,
    recordAnswer: progressStore.recordAnswer,
    recordStreak: progressStore.recordStreak,
    recordSession: progressStore.recordSession,
    savePrefs: progressStore.savePrefs,
  }
}
