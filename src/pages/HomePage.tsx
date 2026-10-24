import { Link } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { useProgress } from '../hooks/useProgress'
import AccountButton from '../components/AccountButton'
import TabBar from '../components/TabBar'

export default function HomePage() {
  const { progress, summary } = useProgress()
  const lessonsDone = lessons.filter((l) => l.id in progress.lessons).length
  const upNext = lessons.findIndex((l) => !(l.id in progress.lessons))
  const learnDescription =
    lessonsDone === 0
      ? `Start here · ${lessons.length} lessons`
      : upNext === -1
        ? 'All lessons done ✓'
        : `Up next: lesson ${upNext + 1} of ${lessons.length}`

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* Hero */}
      <div className="relative bg-ink text-paper py-16 sm:py-24 px-6 flex flex-col items-center justify-center gap-2">
        <div className="absolute top-4 right-4">
          <AccountButton variant="dark" />
        </div>
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
        <Stat
          value={summary.dayStreak > 0 ? summary.dayStreak.toString() : '—'}
          label="day streak"
        />
        <Stat value={summary.lettersPracticed.toString()} label="letters" separator />
        <Stat value={summary.wordsPracticed.toString()} label="words" separator />
        <Stat
          value={progress.bestStreak > 0 ? `🔥${progress.bestStreak}` : '—'}
          label="best streak"
          separator
        />
      </div>

      {/* Mode cards */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl w-full mx-auto px-6 py-10 gap-4">
        <ModeCard
          to="/learn"
          title="Learn Hangul"
          description={learnDescription}
          hangul="배움"
        />
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

      <TabBar />
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
      className="group block no-underline border-2 border-ink rounded-lg bg-paper px-6 py-5 flex items-center justify-between gap-4 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_#1a1a1a]"
    >
      <div>
        <div className="font-hand font-bold text-2xl text-ink">{title}</div>
        <div className="font-hand text-lg text-muted">{description}</div>
      </div>
      <div
        lang="ko"
        className="shrink-0 whitespace-nowrap font-bold text-5xl text-ink leading-none group-hover:scale-110 transition-transform"
      >
        {hangul}
      </div>
    </Link>
  )
}
