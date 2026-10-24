import type { AccountUser } from '../types'
import { firebaseConfig } from './firebaseConfig'

const PROGRESS_KEY = 'practice-hangul-stats'
const ACCOUNT_KEY = 'practice-hangul-account'

/** Guest progress lives under the original key; each account gets its own cache. */
export function progressKey(uid: string | null): string {
  return uid ? `${PROGRESS_KEY}:${uid}` : PROGRESS_KEY
}

export function readJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore (storage full or blocked)
  }
}

export function removeKey(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

const text = (v: unknown) => (typeof v === 'string' && v ? v : null)

/** Last signed-in account, so the UI can render before Firebase has loaded. */
export function storedAccount(): AccountUser | null {
  if (!firebaseConfig) return null
  const raw = readJSON(ACCOUNT_KEY) as Record<string, unknown> | null
  const uid = text(raw?.uid)
  if (!uid) return null
  return {
    uid,
    name: text(raw?.name),
    email: text(raw?.email),
    photoURL: text(raw?.photoURL),
  }
}

export function storeAccount(user: AccountUser | null) {
  if (user) writeJSON(ACCOUNT_KEY, user)
  else removeKey(ACCOUNT_KEY)
}
