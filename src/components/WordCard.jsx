import { Pencil, Star, Trash2, Volume2 } from 'lucide-react'
import { WORD_TYPES, canSpeak, speak } from '../utils/words'
import LevelMeter from './LevelMeter'

export default function WordCard({ word, onEdit, onDelete, onToggleFavorite }) {
  const type = WORD_TYPES[word.type] ?? WORD_TYPES.other

  return (
    <article className="card card-border h-full bg-base-100 transition-shadow hover:shadow-md">
      <div className="card-body gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-2xl font-semibold break-words" lang="en">
              {word.term}
            </h3>
            <span className={`badge badge-soft badge-sm mt-1.5 ${type.badge}`}>{type.label}</span>
          </div>
          {canSpeak && (
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm shrink-0"
              onClick={() => speak(word.term)}
              aria-label={`"${word.term}" kelimesini sesli oku`}
              title="Telaffuzu dinle"
            >
              <Volume2 className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <p className="text-[0.95rem] leading-relaxed">{word.meaning}</p>

        {word.example && (
          <blockquote lang="en" className="border-l-2 border-secondary/50 pl-3 text-sm text-base-content/70 italic">
            {word.example}
          </blockquote>
        )}

        <div className="card-actions mt-auto items-center justify-between border-t border-base-200 pt-3">
          <LevelMeter word={word} />
          <div className="flex gap-0.5">
            <button
              type="button"
              className={`btn btn-ghost btn-square btn-xs ${word.favorite ? 'text-warning' : 'text-base-content/50'}`}
              onClick={() => onToggleFavorite(word.id)}
              aria-pressed={word.favorite}
              aria-label={word.favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
              title={word.favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <Star className="size-4" fill={word.favorite ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-square btn-xs text-base-content/50"
              onClick={() => onEdit(word)}
              aria-label={`"${word.term}" kelimesini düzenle`}
              title="Düzenle"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-square btn-xs text-base-content/50 hover:text-error"
              onClick={() => onDelete(word)}
              aria-label={`"${word.term}" kelimesini sil`}
              title="Sil"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
