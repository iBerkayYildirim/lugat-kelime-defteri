import { MAX_LEVEL, STATUSES, getStatus } from '../utils/words'

/** Kelimenin öğrenme seviyesini 5 küçük çubukla gösterir. */
export default function LevelMeter({ word }) {
  const status = getStatus(word)
  const { label, bar, dot } = STATUSES[status]

  return (
    <div className="flex items-center gap-2" title={`Seviye ${word.level}/${MAX_LEVEL}`}>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: MAX_LEVEL }, (_, i) => (
          <span key={i} className={`h-1.5 w-3 rounded-full ${i < word.level ? bar : 'bg-base-300'}`} />
        ))}
      </div>
      <span className="flex items-center gap-1 text-xs text-base-content/70">
        <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
        {label}
        <span className="sr-only">, seviye {word.level} / {MAX_LEVEL}</span>
      </span>
    </div>
  )
}
