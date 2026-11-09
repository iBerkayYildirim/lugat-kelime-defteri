import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Check, Volume2, X } from 'lucide-react'
import { canSpeak, hasOpenDialog, isTypingTarget, normalize, shuffle, speak } from '../utils/words'
import SessionHeader from './SessionHeader'

/** Her soru için doğru cevap + farklı anlamlı üç çeldirici seçer. */
function buildQuestions(queue, allWords, direction) {
  const field = direction === 'en-tr' ? 'meaning' : 'term'
  return queue.map((word) => {
    const seen = new Set([normalize(word[field])])
    const distractors = []
    for (const other of shuffle(allWords)) {
      const key = normalize(other[field])
      if (other.id === word.id || seen.has(key)) continue
      seen.add(key)
      distractors.push(other)
      if (distractors.length === 3) break
    }
    return { word, options: shuffle([word, ...distractors]) }
  })
}

export default function Quiz({ queue, allWords, direction, onAnswer, onFinish, onExit }) {
  const [questions] = useState(() => buildQuestions(queue, allWords, direction))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState([])

  const { word, options } = questions[index]
  const prompt = direction === 'en-tr' ? word.term : word.meaning
  const optionText = (option) => (direction === 'en-tr' ? option.meaning : option.term)
  const answered = selected !== null
  const isLast = index + 1 >= questions.length

  const choose = useCallback(
    (option) => {
      if (selected !== null) return
      const correct = option.id === word.id
      setSelected(option.id)
      onAnswer(word.id, correct)
      setResults((r) => [...r, { word, correct }])
    },
    [onAnswer, selected, word],
  )

  const next = useCallback(() => {
    if (isLast) {
      onFinish(results)
    } else {
      setSelected(null)
      setIndex((i) => i + 1)
    }
  }, [isLast, onFinish, results])

  const quit = () => (results.length ? onFinish(results) : onExit())

  // 1-4: şık seç · Enter / →: sonraki soru
  useEffect(() => {
    const onKey = (event) => {
      if (isTypingTarget(event.target) || hasOpenDialog()) return
      const n = Number(event.key)
      if (!answered && n >= 1 && n <= options.length) {
        choose(options[n - 1])
      } else if (answered && (event.key === 'ArrowRight' || (event.key === 'Enter' && event.target?.tagName !== 'BUTTON'))) {
        event.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, choose, next, options])

  const optionClass = (option) => {
    if (!answered) return 'btn-outline'
    if (option.id === word.id) return 'btn-success'
    if (option.id === selected) return 'btn-error'
    return 'btn-outline opacity-40 pointer-events-none'
  }

  return (
    <section className="mx-auto max-w-xl space-y-5">
      <SessionHeader title="Test" index={index} total={questions.length} onExit={quit} />

      <div className="card card-border bg-base-100">
        <div className="card-body items-center gap-2 py-10 text-center">
          <p className="text-sm text-base-content/60">
            {direction === 'en-tr' ? 'Bu kelimenin anlamı ne?' : 'Bu anlama gelen kelime hangisi?'}
          </p>
          <div className="flex items-center gap-2">
            <p className={direction === 'en-tr' ? 'font-serif text-4xl font-semibold' : 'text-2xl font-medium'} lang={direction === 'en-tr' ? 'en' : 'tr'}>
              {prompt}
            </p>
            {canSpeak && direction === 'en-tr' && (
              <button type="button" className="btn btn-ghost btn-circle btn-sm" onClick={() => speak(word.term)} aria-label="Telaffuzu dinle">
                <Volume2 className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <ol className="grid gap-2.5">
        {options.map((option, i) => (
          <li key={option.id}>
            <button
              type="button"
              className={`btn h-auto min-h-12 w-full justify-start py-2.5 text-left font-normal whitespace-normal ${optionClass(option)}`}
              onClick={() => choose(option)}
            >
              <kbd className="kbd kbd-sm">{i + 1}</kbd>
              <span className="flex-1" lang={direction === 'en-tr' ? 'tr' : 'en'}>
                {optionText(option)}
              </span>
              {answered && option.id === word.id && <Check className="size-4" aria-label="Doğru cevap" />}
              {answered && option.id === selected && option.id !== word.id && <X className="size-4" aria-label="Senin cevabın" />}
            </button>
          </li>
        ))}
      </ol>

      <div className="flex min-h-12 items-center justify-between gap-3" aria-live="polite">
        <p className="text-sm">
          {answered &&
            (selected === word.id ? (
              <span className="font-medium text-success">Doğru! 🎉</span>
            ) : (
              <span>
                <span className="font-medium text-error">Yanlış.</span> Doğrusu: <strong>{optionText(word)}</strong>
              </span>
            ))}
        </p>
        {answered && (
          <button type="button" className="btn btn-primary" onClick={next} autoFocus>
            {isLast ? 'Sonuçları gör' : 'Sonraki'} <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
