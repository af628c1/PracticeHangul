interface Props {
  label: string
  state: 'default' | 'correct' | 'incorrect' | 'disabled'
  onClick: () => void
  size?: 'md' | 'lg'
}

export default function ChoiceButton({ label, state, onClick, size = 'lg' }: Props) {
  const base =
    'w-full rounded-lg text-center font-bold transition-all cursor-pointer border-2 bg-paper'

  const sizeClass = size === 'lg' ? 'py-6 text-3xl sm:text-4xl' : 'py-4 text-xl'

  const variants: Record<string, string> = {
    default:
      'border-gray-300 text-ink hover:border-ink hover:-translate-y-0.5 active:scale-[0.98] shadow-sm',
    correct:
      'border-correct bg-correct-soft text-correct animate-pop cursor-default',
    incorrect:
      'border-incorrect bg-incorrect-soft text-incorrect animate-shake cursor-default',
    disabled: 'border-gray-200 bg-gray-50 text-muted-soft cursor-default',
  }

  return (
    <button
      className={`${base} ${sizeClass} ${variants[state]}`}
      onClick={state === 'default' ? onClick : undefined}
      disabled={state !== 'default'}
      lang="ko"
    >
      {label}
    </button>
  )
}
