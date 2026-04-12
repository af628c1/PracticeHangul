interface Props {
  label: string
  state: 'default' | 'correct' | 'incorrect' | 'disabled'
  onClick: () => void
}

export default function ChoiceButton({ label, state, onClick }: Props) {
  const base =
    'w-full py-4 px-6 rounded-xl text-lg font-medium border-2 transition-all cursor-pointer'

  const variants: Record<string, string> = {
    default:
      'border-gray-200 bg-hangul-card text-hangul-text hover:border-hangul-accent hover:bg-hangul-accent-light active:scale-[0.98]',
    correct:
      'border-hangul-correct bg-hangul-correct-light text-hangul-correct animate-pop cursor-default',
    incorrect:
      'border-hangul-incorrect bg-hangul-incorrect-light text-hangul-incorrect animate-shake cursor-default',
    disabled:
      'border-gray-100 bg-gray-50 text-hangul-muted cursor-default',
  }

  return (
    <button
      className={`${base} ${variants[state]}`}
      onClick={state === 'default' ? onClick : undefined}
      disabled={state !== 'default'}
    >
      {label}
    </button>
  )
}
