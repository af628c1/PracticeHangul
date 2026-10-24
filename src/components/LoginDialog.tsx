import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

interface Props {
  open: boolean
  onClose: () => void
}

export default function LoginDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pressedBackdrop = useRef(false)

  // Layout effect so the dialog never paints open with stale content
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="login-title"
      onClose={onClose}
      // Close on a backdrop click, but not when a drag that began inside ends outside
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (pressedBackdrop.current && e.target === e.currentTarget) onClose()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm p-0 bg-paper text-ink border-2 border-ink rounded-lg shadow-[6px_6px_0_#1a1a1a] open:animate-slide-up backdrop:bg-ink/50"
    >
      {open && <LoginForm onDone={onClose} />}
    </dialog>
  )
}

type Mode = 'signin' | 'signup' | 'reset'

const copy: Record<Mode, { korean: string; title: string; submit: string; busy: string }> = {
  signin: {
    korean: '안녕하세요',
    title: 'Sign in to save your streak & progress',
    submit: 'Sign in',
    busy: 'Signing in…',
  },
  signup: {
    korean: '환영합니다',
    title: 'Create an account to save your progress',
    submit: 'Create account',
    busy: 'Creating account…',
  },
  reset: {
    korean: '비밀번호',
    title: "We'll email you a link to reset it",
    submit: 'Send reset link',
    busy: 'Sending…',
  },
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const { status, signInWithGoogle, signInWithEmail, createAccount, resetPassword } =
    useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState<'google' | 'email' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const unavailable = status === 'unavailable'
  const disabled = unavailable || busy !== null
  const text = copy[mode]

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  const run = async (kind: 'google' | 'email', action: () => Promise<void>) => {
    setBusy(kind)
    setError(null)
    setNotice(null)
    try {
      await action()
      if (mode === 'reset' && kind === 'email') {
        setNotice('Check your inbox for a link to reset your password.')
      } else {
        onDone()
      }
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return setError('Enter your email.')
    if (mode === 'reset') {
      return run('email', () => resetPassword(trimmedEmail))
    }
    if (!password) return setError('Enter your password.')
    run('email', () =>
      mode === 'signup'
        ? createAccount(name.trim(), trimmedEmail, password)
        : signInWithEmail(trimmedEmail, password),
    )
  }

  return (
    <div className="relative px-6 pt-8 pb-6 sm:px-8">
      <div className="text-center mb-6">
        <div lang="ko" className="text-5xl font-bold text-ink leading-none">
          {text.korean}
        </div>
        <h2 id="login-title" className="font-hand text-xl text-muted mt-3 leading-snug">
          {text.title}
        </h2>
      </div>

      {mode !== 'reset' && (
        <>
          <button
            type="button"
            onClick={() => run('google', signInWithGoogle)}
            disabled={disabled}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-paper border-2 border-ink font-hand font-bold text-xl text-ink transition-all cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:shadow-[3px_3px_0_#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleLogo />
            {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 my-4 font-hand text-lg text-muted-soft">
            <span className="flex-1 border-t border-line" />
            or
            <span className="flex-1 border-t border-line" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        {mode === 'signup' && (
          <Field
            value={name}
            onChange={setName}
            placeholder="name (optional)"
            autoComplete="name"
            disabled={disabled}
          />
        )}
        <Field
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="email"
          autoComplete="email"
          disabled={disabled}
        />
        {mode !== 'reset' && (
          <Field
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={mode === 'signup' ? 'password (6+ characters)' : 'password'}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            disabled={disabled}
          />
        )}

        {mode === 'signin' && (
          <button
            type="button"
            onClick={() => switchMode('reset')}
            className="self-end -mt-1 font-hand text-base text-muted hover:text-ink transition-colors cursor-pointer"
          >
            forgot password?
          </button>
        )}

        {error && (
          <p role="alert" className="font-hand text-lg text-incorrect text-center leading-snug">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="font-hand text-lg text-correct text-center leading-snug">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="mt-1 py-3 rounded-lg bg-ink text-paper font-hand font-bold text-xl border-2 border-ink transition-colors cursor-pointer enabled:hover:bg-ink-soft disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy === 'email' ? text.busy : text.submit}
        </button>
      </form>

      {unavailable ? (
        <p className="mt-5 font-hand text-lg text-muted text-center leading-snug">
          Accounts aren't switched on yet. Your progress is saved on this device for now.
        </p>
      ) : (
        <p className="mt-5 font-hand text-lg text-muted text-center">
          {mode === 'signin' && (
            <>
              New here? <ModeLink onClick={() => switchMode('signup')}>Create an account</ModeLink>
            </>
          )}
          {mode === 'signup' && (
            <>
              Have an account? <ModeLink onClick={() => switchMode('signin')}>Sign in</ModeLink>
            </>
          )}
          {mode === 'reset' && (
            <ModeLink onClick={() => switchMode('signin')}>← Back to sign in</ModeLink>
          )}
        </p>
      )}

      <button
        type="button"
        onClick={onDone}
        aria-label="Close"
        className="absolute top-3 right-4 font-hand text-xl text-muted-soft hover:text-ink transition-colors cursor-pointer"
      >
        ✕
      </button>
    </div>
  )
}

function Field({
  value,
  onChange,
  type = 'text',
  ...rest
}: {
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder: string
  autoComplete: string
  disabled: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={rest.placeholder}
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      className="w-full py-2.5 px-4 text-xl font-hand bg-paper text-ink border-2 border-gray-300 rounded-lg outline-none transition-colors focus:border-ink placeholder:text-muted-soft disabled:opacity-50"
      {...rest}
    />
  )
}

function ModeLink({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-bold text-ink underline decoration-2 underline-offset-4 decoration-k-red hover:text-k-red transition-colors cursor-pointer"
    >
      {children}
    </button>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

function authErrorMessage(error: unknown): string | null {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String(error.code)
      : ''
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google window. Allow pop-ups and try again.'
    case 'auth/invalid-email':
      return "That email doesn't look right."
    case 'auth/missing-password':
      return 'Enter your password.'
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.'
    case 'auth/email-already-in-use':
      return 'There’s already an account with that email. Try signing in.'
    case 'auth/weak-password':
      return 'Use at least 6 characters for your password.'
    case 'auth/account-exists-with-different-credential':
      return 'That email already uses a different sign-in method.'
    case 'auth/too-many-requests':
      return 'Too many tries. Wait a minute and try again.'
    case 'auth/network-request-failed':
      return "Can't reach the server. Check your connection."
    case 'auth/unauthorized-domain':
    case 'auth/operation-not-allowed':
      return "This sign-in method isn't turned on yet."
    default:
      return 'Something went wrong. Please try again.'
  }
}
