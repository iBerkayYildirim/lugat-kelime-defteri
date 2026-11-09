import { useEffect, useRef, useState } from 'react'
import { WORD_TYPES } from '../utils/words'

const EMPTY = { term: '', meaning: '', type: 'noun', example: '' }

/**
 * Kelime ekleme / düzenleme penceresi.
 * Ebeveyn yalnızca açıkken render eder; böylece her açılışta form temiz başlar.
 */
export default function WordForm({ word, isDuplicate, onSave, onClose }) {
  const dialogRef = useRef(null)
  const [values, setValues] = useState(() =>
    word ? { term: word.term, meaning: word.meaning, type: word.type, example: word.example } : EMPTY,
  )
  const [error, setError] = useState('')
  const isEdit = Boolean(word)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const update = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }))
    if (error) setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const term = values.term.trim()
    const meaning = values.meaning.trim()
    if (!term || !meaning) {
      setError('Kelime ve anlamı boş bırakılamaz.')
      return
    }
    if (isDuplicate(term, word?.id)) {
      setError(`"${term}" zaten defterinde var.`)
      return
    }
    onSave({ ...values, term, meaning, example: values.example.trim() })
  }

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose} aria-labelledby="word-form-title">
      <div className="modal-box">
        <h2 id="word-form-title" className="font-serif text-2xl font-semibold">
          {isEdit ? 'Kelimeyi düzenle' : 'Yeni kelime'}
        </h2>
        <p className="mt-1 text-sm text-base-content/60">
          {isEdit ? 'Değişiklikler hemen kaydedilir.' : 'Öğrendiğin kelimeyi örnek bir cümleyle birlikte kaydet.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-4" noValidate>
          <div className="grid gap-x-4 sm:grid-cols-[1fr_9rem]">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Kelime (İngilizce)</legend>
              <input
                className="input w-full"
                value={values.term}
                onChange={update('term')}
                placeholder="ör. serendipity"
                aria-label="Kelime (İngilizce)"
                lang="en"
                autoComplete="off"
                maxLength={60}
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Türü</legend>
              <select className="select w-full" value={values.type} onChange={update("type")} aria-label="Türü">
                {Object.entries(WORD_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Anlamı (Türkçe)</legend>
            <input
              className="input w-full"
              value={values.meaning}
              onChange={update('meaning')}
              placeholder="ör. mutlu tesadüf"
              aria-label="Anlamı (Türkçe)"
              autoComplete="off"
              maxLength={120}
              required
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Örnek cümle</legend>
            <textarea
              className="textarea w-full"
              rows={2}
              value={values.example}
              onChange={update('example')}
              placeholder="ör. Meeting her there was pure serendipity."
              aria-label="Örnek cümle"
              lang="en"
              maxLength={200}
            />
            <p className="label">İsteğe bağlı, ama kelimeyi hatırlamayı çok kolaylaştırır.</p>
          </fieldset>

          {error && (
            <div role="alert" className="alert alert-error alert-soft mt-3 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current?.close()}>
              Vazgeç
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Değişiklikleri kaydet' : 'Deftere ekle'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">Kapat</button>
      </form>
    </dialog>
  )
}
