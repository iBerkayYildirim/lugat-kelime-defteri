import { useEffect, useState } from 'react'

/**
 * useState gibi çalışır, ancak değeri LocalStorage'da saklar.
 * Okuma/yazma hataları (gizli sekme, kota dolu vb.) uygulamayı çökertmez.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) return JSON.parse(raw)
    } catch {
      // Bozuk veya erişilemeyen kayıt: varsayılan değere düş.
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Depolama kullanılamıyor; veri yalnızca bu oturumda kalır.
    }
  }, [key, value])

  return [value, setValue]
}
