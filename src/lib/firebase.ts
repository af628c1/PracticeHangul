// Loaded on demand (dynamic import) so Firebase stays out of the main bundle.
import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import type { AccountUser } from '../types'
import { firebaseConfig, firebaseEmulators } from './firebaseConfig'

if (!firebaseConfig) throw new Error('Firebase is not configured')

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
if (firebaseEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
}

function toAccountUser(user: User): AccountUser {
  return {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
}

export function watchUser(callback: (user: AccountUser | null) => void) {
  return onAuthStateChanged(auth, (user) => callback(user && toAccountUser(user)))
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  await signInWithPopup(auth, provider)
}

export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function createAccount(
  name: string,
  email: string,
  password: string,
): Promise<AccountUser> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  if (name) await updateProfile(user, { displayName: name })
  return toAccountUser(user)
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email)
}

export function signOut() {
  return firebaseSignOut(auth)
}
