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
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const getMessage = () => {
    if (percentage === 100) return { text: 'Perfect!', emoji: '🎉' }
    if (percentage >= 80) return { text: 'Great job!', emoji: '🌟' }
    if (percentage >= 60) return { text: 'Nice work!', emoji: '👍' }
    if (percentage >= 40) return { text: 'Keep going!', emoji: '💪' }
    return { text: 'Keep practicing!', emoji: '📚' }
  }

  const message = getMessage()

  return (
    <div className="animate-slide-up text-center max-w-md mx-auto">
      <div className="bg-paper rounded-lg border-2 border-ink p-8 shadow-[4px_4px_0_#1a1a1a]">
        <div className="text-6xl mb-4">{message.emoji}</div>
        <h2 className="font-hand font-bold text-3xl text-ink mb-2">
          {message.text}
        </h2>
        <div className="font-hand font-bold text-6xl text-k-red mb-2">
          {percentage}%
        </div>
        <p className="font-hand text-xl text-muted mb-1">
          {score} out of {total} correct
        </p>
        {bestStreak > 1 && (
          <p className="font-hand text-lg text-k-red mb-2">
            🔥 best streak: {bestStreak}
          </p>
        )}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onRestart}
            className="flex-1 py-3 rounded-lg bg-ink text-paper font-hand font-bold text-xl border-2 border-ink hover:bg-ink-soft transition-colors cursor-pointer"
          >
            Play Again
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 rounded-lg bg-paper text-ink font-hand font-bold text-xl border-2 border-ink hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
