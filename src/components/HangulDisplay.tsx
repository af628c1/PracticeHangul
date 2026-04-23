interface Props {
  character: string
  subtitle?: string
  size?: 'md' | 'lg' | 'xl'
}

export default function HangulDisplay({ character, subtitle, size = 'xl' }: Props) {
  const sizeClass = {
    md: 'text-6xl sm:text-7xl',
    lg: 'text-7xl sm:text-8xl',
    xl: 'text-8xl sm:text-9xl',
  }[size]

  return (
    <div className="text-center animate-fade-in">
      <div
        lang="ko"
        className={`${sizeClass} font-bold text-ink leading-none select-none tracking-tight`}
      >
        {character}
      </div>
      {subtitle && (
        <p className="font-hand text-xl text-muted mt-4">= {subtitle}</p>
      )}
    </div>
  )
}
