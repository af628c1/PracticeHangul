import { Link, useNavigate } from 'react-router-dom'
import { lessons } from '../data/lessons'
import { useProgress } from '../hooks/useProgress'
import TopBar from '../components/TopBar'

export default function LearnPage() {
  const navigate = useNavigate()
  const { progress } = useProgress()
  const upNext = lessons.find((l) => !(l.id in progress.lessons))

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <TopBar title="Learn" onBack={() => navigate('/')} />

      <div className="flex-1 max-w-xl w-full mx-auto px-6 py-8 flex flex-col gap-3">
        <p className="font-hand text-xl text-muted leading-snug mb-3">
          Hangul was designed to be learned in a day. Each lesson teaches a few letters with a
          memory trick, then quizzes you until they stick.
        </p>

        {lessons.map((lesson, i) => {
          const best = progress.lessons[lesson.id]
          const done = best !== undefined
          const next = lesson === upNext
          return (
            <Link
              key={lesson.id}
              to={`/learn/${lesson.id}`}
              className={`flex items-center gap-4 no-underline border-2 border-ink rounded-lg bg-paper px-4 py-3 transition-all hover:-translate-y-0.5 ${
                next
                  ? 'shadow-[4px_4px_0_#cd2e3a] hover:shadow-[5px_5px_0_#cd2e3a]'
                  : 'hover:shadow-[3px_3px_0_#1a1a1a]'
              }`}
            >
              <div
                className={`shrink-0 w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center font-hand font-bold text-xl ${
                  done ? 'bg-ink text-paper' : 'text-ink'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-hand font-bold text-xl text-ink">{lesson.title}</div>
                <div lang="ko" className="text-lg text-muted tracking-[0.2em]">
                  {lesson.letters.join(' ')}
                </div>
              </div>
              {next && <div className="font-hand font-bold text-lg text-k-red">up next</div>}
              {done && <div className="font-hand text-lg text-muted">{best}%</div>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
