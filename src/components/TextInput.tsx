import { useState, useRef, useEffect } from 'react'

interface Props {
  onSubmit: (value: string) => void
  disabled: boolean
  feedback: 'none' | 'correct' | 'incorrect'
  hint: string | null
}

export default function TextInput({ onSubmit, disabled, feedback, hint }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  // Reset value when feedback changes back to none (new question)
  useEffect(() => {
    if (feedback === 'none') {
      setValue('')
    }
  }, [feedback])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSubmit(value)
    }
  }

  const borderColor = {
    none: 'border-gray-200 focus-within:border-hangul-accent',
    correct: 'border-hangul-correct',
    incorrect: 'border-hangul-incorrect',
  }[feedback]

  const animation = {
    none: '',
    correct: 'animate-pop',
    incorrect: 'animate-shake',
  }[feedback]

  return (
    <div>
      <form onSubmit={handleSubmit} className={`flex gap-2 ${animation}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          placeholder="Type romanization..."
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={`flex-1 py-3 px-4 rounded-xl border-2 text-lg outline-none transition-colors bg-hangul-card text-hangul-text placeholder:text-hangul-muted/50 ${borderColor}`}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="py-3 px-6 rounded-xl bg-hangul-accent text-white font-medium hover:bg-hangul-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Check
        </button>
      </form>
      {hint && (
        <p className="mt-3 text-sm text-hangul-streak animate-fade-in">
          Hint: <span className="font-mono font-bold tracking-wider">{hint}</span>
        </p>
      )}
    </div>
  )
}
