import { Link } from 'react-router-dom'

const modes = [
  {
    title: 'Letter Practice',
    description: 'See a Hangul letter and pick the correct romanization from 4 choices.',
    path: '/letters',
    emoji: 'ㄱ',
    color: 'bg-hangul-accent',
  },
  {
    title: 'Word Practice',
    description: 'Read a Hangul word and type its romanization to practice syllable blocks.',
    path: '/words',
    emoji: '한',
    color: 'bg-hangul-fun',
  },
]

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-hangul-text mb-3">
          Practice Hangul
        </h1>
        <p className="text-hangul-muted text-lg">
          Sharpen your Korean letter recognition skills
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {modes.map((mode) => (
          <Link
            key={mode.path}
            to={mode.path}
            className="group block no-underline"
          >
            <div className="bg-hangul-card rounded-2xl shadow-md border border-gray-100 p-6 transition-all hover:shadow-lg hover:-translate-y-1">
              <div
                className={`w-16 h-16 ${mode.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4 group-hover:scale-110 transition-transform`}
              >
                {mode.emoji}
              </div>
              <h2 className="text-xl font-semibold text-hangul-text mb-2">
                {mode.title}
              </h2>
              <p className="text-hangul-muted text-sm leading-relaxed">
                {mode.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
