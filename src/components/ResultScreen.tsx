interface Props {
  score: number
  total: number
  bestStreak: number
  onRestart: () => void
  onHome: () => void
}

export default function ResultScreen({
  score,
  total,
  bestStreak,
  onRestart,
  onHome,
}: Props) {
  const percentage = Math.round((score / total) * 100)
  const getMessage = () => {
    if (percentage === 100) return { text: 'Perfect!', emoji: '🎉' }
    if (percentage >= 80) return { text: 'Great job!', emoji: '🌟' }
    if (percentage >= 60) return { text: 'Nice work!', emoji: '👍' }
    if (percentage >= 40) return { text: 'Keep going!', emoji: '💪' }
    return { text: 'Keep practicing!', emoji: '📚' }
  }

  const message = getMessage()

  return (
    <div className="animate-slide-up text-center">
      <div className="bg-hangul-card rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto">
        <div className="text-6xl mb-4">{message.emoji}</div>
        <h2 className="text-2xl font-bold text-hangul-text mb-2">
          {message.text}
        </h2>
        <div className="text-5xl font-bold text-hangul-accent mb-2">
          {percentage}%
        </div>
        <p className="text-hangul-muted mb-1">
          {score} out of {total} correct
        </p>
        {bestStreak > 1 && (
          <p className="text-hangul-streak text-sm mb-6">
            Best streak: {bestStreak} 🔥
          </p>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-hangul-accent text-white font-medium hover:bg-hangul-accent/90 transition-colors cursor-pointer"
          >
            Play Again
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 text-hangul-text font-medium hover:border-hangul-accent hover:text-hangul-accent transition-colors cursor-pointer"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
