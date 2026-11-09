import { X } from 'lucide-react'

export default function SessionHeader({ title, index, total, onExit }) {
  const current = Math.min(index + 1, total)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-base-content/60 tabular-nums">
            {current} / {total}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onExit} aria-label="Çalışmayı bitir">
            <X className="size-4" aria-hidden="true" /> Bitir
          </button>
        </div>
      </div>
      <progress className="progress progress-primary w-full" value={index} max={total} aria-label="İlerleme" />
    </div>
  )
}
