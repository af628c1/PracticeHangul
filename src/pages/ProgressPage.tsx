import { Link, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { ItemStat, SessionRecord } from '../types'
import { allCategories, categoryLabels, letters } from '../data/letters'
import { lessons } from '../data/lessons'
import { words } from '../data/words'
import { useProgress } from '../hooks/useProgress'
import { addDays, dayKey, itemStatus, type ItemStatus } from '../lib/progress'
import TopBar from '../components/TopBar'
import TabBar from '../components/TabBar'

const CALENDAR_WEEKS = 16

export default function ProgressPage() {
  const navigate = useNavigate()
  const { progress, summary } = useProgress()

  const activeDays = Object.keys(progress.activity).length
  const lessonsDone = lessons.filter((l) => l.id in progress.lessons).length
  const streakNote =
    summary.dayStreak > 0 && !summary.practicedToday
      ? 'practice today to keep it!'
      : `longest: ${summary.longestDayStreak} ${summary.longestDayStreak === 1 ? 'day' : 'days'}`

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <TopBar title="Progress" onBack={() => navigate('/')} />

      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 flex flex-col gap-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            value={summary.dayStreak > 0 ? `🔥${summary.dayStreak}` : '0'}
            label="day streak"
            note={streakNote}
          />
          <StatCard
            value={summary.accuracy === null ? '—' : `${summary.accuracy}%`}
            label="accuracy"
            note={`${progress.correct} of ${progress.answered} correct`}
          />
          <StatCard
            value={progress.sessions.toString()}
            label="sessions"
            note="rounds finished"
          />
          <StatCard
            value={progress.bestStreak.toString()}
            label="best streak"
            note="right in a row"
          />
        </div>

        <Section
          title="Activity"
          aside={`${activeDays} ${activeDays === 1 ? 'day' : 'days'} practiced`}
        >
          <ActivityCalendar activity={progress.activity} />
        </Section>

        <Section title="Lessons" aside={`${lessonsDone} of ${lessons.length} done`}>
          <div className="flex flex-wrap gap-2">
            {lessons.map((lesson, i) => {
              const done = lesson.id in progress.lessons
              return (
                <Link
                  key={lesson.id}
                  to={`/learn/${lesson.id}`}
                  title={lesson.title}
                  className={`w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center font-hand font-bold text-xl no-underline transition-transform hover:scale-110 ${
                    done ? 'bg-ink text-paper' : 'bg-paper text-ink'
                  }`}
                >
                  {i + 1}
                </Link>
              )
            })}
          </div>
        </Section>

        <Section
          title="Letters"
          aside={`${summary.lettersMastered} of ${letters.length} mastered`}
        >
          <div className="flex flex-col gap-4">
            {allCategories.map((category) => (
              <div key={category}>
                <div className="font-hand text-lg text-muted mb-2">
                  {categoryLabels[category]}
                </div>
                <div className="flex flex-wrap gap-2">
                  {letters
                    .filter((l) => l.category === category)
                    .map((l) => (
                      <ItemTile
                        key={l.hangul}
                        label={l.hangul}
                        meaning={l.romanization}
                        stat={progress.letters[l.hangul]}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Words"
          aside={`${summary.wordsMastered} of ${words.length} mastered`}
        >
          <div className="flex flex-wrap gap-2">
            {words.map((w) => (
              <ItemTile
                key={w.hangul}
                label={w.hangul}
                meaning={w.english}
                stat={progress.words[w.hangul]}
                wide
              />
            ))}
          </div>
          <Legend />
        </Section>

        <Section title="Recent sessions">
          {progress.recent.length > 0 ? (
            <ul className="border-2 border-ink rounded-lg bg-paper divide-y divide-line">
              {progress.recent.slice(0, 8).map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </ul>
          ) : (
            <p className="font-hand text-lg text-muted">
              Finish a practice round and it'll show up here.
            </p>
          )}
        </Section>
      </div>

      <TabBar />
    </div>
  )
}

function Section({
  title,
  aside,
  children,
}: {
  title: string
  aside?: string
  children: ReactNode
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <h2 className="font-hand font-bold text-2xl text-ink">{title}</h2>
        {aside && <span className="font-hand text-lg text-muted">{aside}</span>}
      </div>
      {children}
    </section>
  )
}

function StatCard({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="bg-paper border-2 border-ink rounded-lg px-4 py-3">
      <div className="font-hand font-bold text-4xl text-ink leading-tight">{value}</div>
      <div className="font-hand font-bold text-lg text-ink">{label}</div>
      <div className="font-hand text-base text-muted leading-snug">{note}</div>
    </div>
  )
}

function activityLevel(count: number): string {
  if (count === 0) return 'bg-line'
  if (count < 10) return 'bg-k-red/30'
  if (count < 30) return 'bg-k-red/60'
  return 'bg-k-red'
}

function ActivityCalendar({ activity }: { activity: Record<string, number> }) {
  const today = new Date()
  const todayKey = dayKey(today)
  // Columns are weeks (Sunday first), ending with the current week
  const start = addDays(today, -(CALENDAR_WEEKS - 1) * 7 - today.getDay())
  const days = Array.from({ length: CALENDAR_WEEKS * 7 }, (_, i) => addDays(start, i))

  return (
    <div className="max-w-md">
      <div className="grid grid-flow-col grid-rows-7 grid-cols-16 gap-1">
        {days.map((day) => {
          const key = dayKey(day)
          const count = activity[key] ?? 0
          if (day > today) return <div key={key} />
          return (
            <div
              key={key}
              title={`${day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${count} ${count === 1 ? 'answer' : 'answers'}`}
              className={`aspect-square rounded-[3px] ${activityLevel(count)} ${
                key === todayKey ? 'outline-2 outline-offset-1 outline-ink' : ''
              }`}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-end gap-1 mt-2 font-hand text-base text-muted">
        less
        {[0, 1, 10, 30].map((n) => (
          <span key={n} className={`w-3 h-3 rounded-[3px] ${activityLevel(n)}`} />
        ))}
        more
      </div>
    </div>
  )
}

const tileStyles: Record<ItemStatus, string> = {
  new: 'border-dashed border-gray-300 text-muted-soft',
  learning: 'border-ink bg-paper text-ink',
  tricky: 'border-k-red bg-k-red-soft text-k-red',
  mastered: 'border-ink bg-ink text-paper',
}

function ItemTile({
  label,
  meaning,
  stat,
  wide,
}: {
  label: string
  meaning: string
  stat: ItemStat | undefined
  wide?: boolean
}) {
  const status = itemStatus(stat)
  const detail = stat?.seen ? `${stat.correct}/${stat.seen} correct` : 'not practiced yet'
  return (
    <div
      lang="ko"
      title={`${label} (${meaning}): ${detail}`}
      className={`h-10 flex items-center justify-center rounded-md border-2 font-bold ${
        wide ? 'px-2.5 text-lg' : 'w-10 text-xl'
      } ${tileStyles[status]}`}
    >
      {label}
    </div>
  )
}

function Legend() {
  const items: { status: ItemStatus; label: string }[] = [
    { status: 'new', label: 'new' },
    { status: 'learning', label: 'learning' },
    { status: 'tricky', label: 'tricky' },
    { status: 'mastered', label: 'mastered' },
  ]
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 font-hand text-base text-muted">
      {items.map((item) => (
        <span key={item.status} className="flex items-center gap-1.5">
          <span className={`w-3.5 h-3.5 rounded-[3px] border-2 ${tileStyles[item.status]}`} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function SessionRow({ session }: { session: SessionRecord }) {
  const percent = session.total > 0 ? Math.round((session.score / session.total) * 100) : 0
  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3 font-hand">
      <div>
        <div className="font-bold text-lg text-ink">
          {sessionTitle(session)}
        </div>
        <div className="text-base text-muted">{formatWhen(session.at)}</div>
      </div>
      <div className="shrink-0 text-right whitespace-nowrap">
        <div className="font-bold text-xl text-ink">
          {session.score}/{session.total}
          <span className="text-muted font-normal text-lg"> · {percent}%</span>
        </div>
        {session.bestStreak > 1 && (
          <div className="text-base text-k-red">🔥 {session.bestStreak} in a row</div>
        )}
      </div>
    </li>
  )
}

function sessionTitle(session: SessionRecord): string {
  if (session.mode === 'letters') return 'Letter Practice'
  if (session.mode === 'words') return 'Word Practice'
  const index = lessons.findIndex((l) => l.id === session.lesson)
  return index === -1 ? 'Lesson' : `Lesson ${index + 1}: ${lessons[index].title}`
}

function formatWhen(timestamp: number): string {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const key = dayKey(date)
  if (key === dayKey()) return `Today, ${time}`
  if (key === dayKey(addDays(new Date(), -1))) return `Yesterday, ${time}`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
