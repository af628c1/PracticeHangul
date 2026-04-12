interface Props {
  current: number
  total: number | null // null for infinite mode
}

export default function ProgressBar({ current, total }: Props) {
  const percentage = total ? (current / total) * 100 : 0

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-hangul-muted mb-2">
        <span>
          {total ? `Question ${current + 1} of ${total}` : `Question ${current + 1}`}
        </span>
      </div>
      {total && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-hangul-accent rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
