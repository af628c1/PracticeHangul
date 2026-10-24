import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from '../hooks/useAuth'
import { firebaseConfig } from '../lib/firebaseConfig'
import { progressStore } from '../lib/progressStore'
import { track } from '../lib/track'
import { storeAccount, storedAccount } from '../lib/storage'
import LoginDialog from './LoginDialog'

let firebaseModule: Promise<typeof import('../lib/firebase')> | null = null

function loadFirebase() {
  if (!firebaseModule) {
    firebaseModule = import('../lib/firebase')
    // Allow a retry if the chunk failed to download
    firebaseModule.catch(() => {
      firebaseModule = null
    })
  }
  return firebaseModule
}

const SIGN_OUT_SAVE_TIMEOUT = 3000

export default function AuthProvider({ children }: { children: ReactNode }) {
  // Start from the last known account so the header doesn't flicker on load
  const [user, setUser] = useState(storedAccount)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!firebaseConfig) return
    let unsubscribe: (() => void) | undefined
    let cancelled = false
    loadFirebase()
      .then((firebase) => {
        if (cancelled) return
        unsubscribe = firebase.watchUser((next) => {
          storeAccount(next)
          progressStore.setUser(next?.uid ?? null)
          setUser(next)
          if (next) setDialogOpen(false)
        })
      })
      .catch(() => {
        // Offline: keep the remembered account; signing in retries the load
      })
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status: !firebaseConfig ? 'unavailable' : user ? 'signed-in' : 'signed-out',
      openSignIn: () => setDialogOpen(true),
      signInWithGoogle: async () => {
        const firebase = await loadFirebase()
        const isNew = await firebase.signInWithGoogle()
        track(isNew ? 'sign_up' : 'login', { method: 'google' })
      },
      signInWithEmail: async (email, password) => {
        const firebase = await loadFirebase()
        await firebase.signInWithEmail(email, password)
        track('login', { method: 'email' })
      },
      createAccount: async (name, email, password) => {
        const firebase = await loadFirebase()
        const created = await firebase.createAccount(name, email, password)
        track('sign_up', { method: 'email' })
        // Profile updates don't re-fire the auth listener, so pick up the name here
        storeAccount(created)
        setUser(created)
      },
      resetPassword: async (email) => {
        const firebase = await loadFirebase()
        await firebase.resetPassword(email)
      },
      signOut: async () => {
        await Promise.race([
          progressStore.flush(),
          new Promise((resolve) => setTimeout(resolve, SIGN_OUT_SAVE_TIMEOUT)),
        ])
        const firebase = await loadFirebase()
        await firebase.signOut()
      },
    }),
    [user],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </AuthContext.Provider>
  )
}
