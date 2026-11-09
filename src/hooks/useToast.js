import { useCallback, useEffect, useRef, useState } from 'react'
import { createId } from '../utils/words'

/** Ekranın köşesinde kısa süreli bildirimler göstermek için basit bir kanca. */
export function useToast() {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
  }, [])

  const show = useCallback(
    ({ message, tone = 'neutral', action, duration = 4500 }) => {
      const id = createId()
      setToasts((list) => [...list.slice(-2), { id, message, tone, action }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      )
    },
    [dismiss],
  )

  useEffect(() => {
    const map = timers.current
    return () => map.forEach((timer) => clearTimeout(timer))
  }, [])

  return { toasts, show, dismiss }
}
