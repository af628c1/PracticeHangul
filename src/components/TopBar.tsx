import AccountButton from './AccountButton'

export default function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2.5 border-b border-line bg-paper">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="font-hand text-lg text-muted hover:text-ink transition-colors cursor-pointer"
          >
            ← Back
          </button>
        )}
      </div>
      <div className="font-hand font-bold text-xl text-ink">{title}</div>
      <div className="justify-self-end">
        <AccountButton />
      </div>
    </div>
  )
}
