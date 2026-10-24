import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'
import type { SyncStatus } from '../lib/progressStore'
import type { AccountUser } from '../types'

type Variant = 'light' | 'dark'

/** Sign-in button, or the signed-in learner's avatar and menu. */
export default function AccountButton({ variant = 'light' }: { variant?: Variant }) {
  const { user, openSignIn } = useAuth()

  if (!user) {
    return (
      <button
        onClick={openSignIn}
        className={`rounded-lg border-2 font-hand font-bold text-lg leading-none transition-all cursor-pointer ${
          variant === 'dark'
            ? 'px-4 py-2 border-paper text-paper hover:bg-paper hover:text-ink'
            : 'px-3 py-1.5 border-ink text-ink hover:bg-ink hover:text-paper'
        }`}
      >
        Sign in
      </button>
    )
  }

  return <AccountMenu key={user.uid} user={user} variant={variant} />
}

const syncLabels: Record<SyncStatus, string> = {
  device: 'Saved on this device',
  syncing: 'Saving…',
  synced: '✓ Progress saved',
  offline: 'Offline. Will sync when back online',
  error: "Couldn't sync. Saved on this device",
}

function AccountMenu({ user, variant }: { user: AccountUser; variant: Variant }) {
  const { signOut } = useAuth()
  const { summary, sync } = useProgress()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        aria-expanded={open}
        aria-controls={panelId}
        className={`block rounded-full border-2 transition-transform hover:scale-105 cursor-pointer ${
          variant === 'dark' ? 'w-10 h-10 border-paper' : 'w-9 h-9 border-ink'
        }`}
      >
        <Avatar user={user} />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full mt-2 w-64 z-50 bg-paper text-ink text-left border-2 border-ink rounded-lg shadow-[4px_4px_0_#1a1a1a] animate-fade-in overflow-hidden"
        >
          <div className="px-4 pt-3 pb-2.5 border-b border-line">
            <div className="font-hand font-bold text-xl truncate">
              {user.name || 'Hangul learner'}
            </div>
            {user.email && <div className="text-sm text-muted truncate">{user.email}</div>}
          </div>

          <div className="px-4 py-2.5 border-b border-line font-hand">
            <div className="text-lg">
              <span className="font-bold">
                {summary.dayStreak > 0 ? `🔥 ${summary.dayStreak}` : '0'}
              </span>{' '}
              day streak
            </div>
            <div
              className={`text-base ${sync === 'error' ? 'text-incorrect' : 'text-muted'}`}
            >
              {syncLabels[sync]}
            </div>
          </div>

          <Link
            to="/progress"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 font-hand text-lg no-underline text-ink hover:bg-paper-warm transition-colors"
          >
            Your progress →
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full text-left px-4 py-2.5 border-t border-line font-hand text-lg text-ink hover:bg-paper-warm transition-colors cursor-pointer disabled:text-muted"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}

function Avatar({ user }: { user: AccountUser }) {
  const [broken, setBroken] = useState(false)

  if (user.photoURL && !broken) {
    return (
      <img
        src={user.photoURL}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className="w-full h-full rounded-full object-cover"
      />
    )
  }

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase()
  return (
    <span className="w-full h-full rounded-full bg-k-blue text-paper flex items-center justify-center font-hand font-bold text-xl leading-none">
      {initial}
    </span>
  )
}
