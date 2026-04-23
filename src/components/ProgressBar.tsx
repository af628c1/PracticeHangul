interface Props {
  current: number
  total: number | null
}

export default function ProgressBar({ current, total }: Props) {
  const percentage = total ? Math.min(100, (current / total) * 100) : 0

  return (
    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
      <div
        className="h-full bg-k-red rounded-full transition-all duration-500"
        style={{ width: total ? `${percentage}%` : '100%', opacity: total ? 1 : 0.3 }}
      />
    </div>
  )
}
