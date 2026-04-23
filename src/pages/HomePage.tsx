import { Link } from 'react-router-dom'
import { useStats } from '../hooks/useStats'

export default function HomePage() {
  const { lettersSeen, wordsSeen, bestStreak } = useStats()

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* Hero */}
      <div className="bg-ink text-paper py-16 sm:py-24 px-6 flex flex-col items-center justify-center gap-2">
        <h1
          lang="ko"
          className="font-hand font-bold text-8xl sm:text-9xl leading-none"
        >
          한글
        </h1>
        <p className="font-hand text-xl sm:text-2xl text-white/50 tracking-[0.3em] mt-2">
          HANGUL PRACTICE
        </p>
      </div>

      {/* Stats strip */}
      <div className="flex border-b-2 border-line bg-paper">
        <Stat value={lettersSeen.toString()} label="letters" />
        <Stat value={wordsSeen.toString()} label="words" separator />
        <Stat
          value={bestStreak > 0 ? `🔥${bestStreak}` : '—'}
          label="best streak"
          separator
        />
      </div>

      {/* Mode cards */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto px-6 py-10 gap-4">
        <ModeCard
          to="/letters"
          title="Letter Practice"
          description="Select the correct 글자"
          hangul="가"
        />
        <ModeCard
          to="/words"
          title="Word Practice"
          description="Type the romanization"
          hangul="단어"
        />
      </div>

      {/* Footer / tab-bar style */}
      <div className="flex border-t border-line bg-paper">
        <TabItem icon="◉" label="Practice" active />
        <TabItem icon="◎" label="Progress" />
        <TabItem icon="○" label="About" />
      </div>
    </div>
  )
}

function Stat({
  value,
  label,
  separator,
}: {
  value: string
  label: string
  separator?: boolean
}) {
  return (
    <div
      className={`flex-1 py-4 text-center ${separator ? 'border-l-2 border-line' : ''}`}
    >
      <div className="font-hand font-bold text-3xl text-ink">{value}</div>
      <div className="font-hand text-sm text-muted">{label}</div>
    </div>
  )
}

function ModeCard({
  to,
  title,
  description,
  hangul,
}: {
  to: string
  title: string
  description: string
  hangul: string
}) {
  return (
    <Link
      to={to}
      className="group block no-underline border-2 border-ink rounded-lg bg-paper px-6 py-5 flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#1a1a1a]"
    >
      <div>
        <div className="font-hand font-bold text-2xl text-ink">{title}</div>
        <div className="font-hand text-lg text-muted">{description}</div>
      </div>
      <div
        lang="ko"
        className="font-bold text-5xl text-ink leading-none group-hover:scale-110 transition-transform"
      >
        {hangul}
      </div>
    </Link>
  )
}

function TabItem({
  icon,
  label,
  active,
}: {
  icon: string
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`flex-1 py-3 text-center font-hand ${
        active ? 'text-ink font-bold' : 'text-muted-soft'
      }`}
    >
      <div className="text-lg">{icon}</div>
      <div className="text-sm">{label}</div>
    </div>
  )
}
