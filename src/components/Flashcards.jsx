import { useCallback, useEffect, useState } from 'react'
import { Check, RotateCcw, Volume2 } from 'lucide-react'
import { WORD_TYPES, canSpeak, hasOpenDialog, isTypingTarget, speak } from '../utils/words'
import SessionHeader from './SessionHeader'

function Term({ word }) {
  const type = WORD_TYPES[word.type] ?? WORD_TYPES.other
  return (
    <div className="flex flex-col items-center gap-3">
      <span className={`badge badge-soft badge-sm ${type.badge}`}>{type.label}</span>
      <p className="font-serif text-4xl font-semibold break-words sm:text-5xl" lang="en">
        {word.term}
      </p>
    </div>
  )
}

function Meaning({ word }) {
  return <p className="text-2xl leading-snug font-medium sm:text-3xl">{word.meaning}</p>
}

export default function Flashcards({ queue, direction, onAnswer, onFinish, onExit }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState([])

  const word = queue[index]
  const front = direction === 'en-tr' ? <Term word={word} /> : <Meaning word={word} />
  const back = direction === 'en-tr' ? <Meaning word={word} /> : <Term word={word} />

  const answer = useCallback(
    (correct) => {
      onAnswer(word.id, correct)
      const next = [...results, { word, correct }]
      setResults(next)
      if (index + 1 >= queue.length) {
        onFinish(next)
      } else {
        setFlipped(false)
        setIndex(index + 1)
      }
    },
    [index, onAnswer, onFinish, queue.length, results, word],
  )

  const quit = () => (results.length ? onFinish(results) : onExit())

  // Boşluk: kartı çevir · ←: tekrar et · →: biliyorum
  useEffect(() => {
    const onKey = (event) => {
      if (isTypingTarget(event.target) || hasOpenDialog()) return
      const onButton = event.target?.tagName === 'BUTTON'
      if (event.key === ' ' && !onButton) {
        event.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && (event.key === 'ArrowRight' || event.key === '2')) {
        answer(true)
      } else if (flipped && (event.key === 'ArrowLeft' || event.key === '1')) {
        answer(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer, flipped])

  return (
    <section className="mx-auto max-w-xl space-y-5">
      <SessionHeader title="Kartlar" index={index} total={queue.length} onExit={quit} />

      {/* key: her yeni kartta yeniden oluşturulur, böylece arka yüz önceki karttan "sızmaz" */}
      <div key={word.id + index} className="perspective-distant">
        <div
          role="button"
          tabIndex={0}
          aria-label={flipped ? 'Kartın ön yüzünü göster' : 'Kartı çevir ve cevabı gör'}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setFlipped((f) => !f)
          }}
          className={`relative h-72 cursor-pointer rounded-box transition-transform duration-500 transform-3d focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none sm:h-80 ${flipped ? 'rotate-y-180' : ''}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-box border border-base-300 bg-base-100 p-8 text-center shadow-sm backface-hidden">
            {front}
            <span className="absolute bottom-4 text-xs text-base-content/50">Çevirmek için dokun ya da boşluk tuşuna bas</span>
          </div>
          <div
            className="absolute inset-0 flex rotate-y-180 flex-col items-center justify-center gap-4 rounded-box bg-neutral p-8 text-center text-neutral-content shadow-sm backface-hidden"
            aria-hidden={!flipped}
          >
            {back}
            {word.example && (
              <p lang="en" className="max-w-md text-sm text-neutral-content/70 italic">
                “{word.example}”
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-12 items-center justify-center gap-3">
        {canSpeak && (
          <button type="button" className="btn btn-ghost btn-circle" onClick={() => speak(word.term)} aria-label="Telaffuzu dinle" title="Telaffuzu dinle">
            <Volume2 className="size-5" aria-hidden="true" />
          </button>
        )}
        {flipped ? (
          <>
            <button type="button" className="btn btn-soft btn-error flex-1 sm:flex-none sm:px-8" onClick={() => answer(false)}>
              <RotateCcw className="size-4" aria-hidden="true" /> Tekrar et
              <kbd className="kbd kbd-xs hidden border-current/30 bg-transparent text-inherit sm:inline-flex">←</kbd>
            </button>
            <button type="button" className="btn btn-success flex-1 sm:flex-none sm:px-8" onClick={() => answer(true)}>
              <Check className="size-4" aria-hidden="true" /> Biliyorum
              <kbd className="kbd kbd-xs hidden border-current/30 bg-transparent text-inherit sm:inline-flex">→</kbd>
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-neutral flex-1 sm:flex-none sm:px-10" onClick={() => setFlipped(true)}>
            Cevabı göster
            <kbd className="kbd kbd-xs hidden border-current/30 bg-transparent text-inherit sm:inline-flex">Boşluk</kbd>
          </button>
        )}
      </div>
    </section>
  )
}
