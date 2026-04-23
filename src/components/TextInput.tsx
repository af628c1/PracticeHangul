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
    none: 'border-gray-300 focus-within:border-ink',
    correct: 'border-correct',
    incorrect: 'border-incorrect',
  }[feedback]

  const animation = {
    none: '',
    correct: 'animate-pop',
    incorrect: 'animate-shake',
  }[feedback]

  return (
    <div>
      <form onSubmit={handleSubmit} className={animation}>
        <div
          className={`border-2 rounded-lg bg-paper transition-colors ${borderColor}`}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            placeholder="type romanization..."
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full py-3 px-4 text-xl outline-none bg-transparent font-hand placeholder:text-muted-soft"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="w-full mt-3 py-3 rounded-lg bg-ink text-paper font-hand font-bold text-xl border-2 border-ink hover:bg-ink-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Check Answer
        </button>
      </form>
      {hint && (
        <p className="mt-3 text-center font-hand text-lg text-k-red animate-fade-in">
          Hint:{' '}
          <span className="font-mono tracking-widest font-bold">{hint}</span>
        </p>
      )}
    </div>
  )
}
