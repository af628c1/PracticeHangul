import { createContext, useContext } from 'react'
import type { AccountUser } from '../types'

export type AuthStatus = 'signed-in' | 'signed-out' | 'unavailable'

export interface AuthContextValue {
  user: AccountUser | null
  /** 'unavailable' until Firebase is configured */
  status: AuthStatus
  openSignIn: () => void
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  createAccount: (name: string, email: string, password: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
