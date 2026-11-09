import { RefreshCw, RotateCcw, Undo2 } from 'lucide-react'

function verdict(percent) {
  if (percent === 100) return 'Kusursuz! Hepsini bildin.'
  if (percent >= 75) return 'Harika iş çıkardın.'
  if (percent >= 50) return 'İyi gidiyorsun, biraz daha tekrar.'
  return 'Tekrar ettikçe kalıcı olacak.'
}

export default function SessionSummary({ results, onRetryWrong, onRestart, onExit }) {
  const correct = results.filter((r) => r.correct).length
  const percent = Math.round((correct / results.length) * 100)
  const wrong = results.filter((r) => !r.correct)

  return (
    <section aria-labelledby="summary-title" className="mx-auto max-w-xl">
      <div className="card card-border bg-base-100">
        <div className="card-body items-center gap-4 text-center">
          <div
            className={`radial-progress ${percent >= 75 ? 'text-success' : percent >= 50 ? 'text-warning' : 'text-error'}`}
            style={{ '--value': percent, '--size': '7rem', '--thickness': '0.6rem' }}
            role="progressbar"
            aria-valuenow={percent}
            aria-label="Başarı oranı"
          >
            <span className="text-2xl font-semibold text-base-content tabular-nums">%{percent}</span>
          </div>
          <div>
            <h1 id="summary-title" className="font-serif text-2xl font-semibold">
              {verdict(percent)}
            </h1>
            <p className="mt-1 text-base-content/70">
              {results.length} kelimeden <strong className="text-success">{correct}</strong> tanesini bildin
              {wrong.length > 0 && (
                <>
                  , <strong className="text-error">{wrong.length}</strong> tanesi tekrar listesinde
                </>
              )}
              .
            </p>
          </div>

          {wrong.length > 0 && (
            <div className="w-full text-left">
              <h2 className="mb-2 text-sm font-semibold text-base-content/70">Tekrar edilecekler</h2>
              <ul className="divide-y divide-base-200 rounded-box border border-base-300">
                {wrong.map(({ word }) => (
                  <li key={word.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                    <span className="font-serif text-lg font-semibold" lang="en">
                      {word.term}
                    </span>
                    <span className="text-right text-sm text-base-content/70">{word.meaning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card-actions w-full flex-col gap-2 sm:flex-row sm:justify-center">
            {onRetryWrong && (
              <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={onRetryWrong}>
                <RotateCcw className="size-4" aria-hidden="true" /> Yanlışları tekrar et
              </button>
            )}
            <button type="button" className={`btn w-full sm:w-auto ${onRetryWrong ? '' : 'btn-primary'}`} onClick={onRestart}>
              <RefreshCw className="size-4" aria-hidden="true" /> Yeni tur
            </button>
            <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={onExit}>
              <Undo2 className="size-4" aria-hidden="true" /> Ayarlara dön
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
