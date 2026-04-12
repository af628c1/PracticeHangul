interface Props {
  character: string
  subtitle?: string
}

export default function HangulDisplay({ character, subtitle }: Props) {
  return (
    <div className="bg-hangul-card rounded-2xl shadow-md border border-gray-100 p-8 mb-6 animate-fade-in">
      <div
        lang="ko"
        className="text-[6rem] sm:text-[8rem] leading-none font-bold text-hangul-text select-none"
      >
        {character}
      </div>
      {subtitle && (
        <p className="mt-3 text-hangul-muted text-lg">{subtitle}</p>
      )}
    </div>
  )
}
