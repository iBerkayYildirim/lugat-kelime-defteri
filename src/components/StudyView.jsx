import { useMemo, useState } from 'react'
import { GalleryHorizontalEnd, ListChecks, NotebookPen, Play } from 'lucide-react'
import { buildQueue, createId, getStatus, shuffle } from '../utils/words'
import Flashcards from './Flashcards'
import Quiz from './Quiz'
import SessionSummary from './SessionSummary'

const MODES = [
  { id: 'cards', title: 'Kartlar', desc: 'Kartı çevir, bilip bilmediğine sen karar ver.', icon: GalleryHorizontalEnd },
  { id: 'quiz', title: 'Test', desc: 'Dört şıktan doğru karşılığı seç.', icon: ListChecks },
]

const POOLS = [
  { id: 'due', label: 'Öğrenilmemiş' },
  { id: 'all', label: 'Tümü' },
  { id: 'favorite', label: 'Favoriler' },
]

const DIRECTIONS = [
  { id: 'en-tr', label: 'İngilizce → Türkçe' },
  { id: 'tr-en', label: 'Türkçe → İngilizce' },
]

const SIZES = [
  { id: 10, label: '10' },
  { id: 20, label: '20' },
  { id: 'all', label: 'Hepsi' },
]

const QUIZ_MIN_WORDS = 4

function OptionGroup({ name, legend, options, value, onChange, stackOnMobile = false }) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{legend}</legend>
      <div className={`join w-full ${stackOnMobile ? "join-vertical sm:join-horizontal" : ""}`}>
        {options.map((option) => (
          <input
            key={option.id}
            type="radio"
            name={name}
            className="join-item btn flex-1"
            aria-label={option.label}
            checked={value === option.id}
            disabled={option.disabled}
            onChange={() => onChange(option.id)}
          />
        ))}
      </div>
    </fieldset>
  )
}

export default function StudyView({ words, onReview, onGoNotebook }) {
  const [mode, setMode] = useState('cards')
  const [pool, setPool] = useState('due')
  const [direction, setDirection] = useState('en-tr')
  const [size, setSize] = useState(10)
  const [session, setSession] = useState(null)
  const [results, setResults] = useState(null)

  const pools = useMemo(
    () => ({
      due: words.filter((w) => getStatus(w) !== 'learned'),
      all: words,
      favorite: words.filter((w) => w.favorite),
    }),
    [words],
  )

  const quizDisabled = words.length < QUIZ_MIN_WORDS
  const activeMode = quizDisabled ? 'cards' : mode
  const available = pools[pool].length
  const sessionLength = size === 'all' ? available : Math.min(size, available)

  const start = (queue) => {
    setResults(null)
    setSession({ id: createId(), mode: activeMode, direction, queue, allWords: words })
  }

  const exit = () => {
    setSession(null)
    setResults(null)
  }

  if (words.length === 0) {
    return (
      <section className="card card-dash mx-auto mt-6 max-w-xl bg-base-100">
        <div className="card-body items-center py-14 text-center">
          <h1 className="font-serif text-2xl font-semibold">Çalışacak kelime yok</h1>
          <p className="text-base-content/70">Önce defterine birkaç kelime ekle, sonra burada kendini sına.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={onGoNotebook}>
            <NotebookPen className="size-4" aria-hidden="true" /> Deftere git
          </button>
        </div>
      </section>
    )
  }

  if (session && results) {
    const wrong = results.filter((r) => !r.correct).map((r) => r.word)
    return (
      <SessionSummary
        results={results}
        onRetryWrong={wrong.length ? () => start(shuffle(wrong)) : null}
        onRestart={() => start(buildQueue(pools[pool], size))}
        onExit={exit}
      />
    )
  }

  if (session) {
    const Component = session.mode === 'quiz' ? Quiz : Flashcards
    return (
      <Component
        key={session.id}
        queue={session.queue}
        allWords={session.allWords}
        direction={session.direction}
        onAnswer={onReview}
        onFinish={setResults}
        onExit={exit}
      />
    )
  }

  return (
    <section aria-labelledby="study-title" className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 id="study-title" className="font-serif text-3xl font-semibold">
          Çalışma zamanı
        </h1>
        <p className="text-sm text-base-content/60">
          En az bildiğin kelimeler önce gelir. Her doğru cevap kelimeyi bir seviye yukarı taşır.
        </p>
      </div>

      <div className="card card-border bg-base-100">
        <div className="card-body gap-5">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Çalışma şekli</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {MODES.map(({ id, title, desc, icon: Icon }) => {
                const disabled = id === 'quiz' && quizDisabled
                return (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-start gap-3 rounded-box border border-base-300 p-4 transition-colors has-checked:border-primary has-checked:bg-primary/5 ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-base-200'}`}
                  >
                    <input
                      type="radio"
                      name="study-mode"
                      className="radio radio-sm radio-primary mt-0.5"
                      aria-label={title}
                      checked={activeMode === id}
                      disabled={disabled}
                      onChange={() => setMode(id)}
                    />
                    <span>
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Icon className="size-4" aria-hidden="true" /> {title}
                      </span>
                      <span className="mt-0.5 block text-sm text-base-content/70">
                        {disabled ? `Test için en az ${QUIZ_MIN_WORDS} kelime gerekir.` : desc}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <OptionGroup
            name="study-pool"
            stackOnMobile
            legend="Hangi kelimeler?"
            value={pool}
            onChange={setPool}
            options={POOLS.map((p) => ({ ...p, label: `${p.label} (${pools[p.id].length})` }))}
          />
          <div className="grid gap-x-4 sm:grid-cols-[1.4fr_1fr]">
            <OptionGroup name="study-direction" legend="Yön" value={direction} onChange={setDirection} options={DIRECTIONS} />
            <OptionGroup name="study-size" legend="Kaç kelime?" value={size} onChange={setSize} options={SIZES} />
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={available === 0}
            onClick={() => start(buildQueue(pools[pool], size))}
          >
            <Play className="size-4" aria-hidden="true" />
            {available === 0 ? 'Bu grupta kelime yok' : `Başla · ${sessionLength} kelime`}
          </button>
        </div>
      </div>
    </section>
  )
}
