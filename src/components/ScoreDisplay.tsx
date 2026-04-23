interface Props {
  score: number
  streak: number
  totalAnswered: number
}

export default function ScoreDisplay({ score, streak, totalAnswered }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 font-hand text-lg">
      <div className="flex items-center gap-2">
        <span className="text-muted">Score</span>
        <span className="font-bold text-ink">
          {score}/{totalAnswered}
        </span>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-1 animate-pop">
          <span>{streak >= 5 ? '🔥' : '⚡'}</span>
          <span className="font-bold text-k-red">{streak}</span>
          <span className="text-muted">streak</span>
        </div>
      )}
    </div>
  )
}
