import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmDialog from './components/ConfirmDialog'
import Header from './components/Header'
import NotebookView from './components/NotebookView'
import StatsBar from './components/StatsBar'
import StudyView from './components/StudyView'
import Toaster from './components/Toaster'
import WordForm from './components/WordForm'
import { getSampleWords } from './data/sampleWords'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useToast } from './hooks/useToast'
import { applyReview, calcStreak, createWord, dayKey, getStatus, normalize, sanitizeWord } from './utils/words'

const VIEWS = ['defter', 'calis']

function readView() {
  const hash = window.location.hash.replace('#', '')
  return VIEWS.includes(hash) ? hash : 'defter'
}

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [words, setWords] = useLocalStorage('lugat:words', getSampleWords)
  const [activity, setActivity] = useLocalStorage('lugat:activity', {})
  const [theme, setTheme] = useLocalStorage('lugat:theme', () => (prefersDark() ? 'lugat-dark' : 'lugat'))
  const [view, setView] = useState(readView)
  const [form, setForm] = useState(null) // null | { word: Word | null }
  const [confirm, setConfirm] = useState(null)
  const { toasts, show: showToast, dismiss: dismissToast } = useToast()

  // Tema <html data-theme="..."> üzerinden uygulanır (daisyUI).
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Görünüm adres çubuğundaki #defter / #calis ile senkron; tarayıcının geri tuşu da çalışır.
  useEffect(() => {
    const onHash = () => setView(readView())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const changeView = useCallback((next) => {
    window.location.hash = next
    setView(next)
    window.scrollTo({ top: 0 })
  }, [])

  // ---- İstatistikler ----
  const stats = useMemo(() => {
    let learned = 0
    let fresh = 0
    for (const word of words) {
      const status = getStatus(word)
      if (status === 'learned') learned++
      if (status === 'new') fresh++
    }
    return {
      total: words.length,
      learned,
      fresh,
      reviewsToday: activity[dayKey()] ?? 0,
      streak: calcStreak(activity),
    }
  }, [words, activity])

  // ---- Kelime işlemleri ----
  const isDuplicate = useCallback(
    (term, excludeId) => words.some((w) => w.id !== excludeId && normalize(w.term) === normalize(term)),
    [words],
  )

  const openAdd = useCallback(() => setForm({ word: null }), [])
  const openEdit = useCallback((word) => setForm({ word }), [])

  const saveWord = (values) => {
    if (form?.word) {
      const id = form.word.id
      setWords((list) => list.map((w) => (w.id === id ? { ...w, ...values } : w)))
      showToast({ message: `"${values.term}" güncellendi.`, tone: 'success' })
    } else {
      setWords((list) => [createWord(values), ...list])
      showToast({ message: `"${values.term}" deftere eklendi.`, tone: 'success' })
    }
    setForm(null)
  }

  const deleteWord = useCallback(
    (word) => {
      setWords((list) => list.filter((w) => w.id !== word.id))
      showToast({
        message: `"${word.term}" silindi.`,
        action: {
          label: 'Geri al',
          onClick: () => setWords((list) => (list.some((w) => w.id === word.id) ? list : [word, ...list])),
        },
      })
    },
    [setWords, showToast],
  )

  const toggleFavorite = useCallback(
    (id) => setWords((list) => list.map((w) => (w.id === id ? { ...w, favorite: !w.favorite } : w))),
    [setWords],
  )

  const recordReview = useCallback(
    (id, correct) => {
      setWords((list) => list.map((w) => (w.id === id ? applyReview(w, correct) : w)))
      const today = dayKey()
      setActivity((a) => ({ ...a, [today]: (a[today] ?? 0) + 1 }))
    },
    [setWords, setActivity],
  )

  // ---- Veri işlemleri (menü) ----
  const exportWords = () => {
    const payload = { app: 'lugat', version: 1, exportedAt: new Date().toISOString(), words }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lugat-yedek-${dayKey()}.json`
    link.click()
    URL.revokeObjectURL(url)
    showToast({ message: `${words.length} kelime yedeklendi.`, tone: 'success' })
  }

  /** Yalnızca defterde olmayan kelimeleri ekler; mevcut kayıtların üzerine yazmaz. */
  const mergeWords = (incoming, sourceLabel) => {
    const known = new Set(words.map((w) => normalize(w.term)))
    const fresh = []
    for (const word of incoming) {
      const key = normalize(word.term)
      if (known.has(key)) continue
      known.add(key)
      fresh.push(word)
    }
    setWords((list) => [...fresh, ...list])
    const skipped = incoming.length - fresh.length
    showToast({
      message: fresh.length
        ? `${sourceLabel}: ${fresh.length} kelime eklendi${skipped ? `, ${skipped} tanesi zaten vardı` : ''}.`
        : `${sourceLabel}: tüm kelimeler zaten defterinde.`,
      tone: fresh.length ? 'success' : 'info',
    })
  }

  const importWords = async (file) => {
    try {
      const data = JSON.parse(await file.text())
      const list = Array.isArray(data) ? data : data?.words
      if (!Array.isArray(list)) throw new Error('format')
      const valid = list.map(sanitizeWord).filter(Boolean)
      if (valid.length === 0) throw new Error('empty')
      mergeWords(valid, 'Yedek yüklendi')
    } catch {
      showToast({ message: 'Dosya okunamadı. Lügat yedeği olan bir JSON dosyası seç.', tone: 'error' })
    }
  }

  const loadSamples = () => mergeWords(getSampleWords(), 'Örnekler')

  const clearAll = () =>
    setConfirm({
      title: 'Tüm kelimeler silinsin mi?',
      message: `Defterindeki ${words.length} kelime ve çalışma geçmişi bu tarayıcıdan kalıcı olarak silinecek. İstersen önce menüden yedek indir.`,
      confirmLabel: 'Hepsini sil',
      onConfirm: () => {
        setWords([])
        setActivity({})
        showToast({ message: 'Defter temizlendi.' })
      },
    })

  const isDark = theme === 'lugat-dark'

  return (
    <div className="flex min-h-dvh flex-col bg-base-200">
      <Header
        view={view}
        onViewChange={changeView}
        isDark={isDark}
        onToggleTheme={() => setTheme(isDark ? 'lugat' : 'lugat-dark')}
        onExport={exportWords}
        onImport={importWords}
        onLoadSamples={loadSamples}
        onClearAll={clearAll}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {view === 'defter' && words.length > 0 && <StatsBar {...stats} />}
        {view === 'defter' ? (
          <NotebookView
            words={words}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={deleteWord}
            onToggleFavorite={toggleFavorite}
            onLoadSamples={loadSamples}
          />
        ) : (
          <StudyView words={words} onReview={recordReview} onGoNotebook={() => changeView('defter')} />
        )}
      </main>

      <footer className="border-t border-base-300 py-5 text-center text-xs text-base-content/60">
        Lügat · Verilerin yalnızca bu tarayıcıda (LocalStorage) saklanır.
      </footer>

      {form && <WordForm word={form.word} isDuplicate={isDuplicate} onSave={saveWord} onClose={() => setForm(null)} />}
      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
