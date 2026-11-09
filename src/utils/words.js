// Kelime veri modeli ve yardımcı fonksiyonlar

export const MAX_LEVEL = 5
export const LEARNED_LEVEL = 4

export const WORD_TYPES = {
  noun: { label: 'İsim', badge: 'badge-info' },
  verb: { label: 'Fiil', badge: 'badge-success' },
  adjective: { label: 'Sıfat', badge: 'badge-secondary' },
  adverb: { label: 'Zarf', badge: 'badge-accent' },
  phrase: { label: 'Kalıp', badge: 'badge-warning' },
  other: { label: 'Diğer', badge: 'badge-neutral' },
}

export const STATUSES = {
  new: { label: 'Yeni', dot: 'bg-base-content/30', bar: 'bg-base-300' },
  learning: { label: 'Öğreniliyor', dot: 'bg-warning', bar: 'bg-warning' },
  learned: { label: 'Öğrenildi', dot: 'bg-success', bar: 'bg-success' },
}

export const SORTS = {
  newest: 'En yeni',
  oldest: 'En eski',
  az: 'A → Z',
  za: 'Z → A',
  weakest: 'En az bilinen',
}

/** Hiç çalışılmamışsa "yeni", seviye eşiği aşıldıysa "öğrenildi", aksi halde "öğreniliyor". */
export function getStatus(word) {
  if (word.correct + word.wrong === 0) return 'new'
  return word.level >= LEARNED_LEVEL ? 'learned' : 'learning'
}

export function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function createWord({ term, meaning, type = 'other', example = '' }) {
  return {
    id: createId(),
    term: term.trim(),
    meaning: meaning.trim(),
    type: WORD_TYPES[type] ? type : 'other',
    example: example.trim(),
    level: 0,
    correct: 0,
    wrong: 0,
    favorite: false,
    createdAt: Date.now(),
    lastReviewed: null,
  }
}

/** Doğru cevap seviyeyi bir artırır, yanlış cevap bir azaltır (Leitner kutusuna benzer). */
export function applyReview(word, isCorrect) {
  return {
    ...word,
    level: isCorrect ? Math.min(MAX_LEVEL, word.level + 1) : Math.max(0, word.level - 1),
    correct: word.correct + (isCorrect ? 1 : 0),
    wrong: word.wrong + (isCorrect ? 0 : 1),
    lastReviewed: Date.now(),
  }
}

/** Türkçe ve İngilizce harfleri aynı şekilde karşılaştırmak için küçük harfe çevirir (I/ı/İ/i). */
export function normalize(text = '') {
  return text.toLocaleLowerCase('tr').replace(/ı/g, 'i').trim()
}

export function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Çalışma kuyruğu: en az bilinen kelimeler öncelikli, aynı seviyedekiler karışık. */
export function buildQueue(words, size) {
  const prioritized = shuffle(words).sort((a, b) => a.level - b.level)
  const picked = size === 'all' ? prioritized : prioritized.slice(0, size)
  return shuffle(picked)
}

export function sortWords(list, sort) {
  const copy = [...list]
  switch (sort) {
    case 'oldest':
      return copy.sort((a, b) => a.createdAt - b.createdAt)
    case 'az':
      return copy.sort((a, b) => a.term.localeCompare(b.term, 'en'))
    case 'za':
      return copy.sort((a, b) => b.term.localeCompare(a.term, 'en'))
    case 'weakest':
      return copy.sort((a, b) => a.level - b.level || b.wrong - a.wrong)
    default:
      return copy.sort((a, b) => b.createdAt - a.createdAt)
  }
}

/** İçe aktarılan JSON'daki kaydı güvenli bir kelime nesnesine dönüştürür; geçersizse null döner. */
export function sanitizeWord(raw) {
  if (!raw || typeof raw.term !== 'string' || typeof raw.meaning !== 'string') return null
  if (!raw.term.trim() || !raw.meaning.trim()) return null
  const base = createWord({
    term: raw.term,
    meaning: raw.meaning,
    type: raw.type,
    example: typeof raw.example === 'string' ? raw.example : '',
  })
  const level = Number.isFinite(raw.level) ? Math.min(MAX_LEVEL, Math.max(0, Math.round(raw.level))) : 0
  return {
    ...base,
    level,
    correct: Number.isFinite(raw.correct) ? Math.max(0, raw.correct) : 0,
    wrong: Number.isFinite(raw.wrong) ? Math.max(0, raw.wrong) : 0,
    favorite: Boolean(raw.favorite),
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : base.createdAt,
    lastReviewed: Number.isFinite(raw.lastReviewed) ? raw.lastReviewed : null,
  }
}

// ---- Tarih / seri hesapları ----

export function dayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Bugün (ya da bugün henüz çalışılmadıysa dün) biten kesintisiz çalışma günü sayısı. */
export function calcStreak(activity) {
  const cursor = new Date()
  if (!activity[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (activity[dayKey(cursor)]) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// ---- Sesli okuma (Web Speech API) ----

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text) {
  if (!canSpeak) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}

/** Kullanıcı bir alana yazıyorsa ya da açık bir diyalog varsa klavye kısayollarını yok saymak için. */
export function isTypingTarget(target) {
  if (!target) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function hasOpenDialog() {
  return Boolean(document.querySelector('dialog[open]'))
}
