interface Props {
  score: number
  streak: number
  totalAnswered: number
}

export default function ScoreDisplay({ score, streak, totalAnswered }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 mb-6 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-hangul-muted">Score</span>
        <span className="font-bold text-hangul-text text-lg">
          {score}/{totalAnswered}
        </span>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-1 animate-pop">
          <span className="text-hangul-streak text-lg">
            {streak >= 5 ? '🔥' : '⚡'}
          </span>
          <span className="font-bold text-hangul-streak text-lg">
            {streak}
          </span>
          <span className="text-hangul-muted">streak</span>
        </div>
      )}
    </div>
  )
}
