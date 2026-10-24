import { firebaseConfig, firebaseEmulators } from './firebaseConfig'

let module: Promise<typeof import('./analytics') | null> | null = null

/**
 * Sends an event to Google Analytics (Firebase console → Analytics). Never
 * throws, and does nothing in emulator mode.
 */
export function track(name: string, params?: Record<string, string | number>) {
  if (firebaseEmulators || !firebaseConfig.measurementId) return
  module ??= import('./analytics').catch(() => null)
  void module.then((analytics) => analytics?.log(name, params))
}
