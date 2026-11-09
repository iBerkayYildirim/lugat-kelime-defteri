import { X } from 'lucide-react'

const TONES = {
  neutral: '',
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
}

export default function Toaster({ toasts, onDismiss }) {
  return (
    <div className="toast toast-end toast-bottom z-50" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} role="status" className={`alert max-w-sm shadow-lg ${TONES[toast.tone] ?? ''}`}>
          <span className="text-sm">{toast.message}</span>
          <div className="flex items-center gap-1">
            {toast.action && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  toast.action.onClick()
                  onDismiss(toast.id)
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-circle btn-xs" onClick={() => onDismiss(toast.id)} aria-label="Bildirimi kapat">
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
