import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { BookPlus, Plus, Search, SearchX } from 'lucide-react'
import { SORTS, WORD_TYPES, getStatus, hasOpenDialog, isTypingTarget, normalize, sortWords } from '../utils/words'
import WordCard from './WordCard'

const STATUS_FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'new', label: 'Yeni' },
  { id: 'learning', label: 'Öğreniliyor' },
  { id: 'learned', label: 'Öğrenildi' },
  { id: 'favorite', label: 'Favoriler' },
]

function matchesStatus(word, filter) {
  if (filter === 'all') return true
  if (filter === 'favorite') return word.favorite
  return getStatus(word) === filter
}

export default function NotebookView({ words, onAdd, onEdit, onDelete, onToggleFavorite, onLoadSamples }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('newest')
  const searchRef = useRef(null)
  const deferredQuery = useDeferredValue(query)

  // Klavye kısayolları: "/" arama kutusuna odaklanır, "n" yeni kelime penceresini açar.
  useEffect(() => {
    const onKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (isTypingTarget(event.target) || hasOpenDialog()) return
      if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
      } else if (event.key === 'n' || event.key === 'N') {
        event.preventDefault()
        onAdd()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAdd])

  const counts = useMemo(() => {
    const result = { all: words.length, new: 0, learning: 0, learned: 0, favorite: 0 }
    for (const word of words) {
      result[getStatus(word)]++
      if (word.favorite) result.favorite++
    }
    return result
  }, [words])

  const visible = useMemo(() => {
    const q = normalize(deferredQuery)
    const filtered = words.filter(
      (word) =>
        matchesStatus(word, status) &&
        (type === 'all' || word.type === type) &&
        (!q || normalize(word.term).includes(q) || normalize(word.meaning).includes(q) || normalize(word.example).includes(q)),
    )
    return sortWords(filtered, sort)
  }, [words, deferredQuery, status, type, sort])

  const hasFilters = query || status !== 'all' || type !== 'all'
  const resetFilters = () => {
    setQuery('')
    setStatus('all')
    setType('all')
  }

  if (words.length === 0) {
    return (
      <section className="card card-dash mx-auto mt-6 max-w-xl bg-base-100">
        <div className="card-body items-center py-14 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-base-200 text-primary">
            <BookPlus className="size-7" aria-hidden="true" />
          </span>
          <h2 className="mt-3 font-serif text-2xl font-semibold">Defterin henüz boş</h2>
          <p className="max-w-sm text-base-content/70">
            Yeni öğrendiğin bir kelimeyi ekleyerek başla ya da uygulamayı denemek için örnek kelimeleri yükle.
          </p>
          <div className="card-actions mt-4 flex-wrap justify-center">
            <button type="button" className="btn btn-primary" onClick={onAdd}>
              <Plus className="size-4" aria-hidden="true" /> İlk kelimeni ekle
            </button>
            <button type="button" className="btn" onClick={onLoadSamples}>
              Örnek kelimeleri yükle
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="notebook-title" className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 id="notebook-title" className="font-serif text-3xl font-semibold">
            Defterim
          </h1>
          <p className="text-sm text-base-content/60">
            {visible.length === words.length ? `${words.length} kelime` : `${words.length} kelimeden ${visible.length} tanesi gösteriliyor`}
          </p>
        </div>
        <button type="button" className="btn btn-primary md:order-last" onClick={onAdd}>
          <Plus className="size-4" aria-hidden="true" /> Yeni kelime
          <kbd className="kbd kbd-xs hidden border-current/30 bg-transparent text-inherit md:inline-flex">N</kbd>
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="input w-full lg:max-w-sm">
          <Search className="size-4 opacity-50" aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kelime, anlam veya cümle ara"
            aria-label="Kelimelerde ara"
          />
          <kbd className="kbd kbd-sm hidden sm:inline-flex">/</kbd>
        </label>

        <div className="grid grid-cols-2 gap-3 lg:flex">
          <select className="select w-full lg:w-40" value={type} onChange={(e) => setType(e.target.value)} aria-label="Türe göre filtrele">
            <option value="all">Tüm türler</option>
            {Object.entries(WORD_TYPES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select className="select w-full lg:w-44" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sırala">
            {Object.entries(SORTS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="tablist" aria-label="Duruma göre filtrele" className="tabs tabs-border flex-nowrap">
          {STATUS_FILTERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={status === id}
              className={`tab shrink-0 gap-1.5 whitespace-nowrap ${status === id ? 'tab-active' : ''}`}
              onClick={() => setStatus(id)}
            >
              {label}
              <span className="badge badge-ghost badge-xs tabular-nums">{counts[id]}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((word) => (
            <li key={word.id}>
              <WordCard word={word} onEdit={onEdit} onDelete={onDelete} onToggleFavorite={onToggleFavorite} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-box border border-dashed border-base-300 py-12 text-center">
          <SearchX className="size-8 text-base-content/40" aria-hidden="true" />
          <p className="font-medium">Bu filtrelere uyan kelime yok.</p>
          {hasFilters && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={resetFilters}>
              Filtreleri temizle
            </button>
          )}
        </div>
      )}
    </section>
  )
}
