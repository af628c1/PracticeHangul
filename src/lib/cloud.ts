// Firestore sync, loaded on demand once someone is signed in.
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import type { Progress } from '../types'
import { app, auth } from './firebase'
import { firebaseEmulators } from './firebaseConfig'

const db = getFirestore(app)
if (firebaseEmulators) connectFirestoreEmulator(db, '127.0.0.1', 8080)

const progressDoc = (uid: string) => doc(db, 'users', uid)

/**
 * Streams the saved progress for `uid` (null until the first save), noting
 * whether each copy came from the local cache rather than the server.
 */
export function watchProgress(
  uid: string,
  onData: (data: unknown, fromCache: boolean) => void,
  onError: (error: Error) => void,
): () => void {
  let unsubscribe: (() => void) | undefined
  let stopped = false
  auth.authStateReady().then(() => {
    // The remembered account may be stale; the auth listener will switch users
    if (stopped || auth.currentUser?.uid !== uid) return
    unsubscribe = onSnapshot(
      progressDoc(uid),
      // Metadata changes report when the server confirms (or can't be reached)
      { includeMetadataChanges: true },
      (snap) => onData(snap.data() ?? null, snap.metadata.fromCache),
      onError,
    )
  }, onError)
  return () => {
    stopped = true
    unsubscribe?.()
  }
}

export function saveProgress(uid: string, progress: Progress): Promise<void> {
  return setDoc(progressDoc(uid), { ...progress, updatedAt: serverTimestamp() })
}
